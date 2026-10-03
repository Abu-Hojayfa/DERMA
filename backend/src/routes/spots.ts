import { Router, type Response } from "express";
import { Spot, PhotoEntry, CareCard } from "@derma/db";
import { CreateSpotBody, ScanSpotBody } from "@derma/api-zod";
import { logger } from "../lib/logger";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Verified live-responding models (newest → oldest for stability fallback)
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

async function callGemini(body: object, retries = 5): Promise<any> {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        logger.info({ model, attempt }, "Gemini succeeded");
        return res.json();
      }
      const isRetryable = res.status === 503 || res.status === 429;
      logger.warn({ model, attempt, status: res.status }, "Gemini attempt failed");
      if (!isRetryable || attempt === retries) break;
      await new Promise(r => setTimeout(r, 800 * attempt));
    }
  }
  throw new Error("All Gemini models failed");
}

router.use("/spots", requireAuth);

router.get("/spots", async (req: AuthRequest, res: Response) => {
  try {
    const spots = await Spot.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(spots.map(s => ({
      id: s._id.toString(),
      userId: s.userId.toString(),
      label: s.label,
      bodyRegion: s.bodyRegion,
      createdAt: s.createdAt,
    })));
  } catch (error) {
    logger.error({ error }, "Error fetching spots");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/spots", async (req: AuthRequest, res: Response) => {
  try {
    const validated = CreateSpotBody.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Invalid input", details: validated.error.format() });
      return;
    }

    const { label, bodyRegion } = validated.data;
    const spot = await Spot.create({
      userId: req.user!.userId,
      label,
      bodyRegion,
    });

    res.json({
      id: spot._id.toString(),
      userId: spot.userId.toString(),
      label: spot.label,
      bodyRegion: spot.bodyRegion,
      createdAt: spot.createdAt,
    });
  } catch (error) {
    logger.error({ error }, "Error creating spot");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/spots/:id/history", async (req: AuthRequest, res: Response) => {
  try {
    const spotId = req.params.id;
    const spot = await Spot.findOne({ _id: spotId, userId: req.user!.userId });
    if (!spot) {
      res.status(404).json({ error: "Spot not found" });
      return;
    }

    const photos = await PhotoEntry.find({ spotId }).sort({ capturedAt: -1 });
    const photoIds = photos.map(p => p._id);
    const careCards = await CareCard.find({ photoEntryId: { $in: photoIds } });

    const result = photos.map(photo => {
      const card = careCards.find(c => c.photoEntryId.toString() === photo._id.toString());
      return {
        photoEntry: {
          id: photo._id.toString(),
          spotId: photo.spotId.toString(),
          imageUrl: photo.imageUrl,
          capturedAt: photo.capturedAt,
          concernType: photo.concernType,
          severity: photo.severity,
          confidence: photo.confidence,
        },
        careCard: card ? {
          id: card._id.toString(),
          photoEntryId: card.photoEntryId.toString(),
          generatedText: card.generatedText,
          routineSteps: card.routineSteps,
          ingredients: card.ingredients,
          urgencyLevel: card.urgencyLevel,
          createdAt: card.createdAt,
        } : undefined
      };
    });

    res.json(result);
  } catch (error) {
    logger.error({ error }, "Error fetching spot history");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/spots/:id/scan", async (req: AuthRequest, res: Response) => {
  try {
    const spotId = req.params.id;
    const spot = await Spot.findOne({ _id: spotId, userId: req.user!.userId });
    if (!spot) {
      res.status(404).json({ error: "Spot not found" });
      return;
    }

    const validated = ScanSpotBody.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Invalid input", details: validated.error.format() });
      return;
    }

    if (!GOOGLE_AI_API_KEY || !GROQ_API_KEY) {
      res.status(500).json({ error: "AI services are not configured" });
      return;
    }

    const base64Data = validated.data.base64Image.replace(/^data:image\/\w+;base64,/, "");

    // 1. Call Gemini (with retry + model fallback)
    const geminiBody = {
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: "You are DermaCheck, a cosmetic skin concern screening assistant (NOT a medical device). First, strictly verify if the image is a photo of human skin. If it is NOT a photo of skin or is irrelevant to skincare, you MUST return JSON with concernType as 'Invalid Image' and explain in the description that you only analyze skin photos for the DermaCheck app. If it IS skin, analyze it and return JSON with exactly these keys: { \"concernType\": string, \"severity\": \"mild\"|\"moderate\"|\"severe\", \"description\": string, \"bodyRegionHint\": string }. Always include a disclaimer that this is cosmetic guidance only in the description." }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    };

    let geminiData: any;
    try {
      geminiData = await callGemini(geminiBody);
    } catch (e) {
      logger.error({ e }, "All Gemini retries exhausted");
      res.status(502).json({ error: "Image analysis failed. The AI service is temporarily unavailable. Please try again in a moment." });
      return;
    }
    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const analysis = JSON.parse(geminiText);

    let carePlan;
    
    // Check if we already have a care card for this similar case in the database
    const similarPhoto = await PhotoEntry.findOne({
      concernType: analysis.concernType,
      severity: analysis.severity
    });
    
    if (similarPhoto) {
      const existingCard = await CareCard.findOne({ photoEntryId: similarPhoto._id });
      if (existingCard) {
        carePlan = {
          generatedText: existingCard.generatedText,
          routineSteps: existingCard.routineSteps,
          ingredients: existingCard.ingredients,
          urgencyLevel: existingCard.urgencyLevel
        };
      }
    }

    if (!carePlan) {
      // 2. Call Groq for Care Card
      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const groqBody = {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a friendly cosmetic skincare assistant. You receive an analysis of a skin spot. Output a JSON object with: { \"generatedText\": string (friendly explanation), \"routineSteps\": string[] (suggested skincare steps), \"ingredients\": string[] (helpful cosmetic ingredients), \"urgencyLevel\": \"low\"|\"medium\"|\"high\" }." },
          { role: "user", content: JSON.stringify(analysis) }
        ],
        response_format: { type: "json_object" }
      };

      const groqRes = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(groqBody)
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        logger.error({ status: groqRes.status, errText }, "Groq API failed");
        res.status(502).json({ error: "Care card generation failed" });
        return;
      }

      const groqData = await groqRes.json() as any;
      const groqContent = groqData.choices?.[0]?.message?.content || "{}";
      carePlan = JSON.parse(groqContent);
    }

    // 3. Save to MongoDB
    const photoEntry = await PhotoEntry.create({
      spotId: spot._id,
      imageUrl: "data:image/jpeg;base64," + base64Data, // Normally you'd upload to S3/GCS
      concernType: analysis.concernType || "Unknown",
      severity: analysis.severity || "mild",
      confidence: 0.9,
    });

    const careCard = await CareCard.create({
      photoEntryId: photoEntry._id,
      generatedText: carePlan.generatedText || analysis.description,
      routineSteps: carePlan.routineSteps || [],
      ingredients: carePlan.ingredients || [],
      urgencyLevel: carePlan.urgencyLevel || "low",
    });

    res.json({
      photoEntry: {
        id: photoEntry._id.toString(),
        spotId: photoEntry.spotId.toString(),
        imageUrl: photoEntry.imageUrl,
        capturedAt: photoEntry.capturedAt,
        concernType: photoEntry.concernType,
        severity: photoEntry.severity,
        confidence: photoEntry.confidence,
      },
      careCard: {
        id: careCard._id.toString(),
        photoEntryId: careCard.photoEntryId.toString(),
        generatedText: careCard.generatedText,
        routineSteps: careCard.routineSteps,
        ingredients: careCard.ingredients,
        urgencyLevel: careCard.urgencyLevel,
        createdAt: careCard.createdAt,
      }
    });

  } catch (error) {
    logger.error({ error }, "Error during scan pipeline");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
