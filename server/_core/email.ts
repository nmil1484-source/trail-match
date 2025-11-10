import { ENV } from './env';

/**
 * Email service for sending password reset emails
 * Uses AWS SES (Simple Email Service)
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using AWS SES
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  try {
    // For now, we'll log the email instead of actually sending it
    // In production, you would integrate with AWS SES or another email service
    console.log('[Email] Would send email:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log(`Text: ${text || 'No plain text version'}`);
    
    // TODO: Integrate with AWS SES
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: 'us-west-2' });
    // await ses.sendEmail({
    //   Source: ENV.emailFrom,
    //   Destination: { ToAddresses: [to] },
    //   Message: {
    //     Subject: { Data: subject },
    //     Body: {
    //       Html: { Data: html },
    //       Text: { Data: text || html.replace(/<[^>]*>/g, '') }
    //     }
    //   }
    // }).promise();
    
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  const resetUrl = `${ENV.frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TrailMatch</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          <p>We received a request to reset your password for your TrailMatch account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        <div class="footer">
          <p>TrailMatch - Find Your Trail Crew</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    TrailMatch - Password Reset Request
    
    Hi${userName ? ` ${userName}` : ''},
    
    We received a request to reset your password for your TrailMatch account.
    
    Click this link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    
    TrailMatch - Find Your Trail Crew
  `;
  
  return sendEmail({
    to: email,
    subject: 'Reset Your TrailMatch Password',
    html,
    text,
  });
}


/**
 * Send trip join request notification to organizer
 */
export async function sendTripJoinRequestEmail(
  organizerEmail: string,
  organizerName: string,
  requesterName: string,
  tripTitle: string,
  tripId: number
): Promise<boolean> {
  const tripUrl = `${ENV.frontendUrl}/trip/${tripId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TrailMatch</h1>
        </div>
        <div class="content">
          <h2>New Trip Join Request</h2>
          <p>Hi ${organizerName},</p>
          <p><strong>${requesterName}</strong> has requested to join your trip:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${tripTitle}</p>
          <p>Review their profile and vehicle details to decide if they're a good fit for your trip.</p>
          <p style="text-align: center;">
            <a href="${tripUrl}" class="button">View Request</a>
          </p>
        </div>
        <div class="footer">
          <p>TrailMatch - Find Your Trail Crew</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: organizerEmail,
    subject: `New join request for "${tripTitle}"`,
    html,
  });
}

/**
 * Send trip request accepted notification to requester
 */
export async function sendTripRequestAcceptedEmail(
  requesterEmail: string,
  requesterName: string,
  organizerName: string,
  tripTitle: string,
  tripId: number
): Promise<boolean> {
  const tripUrl = `${ENV.frontendUrl}/trip/${tripId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TrailMatch</h1>
        </div>
        <div class="content">
          <h2>🎉 Your Request Was Accepted!</h2>
          <p>Hi ${requesterName},</p>
          <p>Great news! <strong>${organizerName}</strong> has accepted your request to join:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${tripTitle}</p>
          <p>View the trip details and connect with other participants.</p>
          <p style="text-align: center;">
            <a href="${tripUrl}" class="button">View Trip Details</a>
          </p>
        </div>
        <div class="footer">
          <p>TrailMatch - Find Your Trail Crew</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: requesterEmail,
    subject: `You're in! Request accepted for "${tripTitle}"`,
    html,
  });
}

/**
 * Send trip reminder email (1 day before trip)
 */
export async function sendTripReminderEmail(
  userEmail: string,
  userName: string,
  tripTitle: string,
  tripLocation: string,
  startDate: Date,
  tripId: number
): Promise<boolean> {
  const tripUrl = `${ENV.frontendUrl}/trip/${tripId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .trip-info { background: white; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TrailMatch</h1>
        </div>
        <div class="content">
          <h2>Trip Reminder: Tomorrow!</h2>
          <p>Hi ${userName},</p>
          <p>Your trip is starting tomorrow! Here are the details:</p>
          <div class="trip-info">
            <p><strong>Trip:</strong> ${tripTitle}</p>
            <p><strong>Location:</strong> ${tripLocation}</p>
            <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
          </div>
          <p>Make sure your vehicle is ready and you have all necessary gear!</p>
          <p style="text-align: center;">
            <a href="${tripUrl}" class="button">View Trip Details</a>
          </p>
        </div>
        <div class="footer">
          <p>TrailMatch - Find Your Trail Crew</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: `Reminder: "${tripTitle}" starts tomorrow!`,
    html,
  });
}
