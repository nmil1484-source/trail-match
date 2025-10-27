import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

let resend: Resend | null = null;

// Initialize Resend only if API key is provided
if (ENV.emailApiKey) {
  resend = new Resend(ENV.emailApiKey);
  console.log("[PasswordReset] Email service initialized");
} else {
  console.log("[PasswordReset] Email service not configured - password reset disabled");
}

export interface ResetTokenPayload {
  userId: number;
  email: string;
  type: "password_reset";
}

export function generateResetToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email, type: "password_reset" } as ResetTokenPayload,
    ENV.jwtSecret,
    { expiresIn: "1h" } // Reset token expires in 1 hour
  );
}

export function verifyResetToken(token: string): ResetTokenPayload | null {
  try {
    const payload = jwt.verify(token, ENV.jwtSecret) as ResetTokenPayload;
    if (payload.type !== "password_reset") {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[PasswordReset] Cannot send email: email service not configured");
    return false;
  }

  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: "TrailMatch <noreply@trail-match.com>",
      to: email,
      subject: "Reset Your TrailMatch Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>TrailMatch</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>You requested to reset your password for your TrailMatch account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2025 TrailMatch. Find your trail crew.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[PasswordReset] Reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[PasswordReset] Failed to send email:", error);
    return false;
  }
}

