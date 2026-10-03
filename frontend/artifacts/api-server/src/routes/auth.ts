import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@workspace/db";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const validated = RegisterUserBody.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Invalid input", details: validated.error.format() });
      return;
    }

    const { email, password, name } = validated.data;
    
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        skinToneEstimate: user.skinToneEstimate,
        createdAt: user.createdAt,
      },
      token
    });
  } catch (error) {
    logger.error({ error }, "Error during registration");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const validated = LoginUserBody.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Invalid input", details: validated.error.format() });
      return;
    }

    const { email, password } = validated.data;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        skinToneEstimate: user.skinToneEstimate,
        createdAt: user.createdAt,
      },
      token
    });
  } catch (error) {
    logger.error({ error }, "Error during login");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
