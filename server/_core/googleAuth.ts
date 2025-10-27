import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function setupGoogleAuth(app: Express) {
  // Only set up Google OAuth if credentials are provided
  if (!ENV.googleClientId || !ENV.googleClientSecret) {
    console.log("[GoogleAuth] Google OAuth not configured - skipping");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.googleClientId,
        clientSecret: ENV.googleClientSecret,
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Use Google ID as openId
          const openId = `google_${profile.id}`;
          const email = profile.emails?.[0]?.value || null;
          const name = profile.displayName || null;

          // Upsert user in database
          await db.upsertUser({
            openId,
            name,
            email,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });

          const user = await db.getUserByOpenId(openId);
          done(null, user);
        } catch (error) {
          console.error("[GoogleAuth] Error during authentication:", error);
          done(error as Error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.openId);
  });

  // Deserialize user from session
  passport.deserializeUser(async (openId: string, done) => {
    try {
      const user = await db.getUserByOpenId(openId);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/?error=auth_failed",
    }),
    async (req, res) => {
      try {
        const user = req.user as any;
        if (!user || !user.openId) {
          res.redirect("/?error=no_user");
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
        console.error("[GoogleAuth] Callback error:", error);
        res.redirect("/?error=callback_failed");
      }
    }
  );

  console.log("[GoogleAuth] Google OAuth routes registered");
}

