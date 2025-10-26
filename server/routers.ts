import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
        minBuildLevel: z.enum(["stock", "mild", "moderate", "heavy"]).optional(),
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
});

export type AppRouter = typeof appRouter;

