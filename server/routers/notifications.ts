import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db/index";
import { pushSubscriptions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import webpush from "web-push";
import { ENV } from "../_core/env";

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = 'BMcHEDjKuuAf9Wp1HKZSoqpSv6swW0QJUHz9PVksaLPo4wU5K8AiecBl7YiLA2ojmGMJVmK6lDgmFNx5VQMPlsk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '1JMcympWWFXPqMMROPVd6KvETNULWXm8fBC0VTHanSM';

webpush.setVapidDetails(
  'mailto:trailmatchsite@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export const notificationsRouter = router({
  // Subscribe to push notifications
  subscribe: protectedProcedure
    .input(z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      
      // Check if subscription already exists for this endpoint
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, userId),
            eq(pushSubscriptions.endpoint, input.subscription.endpoint)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await db
          .update(pushSubscriptions)
          .set({
            keys: input.subscription.keys,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, existing[0].id));
        
        return { success: true, message: 'Subscription updated' };
      }

      // Create new subscription
      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: input.subscription.endpoint,
        keys: input.subscription.keys,
      });

      return { success: true, message: 'Subscribed to notifications' };
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user!.id;
      
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      return { success: true, message: 'Unsubscribed from notifications' };
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      tripNotifications: z.boolean().optional(),
      messageNotifications: z.boolean().optional(),
      tripUpdateNotifications: z.boolean().optional(),
      reminderNotifications: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      
      const userSubscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      if (userSubscriptions.length === 0) {
        throw new Error('No subscription found');
      }

      await db
        .update(pushSubscriptions)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.userId, userId));

      return { success: true, message: 'Preferences updated' };
    }),

  // Get current notification preferences
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user!.id;
      
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId))
        .limit(1);

      if (subscriptions.length === 0) {
        return {
          isSubscribed: false,
          tripNotifications: true,
          messageNotifications: true,
          tripUpdateNotifications: true,
          reminderNotifications: true,
        };
      }

      const sub = subscriptions[0];
      return {
        isSubscribed: true,
        tripNotifications: sub.tripNotifications,
        messageNotifications: sub.messageNotifications,
        tripUpdateNotifications: sub.tripUpdateNotifications,
        reminderNotifications: sub.reminderNotifications,
      };
    }),

  // Send a test notification
  sendTest: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user!.id;
      
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      if (subscriptions.length === 0) {
        throw new Error('No subscription found');
      }

      const payload = JSON.stringify({
        title: 'TrailMatch Test Notification',
        body: 'Push notifications are working! You\'ll receive updates about trips, messages, and more.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        data: {
          url: '/',
        },
      });

      // Send to all user's subscriptions
      const promises = subscriptions.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys as { p256dh: string; auth: string },
        };
        
        return webpush.sendNotification(pushSubscription, payload)
          .catch(error => {
            console.error('Error sending notification:', error);
            // If subscription is invalid, delete it
            if (error.statusCode === 410) {
              db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
            }
          });
      });

      await Promise.all(promises);

      return { success: true, message: 'Test notification sent' };
    }),
});

// Helper function to send notifications to specific users
export async function sendNotificationToUser(
  userId: number,
  title: string,
  body: string,
  data?: any,
  notificationType?: 'trip' | 'message' | 'tripUpdate' | 'reminder'
) {
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subscriptions.length === 0) {
    return;
  }

  // Filter by notification preferences
  const filteredSubs = subscriptions.filter(sub => {
    if (notificationType === 'trip' && !sub.tripNotifications) return false;
    if (notificationType === 'message' && !sub.messageNotifications) return false;
    if (notificationType === 'tripUpdate' && !sub.tripUpdateNotifications) return false;
    if (notificationType === 'reminder' && !sub.reminderNotifications) return false;
    return true;
  });

  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: data || {},
  });

  const promises = filteredSubs.map(sub => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: sub.keys as { p256dh: string; auth: string },
    };
    
    return webpush.sendNotification(pushSubscription, payload)
      .catch(error => {
        console.error('Error sending notification:', error);
        // If subscription is invalid (expired/unsubscribed), delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      });
  });

  await Promise.all(promises);
}

// Helper function to send notifications to multiple users
export async function sendNotificationToUsers(
  userIds: number[],
  title: string,
  body: string,
  data?: any,
  notificationType?: 'trip' | 'message' | 'tripUpdate' | 'reminder'
) {
  const promises = userIds.map(userId => 
    sendNotificationToUser(userId, title, body, data, notificationType)
  );
  
  await Promise.all(promises);
}
