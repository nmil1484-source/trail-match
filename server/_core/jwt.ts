import jwt from "jsonwebtoken";
import { ENV } from "./env";

export interface JWTPayload {
  openId: string;
  appId: string;
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, ENV.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

