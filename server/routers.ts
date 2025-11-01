import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user
        const user = await db.createUserWithPassword({
          email: input.email,
          passwordHash,
          name: input.name || input.email.split("@")[0],
        });

        // Create JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          ENV.jwtSecret,
          { expiresIn: "7d" }
        );

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find user
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Create JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          ENV.jwtSecret,
          { expiresIn: "7d" }
        );

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user };
      }),
    
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        // Find user by email
        const user = await db.getUserByEmail(input.email);
        
        // Always return success to prevent email enumeration
        if (!user) {
          return { success: true };
        }

        // Create reset token
        const resetToken = await db.createPasswordResetToken(user.id);

        // Send reset email
        const { sendPasswordResetEmail } = await import("./_core/email");
        await sendPasswordResetEmail(user.email!, resetToken, user.name || undefined);

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        // Verify token
        const userId = await db.verifyPasswordResetToken(input.token);
        if (!userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(input.newPassword, 10);

        // Update user password
        await db.updateUserPassword(userId, passwordHash);

        return { success: true };
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
      }))
      .mutation(async ({ ctx, input }) => {
        const tripId = await db.createTrip({
          ...input,
          organizerId: ctx.user.id,
          currentParticipants: 1,
          styles: input.styles,
          photos: input.photos || [],
        });
        return { tripId };
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
        await db.checkAndExpirePremiumTrips();
        
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
        if (!trip || trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateTrip(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id);
        if (!trip || trip.organizerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteTrip(input.id);
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
        return { participantId };
      }),

    listForTrip: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTripParticipants(input.tripId);
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
        }
        
        return { success: true };
      }),
  }),

  shops: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        categories: z.array(z.enum(["mechanic", "fabrication", "parts", "tires", "suspension", "general", "other"])).min(1),
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
        const shopId = await db.createShop({
          ...input,
          addedBy: ctx.user.id,
        });
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

    addReview: protectedProcedure
      .input(z.object({
        shopId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        serviceType: z.string().optional(),
        wouldRecommend: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const reviewId = await db.createShopReview({
          ...input,
          userId: ctx.user.id,
        });
        return { reviewId };
      }),

    getReviews: publicProcedure
      .input(z.object({ shopId: z.number() }))
      .query(async ({ input }) => {
        return await db.getShopReviews(input.shopId);
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
  }),
});

export type AppRouter = typeof appRouter;

