import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function setupFacebookAuth(app: Express) {
  // Only set up Facebook OAuth if credentials are provided
  if (!ENV.facebookAppId || !ENV.facebookAppSecret) {
    console.log("[FacebookAuth] Facebook OAuth not configured - skipping");
    return;
  }

  passport.use(
    new FacebookStrategy(
      {
        clientID: ENV.facebookAppId,
        clientSecret: ENV.facebookAppSecret,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Use Facebook ID as openId
          const openId = `facebook_${profile.id}`;
          const email = profile.emails?.[0]?.value || null;
          const name = profile.displayName || null;

          // Upsert user in database
          await db.upsertUser({
            openId,
            name,
            email,
            loginMethod: "facebook",
            lastSignedIn: new Date(),
          });

          const user = await db.getUserByOpenId(openId);
          done(null, user);
        } catch (error) {
          console.error("[FacebookAuth] Error during authentication:", error);
          done(error as Error);
        }
      }
    )
  );

  // Facebook OAuth routes
  app.get(
    "/api/auth/facebook",
    passport.authenticate("facebook", {
      scope: ["email"],
      session: false,
    })
  );

  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", {
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
        console.error("[FacebookAuth] Callback error:", error);
        res.redirect("/?error=callback_failed");
      }
    }
  );

  console.log("[FacebookAuth] Facebook OAuth routes registered");
}

