import type { Express } from "express";
import jwt from "jsonwebtoken";
import appleSignin from "apple-signin-auth";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function setupAppleAuth(app: Express) {
  // Only set up Apple Sign In if credentials are provided
  if (!ENV.appleClientId || !ENV.appleTeamId || !ENV.appleKeyId || !ENV.applePrivateKey) {
    console.log("[AppleAuth] Apple Sign In not configured - skipping");
    return;
  }

  // Apple Sign In callback endpoint
  app.post("/api/auth/apple/callback", async (req, res) => {
    try {
      const { id_token, code } = req.body;

      if (!id_token && !code) {
        res.redirect("/?error=missing_token");
        return;
      }

      // Verify the Apple ID token
      const appleIdTokenClaims = await appleSignin.verifyIdToken(id_token || code, {
        audience: ENV.appleClientId,
        ignoreExpiration: false,
      });

      const appleUserId = appleIdTokenClaims.sub;
      const email = appleIdTokenClaims.email || null;
      const name = req.body.user?.name
        ? `${req.body.user.name.firstName} ${req.body.user.name.lastName}`
        : null;

      // Use Apple ID as openId
      const openId = `apple_${appleUserId}`;

      // Upsert user in database
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "apple",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.redirect("/?error=user_creation_failed");
        return;
      }

      // Create JWT session token
      const sessionToken = jwt.sign(
        { userId: user.id, openId: user.openId, email: user.email },
        ENV.jwtSecret,
        { expiresIn: "7d" }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      // Redirect to home
      res.redirect("/");
    } catch (error) {
      console.error("[AppleAuth] Callback error:", error);
      res.redirect("/?error=apple_auth_failed");
    }
  });

  console.log("[AppleAuth] Apple Sign In routes registered");
}

