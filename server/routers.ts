import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notificationsRouter } from "./routers/notifications";
import * as db from "./db";
import { ENV } from "./_core/env";
import { createEmailUser, authenticateEmailUser } from "./auth";
import { signToken } from "./_core/jwt";

export const appRouter = router({
  system: systemRouter,
  notifications: notificationsRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    notificationCount: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return 0;
      const requests = await db.getPendingRequestsForOrganizer(ctx.user.id);
      return requests.length;
    }),
    
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {

        
        try {
          const user = await createEmailUser(input.email, input.password, input.name);
          
          // Get full user data
          const fullUser = await db.getUserByEmail(input.email);
          if (!fullUser) throw new Error("User creation failed");
          
          // Create session token with required fields: openId, appId, name
          const token = signToken({ 
            openId: fullUser.openId!, 
            appId: ENV.appId,
            name: fullUser.name || fullUser.email || 'User'
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
          
          return { success: true, user: fullUser };
        } catch (error: any) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: error.message || "Signup failed" 
          });
        }
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {

        
        const user = await authenticateEmailUser(input.email, input.password);
        if (!user) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Invalid email or password" 
          });
        }
        
        // Create session token with required fields: openId, appId, name
        const token = signToken({ 
          openId: user.openId!, 
          appId: ENV.appId,
          name: user.name || user.email || 'User'
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    update: protectedProcedure
      .input(z.object({
        location: z.string().optional(),
        experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        bio: z.string().optional(),
        profilePhoto: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  vehicles: router({
    create: protectedProcedure
      .input(z.object({
        make: z.string(),
        model: z.string(),
        year: z.number(),
        buildLevel: z.enum(["stock", "mild", "moderate", "heavy"]).default("stock"),
        liftHeight: z.string().optional(),
        tireSize: z.string().optional(),
        hasWinch: z.boolean().default(false),
        hasLockers: z.boolean().default(false),
        hasArmor: z.boolean().default(false),
        hasSuspensionUpgrade: z.boolean().default(false),
        modifications: z.array(z.string()).optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const vehicleId = await db.createVehicle({
          ...input,
          userId: ctx.user.id,
          modifications: input.modifications || [],
          photos: input.photos || [],
        });
        return { vehicleId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getVehiclesByUserId(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getVehicleById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        buildLevel: z.enum(["stock", "mild", "moderate", "heavy"]).optional(),
        liftHeight: z.string().optional(),
        tireSize: z.string().optional(),
        hasWinch: z.boolean().optional(),
        hasLockers: z.boolean().optional(),
        hasArmor: z.boolean().optional(),
        hasSuspensionUpgrade: z.boolean().optional(),
        modifications: z.array(z.string()).optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const vehicle = await db.getVehicleById(id);
        if (!vehicle || vehicle.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateVehicle(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const vehicle = await db.getVehicleById(input.id);
        if (!vehicle || vehicle.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteVehicle(input.id);
        return { success: true };
      }),
  }),

  trips: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        location: z.string(),
        state: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
        styles: z.array(z.string()),
        maxParticipants: z.number().default(6),
        minTireSize: z.string().optional(),
        requiresWinch: z.boolean().default(false),
        requiresLockers: z.boolean().default(false),
        vehicleRequirement: z.enum([
          "2wd",
          "4x4_stock",
          "4x4_modded",
          "2wd_prerunner",
          "4wd_prerunner",
          "raptor",
          "long_travel_fast",
          "long_travel_slow"
        ]).optional(),
        photos: z.array(z.string()).optional(),
        itinerary: z.string().optional(),
        campingInfo: z.string().optional(),
        communicationMethods: z.array(z.string()).optional(),
        phoneNumber: z.string().optional(),
        whatsappNumber: z.string().optional(),
        facebookHandle: z.string().optional(),
        instagramHandle: z.string().optional(),
        isPrivate: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate share token for private trips
        const shareToken = input.isPrivate 
          ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          : null;
        
        const tripId = await db.createTrip({
          ...input,
          organizerId: ctx.user.id,
          currentParticipants: 1,
          styles: input.styles,
          photos: input.photos || [],
          shareToken,
        });
        
        // Send notifications to users in the same area (async, don't wait)
        if (!input.isPrivate) {
          import("./routers/notifications").then(async ({ sendNotificationToUsers }) => {
            try {
              // Get users in the same state/area
              const users = await db.getUsersByLocation(input.state || input.location);
              const userIds = users.filter(u => u.id !== ctx.user.id).map(u => u.id);
              
              if (userIds.length > 0) {
                await sendNotificationToUsers(
                  userIds,
                  `New Trip: ${input.title}`,
                  `${input.location} · ${input.startDate.toLocaleDateString()} · ${input.difficulty}`,
                  { url: `/trip/${tripId}`, tripId },
                  'trip'
                );
              }
            } catch (error) {
              console.error('Error sending trip notifications:', error);
            }
          });
        }
        
        return { tripId, shareToken };
      }),

    list: publicProcedure
      .input(z.object({
        location: z.string().optional(),
        styles: z.array(z.string()).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Check and expire premium trips first
        // Temporarily disabled - was causing infinite loading
        // await db.checkAndExpirePremiumTrips();
        
        const allTrips = await db.getAllTrips();
        
        if (!input) return allTrips;

        return allTrips.filter(trip => {
          if (input.location && !trip.location.toLowerCase().includes(input.location.toLowerCase())) {
            return false;
          }
          if (input.difficulty && trip.difficulty !== input.difficulty) {
            return false;
          }
          if (input.styles && input.styles.length > 0) {
            const tripStyles = trip.styles as string[] || [];
            const hasMatchingStyle = input.styles.some(style => tripStyles.includes(style));
            if (!hasMatchingStyle) return false;
          }
          if (input.startDate && new Date(trip.startDate) < input.startDate) {
            return false;
          }
          if (input.endDate && new Date(trip.endDate) > input.endDate) {
            return false;
          }
          return true;
        });
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTripById(input.id);
      }),

    myTrips: protectedProcedure.query(async ({ ctx }) => {
      const organized = await db.getTripsByOrganizer(ctx.user.id);
      const joined = await db.getUserTrips(ctx.user.id);
      return { organized, joined: joined.map(j => j.trip) };
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        state: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        styles: z.array(z.string()).optional(),
        maxParticipants: z.number().optional(),
        status: z.enum(["open", "full", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const trip = await db.getTripById(id);
        const isAdmin = ctx.user.role === 'admin';
        if (!trip || (trip.organizerId !== ctx.user.id && !isAdmin)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateTrip(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id);
        const isAdmin = ctx.user.role === 'admin';
        if (!trip || (trip.organizerId !== ctx.user.id && !isAdmin)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteTrip(input.id);
        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id);
        const isAdmin = ctx.user.role === 'admin';
        if (!trip || (trip.organizerId !== ctx.user.id && !isAdmin)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Cancel the trip and get participants
        const participants = await db.cancelTrip(input.id);
        
        // Send notifications to all participants (async, don't wait)
        if (participants.length > 0) {
          import("./routers/notifications").then(async ({ sendNotificationToUser }) => {
            try {
              for (const participant of participants) {
                if (participant.status === 'accepted') {
                  await sendNotificationToUser(
                    participant.userId,
                    `Trip Cancelled: ${trip.title}`,
                    `The trip "${trip.title}" on ${new Date(trip.startDate).toLocaleDateString()} has been cancelled by the organizer.`,
                    { url: `/trip/${input.id}`, tripId: input.id },
                    'tripUpdate'
                  );
                }
              }
            } catch (error) {
              console.error('Error sending cancellation notifications:', error);
            }
          });
        }
        
        return { success: true };
      }),

    // Create payment intent for premium trip upgrade
    createPaymentIntent: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        tier: z.enum(["featured", "premium"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId);
        if (!trip || trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only upgrade your own trips" });
        }

        // Import stripe service
        const { createTripPaymentIntent } = await import("./_core/stripe");

        // Determine amount based on tier
        const amount = input.tier === "featured" ? 99 : 199; // $0.99 or $1.99 in cents

        const paymentIntent = await createTripPaymentIntent(
          amount,
          input.tripId,
          ctx.user.id,
          input.tier
        );

        return {
          clientSecret: paymentIntent.client_secret,
          amount,
        };
      }),

    // Confirm payment and upgrade trip
    confirmPremiumUpgrade: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        paymentIntentId: z.string(),
        tier: z.enum(["featured", "premium"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId);
        if (!trip || trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only upgrade your own trips" });
        }

        // Import stripe service
        const { verifyPayment } = await import("./_core/stripe");

        // Verify payment was successful
        const paymentSuccessful = await verifyPayment(input.paymentIntentId);
        if (!paymentSuccessful) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Payment verification failed" });
        }

        // Upgrade trip to premium tier (30 days)
        await db.upgradeTripToPremium(input.tripId, input.tier, 30);

        return { success: true };
      }),
  }),

  participants: router({
    requestJoin: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        vehicleId: z.number(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const participantId = await db.requestJoinTrip({
          tripId: input.tripId,
          userId: ctx.user.id,
          vehicleId: input.vehicleId,
          message: input.message,
          status: "pending",
        });
        
        // Send email notification to trip organizer
        const trip = await db.getTripById(input.tripId);
        if (trip) {
          const organizer = await db.getUserById(trip.organizerId);
          if (organizer?.email) {
            const { sendTripJoinRequestEmail } = await import("./_core/email");
            await sendTripJoinRequestEmail(
              organizer.email,
              organizer.name || "Organizer",
              ctx.user.name || "A user",
              trip.title,
              trip.id
            );
          }
        }
        
        return { participantId };
      }),

    listForTrip: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTripParticipants(input.tripId);
      }),

    myPendingRequests: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getPendingRequestsForOrganizer(ctx.user.id);
      }),

    myRequests: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserTripRequests(ctx.user.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        participantId: z.number(),
        tripId: z.number(),
        status: z.enum(["accepted", "declined"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId);
        if (!trip || trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateParticipantStatus(input.participantId, input.status);
        
        // Update trip participant count if accepted
        if (input.status === "accepted") {
          await db.updateTrip(input.tripId, {
            currentParticipants: (trip.currentParticipants || 0) + 1,
          });
          
          // Send email notification to requester
          const participants = await db.getTripParticipants(input.tripId);
          const participant = participants.find(p => p.participant?.id === input.participantId);
          if (participant?.user?.email) {
            const organizer = await db.getUserById(trip.organizerId);
            const { sendTripRequestAcceptedEmail } = await import("./_core/email");
            await sendTripRequestAcceptedEmail(
              participant.user.email,
              participant.user.name || "User",
              organizer?.name || "Organizer",
              trip.title,
              trip.id
            );
          }
        }
        
        return { success: true };
      }),

    addReview: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        organizationRating: z.number().min(1).max(5).optional(),
        communicationRating: z.number().min(1).max(5).optional(),
        wouldJoinAgain: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify trip is in the past
        const trip = await db.getTripById(input.tripId);
        if (!trip) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
        }
        if (new Date(trip.endDate) > new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Can only review past trips" });
        }
        
        // Verify user was a participant
        const isParticipant = await db.isUserTripParticipant(ctx.user.id, input.tripId);
        if (!isParticipant && trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must have participated in this trip to review it" });
        }
        
        // Check if user already reviewed this trip
        const existingReview = await db.getUserTripReview(input.tripId, ctx.user.id);
        if (existingReview) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already reviewed this trip" });
        }
        
        const reviewId = await db.createTripReview({
          ...input,
          userId: ctx.user.id,
          organizerId: trip.organizerId,
        });
        return { reviewId };
      }),

    editReview: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        organizationRating: z.number().min(1).max(5).optional(),
        communicationRating: z.number().min(1).max(5).optional(),
        wouldJoinAgain: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user owns this review
        const review = await db.getUserTripReview(0, ctx.user.id); // Will need to update this
        if (!review || review.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own reviews" });
        }
        
        await db.updateTripReview(input.reviewId, {
          rating: input.rating,
          reviewText: input.reviewText,
          organizationRating: input.organizationRating,
          communicationRating: input.communicationRating,
          wouldJoinAgain: input.wouldJoinAgain,
        });
        return { success: true };
      }),

    getReviews: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTripReviews(input.tripId);
      }),

    getOrganizerReviews: publicProcedure
      .input(z.object({ organizerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrganizerReviews(input.organizerId);
      }),
  }),

  shops: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().transform(val => val || undefined).optional(),
        categories: z.array(z.enum(["mechanic", "fabrication", "parts", "tires", "suspension", "general", "other"])).min(1),
        otherDescription: z.string().transform(val => val || undefined).optional(),
        address: z.string().transform(val => val || undefined).optional(),
        city: z.string().transform(val => val || undefined).optional(),
        state: z.string().transform(val => val || undefined).optional(),
        zipCode: z.string().transform(val => val || undefined).optional(),
        phone: z.string().transform(val => val || undefined).optional(),
        email: z.string().email().optional().or(z.literal('')).transform(val => val || undefined),
        website: z.string().transform(val => val || undefined).optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert empty strings to undefined
        const cleanInput = {
          name: input.name,
          description: input.description || undefined,
          categories: input.categories,
          otherDescription: input.otherDescription || undefined,
          address: input.address || undefined,
          city: input.city || undefined,
          state: input.state || undefined,
          zipCode: input.zipCode || undefined,
          phone: input.phone || undefined,
          email: input.email || undefined,
          website: input.website || undefined,
          photos: input.photos,
          addedBy: ctx.user.id,
        };
        const shopId = await db.createShop(cleanInput);
        return { shopId };
      }),

    list: publicProcedure
      .input(z.object({
        categories: z.array(z.string()).optional(),
        state: z.string().optional(),
        city: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getShops(input);
      }),

    getById: publicProcedure
      .input(z.object({ shopId: z.number() }))
      .query(async ({ input }) => {
        return await db.getShopById(input.shopId);
      }),

    myShops: protectedProcedure
      .query(async ({ ctx }) => {
        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }
        const result = await connection.execute(
          `SELECT * FROM shops WHERE addedBy = ?`,
          [ctx.user.id]
        );
        return result[0] as any[];
      }),

    addReview: protectedProcedure
      .input(z.object({
        shopId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        serviceType: z.string().optional(),
        wouldRecommend: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already reviewed this shop
        const existingReviews = await db.getShopReviews(input.shopId);
        const userReview = existingReviews.find(r => r.userId === ctx.user.id);
        if (userReview) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "You have already reviewed this shop. Please edit your existing review instead." 
          });
        }
        
        const reviewId = await db.createShopReview({
          ...input,
          userId: ctx.user.id,
        });
        return { reviewId };
      }),

    editReview: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        serviceType: z.string().optional(),
        wouldRecommend: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user owns this review
        const reviews = await db.getShopReviews(0); // Get all reviews
        const review = reviews.find(r => r.id === input.reviewId);
        if (!review || review.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own reviews" });
        }
        
        await db.updateShopReview(input.reviewId, {
          rating: input.rating,
          reviewText: input.reviewText,
          serviceType: input.serviceType,
          wouldRecommend: input.wouldRecommend,
        });
        return { success: true };
      }),

    getReviews: publicProcedure
      .input(z.object({ shopId: z.number() }))
      .query(async ({ input }) => {
        return await db.getShopReviews(input.shopId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        categories: z.array(z.enum(["mechanic", "fabrication", "parts", "tires", "suspension", "general", "other"])).optional(),
        otherDescription: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const shop = await db.getShopById(id);
        if (!shop || shop.addedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own shops" });
        }
        await db.updateShop(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopById(input.id);
        if (!shop || shop.addedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own shops" });
        }
        await db.deleteShop(input.id);
        return { success: true };
      }),

    // Create subscription for shop
    createSubscription: protectedProcedure
      .input(z.object({
        shopId: z.number(),
        tier: z.enum(["featured", "premium"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopById(input.shopId);
        if (!shop || shop.addedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only manage your own shops" });
        }

        const { createShopSubscription } = await import("./_core/stripe");
        const result = await createShopSubscription(
          input.shopId,
          ctx.user.id,
          input.tier,
          ctx.user.email
        );

        return {
          sessionId: result.sessionId,
          url: result.url,
        };
      }),

    // Cancel subscription
    cancelSubscription: protectedProcedure
      .input(z.object({ shopId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopById(input.shopId);
        if (!shop || shop.addedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only manage your own shops" });
        }

        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }

        // Get subscription ID from database
        const result = await connection.execute(
          `SELECT stripeSubscriptionId FROM shops WHERE id = ?`,
          [input.shopId]
        );
        const rows = result[0] as any[];
        if (!rows || rows.length === 0 || !rows[0].stripeSubscriptionId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription found" });
        }

        const { cancelShopSubscription } = await import("./_core/stripe");
        const success = await cancelShopSubscription(rows[0].stripeSubscriptionId);

        if (success) {
          await connection.execute(
            `UPDATE shops SET subscriptionStatus = 'canceled', premiumTier = 'none' WHERE id = ?`,
            [input.shopId]
          );
        }

        return { success };
      }),
  }),

  upload: router({
    photo: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded image
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        
        // Decode base64
        const buffer = Buffer.from(input.file, "base64");
        
        // Generate unique file name
        const timestamp = Date.now();
        const extension = input.fileName.split(".").pop() || "jpg";
        const key = `photos/${ctx.user.id}/${timestamp}.${extension}`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, input.contentType);
        
        return { url: result.url, key: result.key };
      }),

    uploadGpx: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded GPX file
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        
        // Decode base64
        const buffer = Buffer.from(input.file, "base64");
        
        // Generate unique file name
        const timestamp = Date.now();
        const key = `gpx/${ctx.user.id}/${timestamp}.gpx`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, "application/gpx+xml");
        
        return { url: result.url, key: result.key };
      }),
  }),

  admin: router({
    // Get all users (admin only)
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getAllUsers();
    }),

    // Get all trips (admin only)
    getAllTrips: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getAllTripsAdmin();
    }),

    // Get all shops (admin only)
    getAllShops: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getAllShopsAdmin();
    }),

    // Delete user (admin only)
    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteUser(input.userId);
        return { success: true };
      }),

    // Delete trip (admin only)
    deleteTrip: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteTrip(input.tripId);
        return { success: true };
      }),

    // Delete shop (admin only)
    deleteShop: protectedProcedure
      .input(z.object({ shopId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteShop(input.shopId);
        return { success: true };
      }),

    // Clear all trips (admin only) - for production launch prep
    clearAllTrips: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteAllTrips();
        return { success: true, message: "All trips have been deleted" };
      }),

    // Update user role (admin only)
    updateUserRole: protectedProcedure
      .input(z.object({ 
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    // Migrate shops table schema (admin only)
    migrateShopsSchema: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }

        const steps: string[] = [];

        // Step 1: Add new 'categories' column as JSON
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN categories JSON NULL`);
          steps.push("✅ Added 'categories' column as JSON");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'categories' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Step 2: Migrate data from 'category' to 'categories'
        try {
          await connection.execute(`
            UPDATE shops 
            SET categories = JSON_ARRAY(category)
            WHERE category IS NOT NULL AND categories IS NULL
          `);
          steps.push("✅ Migrated data from 'category' to 'categories'");
        } catch (error: any) {
          steps.push(`⚠️ Data migration: ${error.message}`);
        }

        // Step 3: Drop old 'category' column
        try {
          await connection.execute(`ALTER TABLE shops DROP COLUMN category`);
          steps.push("✅ Dropped old 'category' column");
        } catch (error: any) {
          if (error.message.includes("Can't DROP")) {
            steps.push("⚠️ 'category' column already dropped, skipping");
          } else {
            throw error;
          }
        }

        // Step 4: Make 'categories' NOT NULL
        try {
          await connection.execute(`ALTER TABLE shops MODIFY COLUMN categories JSON NOT NULL`);
          steps.push("✅ Made 'categories' column NOT NULL");
        } catch (error: any) {
          steps.push(`⚠️ Setting NOT NULL: ${error.message}`);
        }

        // Step 5: Make optional columns nullable
        const optionalColumns = [
          { name: 'description', type: 'TEXT' },
          { name: 'otherDescription', type: 'TEXT' },
          { name: 'address', type: 'TEXT' },
          { name: 'city', type: 'VARCHAR(100)' },
          { name: 'state', type: 'VARCHAR(50)' },
          { name: 'zipCode', type: 'VARCHAR(20)' },
          { name: 'phone', type: 'VARCHAR(50)' },
          { name: 'email', type: 'VARCHAR(320)' },
          { name: 'website', type: 'TEXT' },
          { name: 'photos', type: 'JSON' },
        ];

        for (const col of optionalColumns) {
          try {
            await connection.execute(`ALTER TABLE shops MODIFY COLUMN ${col.name} ${col.type} NULL`);
            steps.push(`✅ Made '${col.name}' nullable`);
          } catch (error: any) {
            steps.push(`⚠️ Making '${col.name}' nullable: ${error.message}`);
          }
        }

        return { success: true, message: "Migration completed successfully", steps };
      }),

    // Migrate trips and participants tables for private trips and denial reasons
    migratePrivateTripsAndDenials: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }

        const steps: string[] = [];

        // Step 1: Add denialReason to tripParticipants
        try {
          await connection.execute(`ALTER TABLE tripParticipants ADD COLUMN denialReason TEXT NULL`);
          steps.push("✅ Added 'denialReason' column to tripParticipants");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'denialReason' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Step 2: Add isPrivate to trips
        try {
          await connection.execute(`ALTER TABLE trips ADD COLUMN isPrivate BOOLEAN NOT NULL DEFAULT false`);
          steps.push("✅ Added 'isPrivate' column to trips");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'isPrivate' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Step 3: Add shareToken to trips
        try {
          await connection.execute(`ALTER TABLE trips ADD COLUMN shareToken VARCHAR(64) NULL`);
          steps.push("✅ Added 'shareToken' column to trips");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'shareToken' column already exists, skipping");
          } else {
            throw error;
          }
        }

        return { success: true, message: "Migration completed successfully", steps };
      }),

    // Setup: Promote specific email to admin (for initial setup)
    setupPromoteAdmin: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Only allow promoting nicholasmilward@gmail.com
        if (input.email !== "nicholasmilward@gmail.com") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        if (user.role === "admin") {
          return { success: true, message: "User is already an admin" };
        }
        await db.updateUserRole(user.id, "admin");
        return { success: true, message: "User promoted to admin successfully" };
      }),

    // Fix shops table schema to allow NULL values
    fixShopsSchema: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.fixShopsTableSchema();
        return { success: true, message: "Shops table schema fixed successfully" };
      }),

    // Run messaging tables migration (admin only)
    runMessagingMigration: protectedProcedure
      .mutation(async ({ ctx }) => {  
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const database = await getDb();
        
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }
        
        // Create conversations table
        await database.execute(sql.raw(`
          CREATE TABLE IF NOT EXISTS \`conversations\` (
            \`id\` int AUTO_INCREMENT PRIMARY KEY,
            \`user1Id\` int NOT NULL,
            \`user2Id\` int NOT NULL,
            \`lastMessageAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX \`idx_user1\` (\`user1Id\`),
            INDEX \`idx_user2\` (\`user2Id\`),
            UNIQUE KEY \`unique_conversation\` (\`user1Id\`, \`user2Id\`)
          )
        `));
        
        // Create messages table
        await database.execute(sql.raw(`
          CREATE TABLE IF NOT EXISTS \`messages\` (
            \`id\` int AUTO_INCREMENT PRIMARY KEY,
            \`conversationId\` int NOT NULL,
            \`senderId\` int NOT NULL,
            \`receiverId\` int NOT NULL,
            \`content\` text NOT NULL,
            \`isRead\` boolean NOT NULL DEFAULT false,
            \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX \`idx_conversation\` (\`conversationId\`),
            INDEX \`idx_sender\` (\`senderId\`),
            INDEX \`idx_receiver\` (\`receiverId\`),
            FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE
          )
        `));
        
        return { success: true, message: "Messaging tables created successfully" };
      }),

    // Run group chat migration (admin only)
    runGroupChatMigration: protectedProcedure
      .mutation(async ({ ctx }) => {  
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const database = await getDb();
        
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }
        
        // Make user1Id and user2Id nullable
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              MODIFY COLUMN \`user1Id\` int NULL,
              MODIFY COLUMN \`user2Id\` int NULL
          `));
        } catch (error) {
          console.log("Columns already nullable or error:", error);
        }
        
        // Add tripId column
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              ADD COLUMN \`tripId\` int NULL
          `));
        } catch (error) {
          console.log("tripId column may already exist");
        }
        
        // Add isGroup column
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              ADD COLUMN \`isGroup\` boolean NOT NULL DEFAULT false
          `));
        } catch (error) {
          console.log("isGroup column may already exist");
        }
        
        // Add title column
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              ADD COLUMN \`title\` varchar(255) NULL
          `));
        } catch (error) {
          console.log("title column may already exist");
        }
        
        // Add index on tripId
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              ADD INDEX \`idx_trip\` (\`tripId\`)
          `));
        } catch (error) {
          console.log("Index may already exist");
        }
        
        // Try to drop unique constraint (may not exist if already dropped)
        try {
          await database.execute(sql.raw(`
            ALTER TABLE \`conversations\`
              DROP INDEX \`unique_conversation\`
          `));
        } catch (error) {
          console.log("Unique constraint already removed or doesn't exist");
        }
        
        return { success: true, message: "Group chat schema updated successfully" };
      }),

    // Verify shop (admin only)
    verifyShop: protectedProcedure
      .input(z.object({ 
        shopId: z.number(),
        isVerified: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.updateShopVerification(input.shopId, input.isVerified, ctx.user.id);
        return { success: true };
      }),

    // Set shop premium tier (admin only)
    setShopPremiumTier: protectedProcedure
      .input(z.object({ 
        shopId: z.number(),
        premiumTier: z.enum(["none", "featured", "premium"]),
        durationDays: z.number().optional(), // How many days to extend (default 30)
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const days = input.durationDays || 30;
        const expiresAt = input.premiumTier === "none" 
          ? null 
          : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        
        await db.updateShopPremiumTier(input.shopId, input.premiumTier, expiresAt);
        return { success: true, expiresAt };
      }),

    // Migrate shops table for verification fields (admin only)
    migrateShopsVerification: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }

        const steps: string[] = [];

        // Add isVerified column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN isVerified BOOLEAN NOT NULL DEFAULT false`);
          steps.push("✅ Added 'isVerified' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'isVerified' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add verifiedAt column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN verifiedAt TIMESTAMP NULL`);
          steps.push("✅ Added 'verifiedAt' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'verifiedAt' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add verifiedBy column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN verifiedBy INT NULL`);
          steps.push("✅ Added 'verifiedBy' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'verifiedBy' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add premiumTier column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN premiumTier ENUM('none', 'featured', 'premium') NOT NULL DEFAULT 'none'`);
          steps.push("✅ Added 'premiumTier' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'premiumTier' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add premiumExpiresAt column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN premiumExpiresAt TIMESTAMP NULL`);
          steps.push("✅ Added 'premiumExpiresAt' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'premiumExpiresAt' column already exists, skipping");
          } else {
            throw error;
          }
        }

        return { success: true, message: "Shop verification migration completed successfully", steps };
      }),

    // Add subscription fields to shops table (admin only)
    addSubscriptionFields: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const connection = await db.getRawConnection();
        if (!connection) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection not available" });
        }

        const steps: string[] = [];

        // Add stripeCustomerId column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN stripeCustomerId VARCHAR(255) NULL`);
          steps.push("✅ Added 'stripeCustomerId' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'stripeCustomerId' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add stripeSubscriptionId column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN stripeSubscriptionId VARCHAR(255) NULL`);
          steps.push("✅ Added 'stripeSubscriptionId' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'stripeSubscriptionId' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Add subscriptionStatus column
        try {
          await connection.execute(`ALTER TABLE shops ADD COLUMN subscriptionStatus VARCHAR(50) DEFAULT 'none'`);
          steps.push("✅ Added 'subscriptionStatus' column");
        } catch (error: any) {
          if (error.message.includes("Duplicate column name")) {
            steps.push("⚠️ 'subscriptionStatus' column already exists, skipping");
          } else {
            throw error;
          }
        }

        // Update existing shops to have 'none' status
        try {
          await connection.execute(`UPDATE shops SET subscriptionStatus = 'none' WHERE subscriptionStatus IS NULL`);
          steps.push("✅ Updated existing shops with 'none' status");
        } catch (error: any) {
          steps.push(`⚠️ Updating status: ${error.message}`);
        }

        return { success: true, message: "Subscription fields migration completed successfully", steps };
      }),
  }),

  messages: router({
    // Get all conversations for the current user
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserConversations(ctx.user.id);
      }),

    // Get or create a conversation with another user
    getOrCreateConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.getOrCreateConversation(ctx.user.id, input.otherUserId);
      }),

    // Get messages in a conversation
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify user is part of this conversation
        const convos = await db.getUserConversations(ctx.user.id);
        const isParticipant = convos.some(c => c.conversation.id === input.conversationId);
        
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this conversation" });
        }

        return await db.getConversationMessages(input.conversationId);
      }),

    // Send a message
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        receiverId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const message = await db.sendMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
        });
        
        // Send push notification to receiver (async, don't wait)
        import("./routers/notifications").then(async ({ sendNotificationToUser }) => {
          try {
            const senderName = ctx.user.name || 'Someone';
            const preview = input.content.length > 50 
              ? input.content.substring(0, 50) + '...' 
              : input.content;
            
            await sendNotificationToUser(
              input.receiverId,
              `New message from ${senderName}`,
              preview,
              { url: '/messages', conversationId: input.conversationId },
              'message'
            );
          } catch (error) {
            console.error('Error sending message notification:', error);
          }
        });
        
        return message;
      }),

    // Mark messages as read
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markMessagesAsRead(input.conversationId, ctx.user.id);
        return { success: true };
      }),

    // Get unread message count
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadMessageCount(ctx.user.id);
      }),

    // Get or create trip group chat
    getTripGroupChat: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify user is participant
        const isParticipant = await db.isUserTripParticipant(ctx.user.id, input.tripId);
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must be a trip participant to access group chat" });
        }
        return await db.getOrCreateTripGroupChat(input.tripId);
      }),

    // Get trip group messages
    getTripGroupMessages: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify user is participant
        const isParticipant = await db.isUserTripParticipant(ctx.user.id, input.tripId);
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must be a trip participant to view group chat" });
        }
        return await db.getTripGroupMessages(input.tripId);
      }),

    // Send message to trip group chat
    sendTripGroupMessage: protectedProcedure
      .input(z.object({ 
        tripId: z.number(),
        content: z.string().min(1)
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user is participant
        const isParticipant = await db.isUserTripParticipant(ctx.user.id, input.tripId);
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must be a trip participant to send messages" });
        }
        return await db.sendTripGroupMessage(input.tripId, ctx.user.id, input.content);
      }),
  }),

  users: router({  
    // Get public user profile
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) return null;
        
        // Return only public information
        return {
          id: user.id,
          name: user.name,
          createdAt: user.createdAt,
        };
      }),
  }),

  gpx: router({
    // Get all GPX files
    getAll: publicProcedure.query(async () => {
      return await db.getAllGpxFiles();
    }),

    // Search GPX files
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchGpxFiles(input.query);
      }),

    // Get GPX file by ID
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const gpxFile = await db.getGpxFileById(input);
        if (gpxFile) {
          await db.incrementGpxViewCount(input);
        }
        return gpxFile;
      }),

    // Get user's GPX files
    getMyFiles: protectedProcedure.query(async ({ ctx }) => {
      return await db.getGpxFilesByUser(ctx.user.id);
    }),

    // Create GPX file
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        location: z.string().min(1).max(255),
        state: z.string().max(50).optional(),
        fileData: z.string(), // GPX file content as string
        fileName: z.string().max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        const gpxFileId = await db.createGpxFile({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { id: gpxFileId };
      }),

    // Update GPX file
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        location: z.string().min(1).max(255).optional(),
        state: z.string().max(50).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const gpxFile = await db.getGpxFileById(id);
        if (!gpxFile || gpxFile.gpxFile.uploadedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateGpxFile(id, data);
        return { success: true };
      }),

    // Delete GPX file
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const gpxFile = await db.getGpxFileById(input);
        if (!gpxFile || gpxFile.gpxFile.uploadedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteGpxFile(input);
        return { success: true };
      }),

    // Increment download count
    download: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await db.incrementGpxDownloadCount(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

