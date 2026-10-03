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
  // BYPASS AUTH FOR TESTING
  req.user = { userId: "65d8f74a9b23c4a2a1b9e5c1" };
  return next();
}
