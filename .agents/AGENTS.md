# DermaCheck — Agent Workflow & Architecture Guidelines

> **Project**: DermaCheck (formerly GlowCheck)
> **Type**: AI-powered cosmetic skin-concern screening app (NOT a medical device)
> **Framing**: A beauty/skincare guidance tool — always show disclaimers.
> **GitHub Remote**: `https://github.com/Abu-Hojayfa/DERMA.git` (branch: `main`)
> **⚠️ Git Rule**: Never push unless the user explicitly says "push".

---

## 📁 Project Structure

```
DermaCheck-mobile-app/
├── artifacts/
│   ├── derma-check/        ← React Native / Expo mobile app
│   └── api-server/         ← Express + Mongoose backend (Node.js)
├── lib/
│   ├── db/                 ← Mongoose models (MongoDB)
│   ├── api-zod/            ← Shared Zod validation schemas (API contract)
│   └── api-client-react/   ← React Query hooks for the mobile app
└── .agents/
    └── AGENTS.md           ← This file
```

> ⚠️ **There is NO Python microservice.** All AI/ML work is handled via external hosted APIs called directly from the Express API server.

---

## 🏗️ Confirmed Safest Architecture (NO Python, NO unverified HF APIs)

```
[React Native App]
       ↓  HTTP (React Query via api-client-react)
[Express API Server — artifacts/api-server]
       ├──→ Google AI Studio — Gemini 2.5 Flash (PRIMARY)
       │       - Image sent as base64 → Gemini Vision analyzes it
       │       - Returns: condition type, severity, concern description
       │       - Free tier: 1,500 req/day — verified ✅
       │       - Docs: https://ai.google.dev/gemini-api/docs
       │
       ├──→ Groq API — Llama 3.3 70B (CARE CARD GENERATION)
       │       - Receives structured JSON from Gemini (no raw image)
       │       - Generates: friendly care card, routine steps, ingredients, urgency
       │       - Free tier: very generous — verified ✅
       │       - Docs: https://console.groq.com/docs
       │
       └──→ MongoDB Atlas via Mongoose  (persist users, spots, history)
               - Free M0 tier: 512 MB, always-online, no credit card ✅
               - https://mongodb.com/atlas
```

> ⚠️ **Why NOT HuggingFace Inference API for these models?**
> We verified live on huggingface.co that `tuphamdf/skincare-detection` explicitly shows
> "Ask for provider support" — meaning it has NO active hosted inference endpoint.
> The other two models' API status could not be confirmed without JS rendering.
> Rather than build on an uncertain foundation, we use **Gemini Vision** which is
> confirmed working, free, and multimodal.

---

## 🤖 External AI Services (Verified)

### 1. Google AI Studio — Gemini 2.5 Flash (Image Analysis)

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Auth**: `Authorization: Bearer ${GOOGLE_AI_API_KEY}`
- **Input**: Base64 image + prompt asking it to classify skin concern
- **Free tier**: 1,500 requests/day ✅
- **Key advantage**: Natively multimodal — no separate CV pipeline needed
- **Prompt pattern** (from Express server):
  ```json
  {
    "contents": [{
      "parts": [
        { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } },
        { "text": "You are a cosmetic skin concern screening assistant (NOT a medical device). Analyze this skin photo and return JSON with: { concernType, severity, description, bodyRegionHint }. Always include a disclaimer that this is cosmetic guidance only." }
      ]
    }]
  }
  ```

### 2. Groq API — Care Card LLM

- **Model**: `llama-3.3-70b-versatile`
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible)
- **Auth**: `Authorization: Bearer ${GROQ_API_KEY}`
- **Input**: Structured JSON from Gemini (no raw image ever sent to Groq)
- **Output**: Friendly care card — plain-language explanation, routine steps, ingredients, urgency flag
- **Free tier**: Very generous (verified at console.groq.com) ✅

---

## 🗄️ Database (MongoDB Atlas — Mongoose models in lib/db/src/models)

> **Connection**: Set `MONGODB_URI` to your Atlas M0 connection string (free, always-online).
> No migrations needed — Mongoose handles schema at the application layer.

