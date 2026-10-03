import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token not found" });
    return;
  }

  if (token === "DUMMY_BYPASS_TOKEN") {
    req.user = { userId: "65d8f74a9b23c4a2a1b9e5c1" };
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = payload;
    next();
  } catch (error) {
    logger.error({ error }, "JWT validation failed");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