| Collection | Key Fields |
|---|---|
| `users` | _id, email, passwordHash, name, skinToneEstimate, createdAt |
| `spots` | _id, userId (ref User), label, bodyRegion, createdAt |
| `photoentries` | _id, spotId (ref Spot), imageUrl, capturedAt, concernType, severity, confidence |
| `carecards` | _id, photoEntryId (ref PhotoEntry), generatedText, routineSteps[], ingredients[], urgencyLevel |

---

## 🔌 API Endpoints to Build (artifacts/api-server)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, return session token |
| `GET` | `/api/spots` | Get all spots for current user |
| `POST` | `/api/spots` | Create a new tracked spot |
| `POST` | `/api/spots/:id/scan` | Upload image → HF classify → Groq care card → save |
| `GET` | `/api/spots/:id/history` | Get all photo entries + care cards for a spot |
| `GET` | `/api/health` | Health check (already exists) |

---

## 🧩 Shared Zod Schemas (lib/api-zod)

Define request/response types here so both the server and client stay in sync. Each endpoint above should have a matching Zod schema.

---

## 💅 Mobile App Screens (artifacts/derma-check)

| Screen | Status | Notes |
|---|---|---|
| Login (`app/index.tsx`) | ✅ UI done | Wire to `/api/auth/login` |
| Sign Up (`app/signup.tsx`) | ✅ UI done | Wire to `/api/auth/register` |
| Home (`app/(tabs)/home.tsx`) | ✅ UI done | Wire recent activity to real data |
| Scan (`app/(tabs)/scan.tsx`) | ⚠️ Placeholder | Implement image capture → POST to `/api/spots/:id/scan` |
| History (`app/(tabs)/history.tsx`) | ⚠️ Placeholder | Wire to `/api/spots/:id/history` |
| Profile (`app/(tabs)/profile.tsx`) | ⚠️ Partial | Wire to user data |
| Assistant (`app/assistant.tsx`) | ⚠️ Local only | Optionally wire to Groq for real AI chat |

---

## 🎨 Design System Rules

Based on `GlowCheck_Design_Direction.docx`:

- **Color Palette**: Blush pink `#F2AFC0` (primary), Soft lavender `#C9A8E0` (secondary), Warm ivory `#FFF9F5` (background), Dusty coral `#F5B896` (accent)
- **Typography**: Rounded sans-serif (Inter is acceptable), generous line-height, avoid harsh geometric fonts
- **Shape**: Rounded corners everywhere (16–24px radius), soft drop shadows, no hard borders
- **Tone**: Warm & conversational — "Let's take a look at that spot" not "Upload image for analysis"
- **Iconography**: Sparkles, droplets, botanical flourishes — not clinical flat icons
- **Animations**: Gentle fade/scale transitions, soft pulsing glow on capture button

---

## ⚙️ Development Workflow

1. **Package Manager**: Always use `pnpm`
2. **DB Changes**: Edit `lib/db/src/models/index.ts` (Mongoose schemas — no migrations, just restart)
3. **API Changes**: Define Zod schemas in `lib/api-zod` first, then implement in Express
4. **Run Frontend**: `pnpm run dev` in `artifacts/derma-check`
5. **Run Backend**: `pnpm run dev` in `artifacts/api-server`

## 🔑 Environment Variables Needed

```env
# artifacts/api-server/.env  (copy from .env.example)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/dermacheck?retryWrites=true&w=majority
GOOGLE_AI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
JWT_SECRET=your-long-random-secret
PORT=3000
```

---

## ✅ Build Order (Recommended)

1. **DB Schemas** → define tables in `lib/db/src/schema`
2. **Zod Schemas** → define API contracts in `lib/api-zod`
3. **Backend Routes** → implement Express endpoints in `artifacts/api-server`
4. **Image → AI Pipeline** → `/api/spots/:id/scan` route (HF + Groq calls)
5. **Frontend Wiring** → connect React Native screens to real API
6. **Assistant** → wire chat to Groq for real responses
