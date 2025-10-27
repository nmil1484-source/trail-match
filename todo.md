# Project TODO

## Phase 1: Database Schema & Core Data Models
- [x] Create trips table with location, dates, style, difficulty
- [x] Create vehicles table with make, model, modifications
- [x] Create trip_participants table for join requests
- [x] Create user_profiles table with experience level
- [x] Add seed data for demo trips and vehicles

## Phase 2: Backend API (tRPC Procedures)
- [x] Trip procedures: create, list, getById, update, delete
- [x] Vehicle procedures: create, update, getByUserId
- [x] Participant procedures: requestJoin, acceptJoin, declineJoin
- [x] Filter procedures: filterTrips by location, style, difficulty, dates
- [x] Profile procedures: update user profile and preferences

## Phase 3: Frontend UI Components
- [x] Homepage with hero section and search
- [x] Trip card component with photos and details
- [x] Trip listing page with filters
- [x] Trip detail page with join functionality
- [x] Post trip form with all fields (HIGH PRIORITY - user needs this)
- [ ] Vehicle profile page with specs and photos
- [ ] User profile page

## Phase 4: Matching & Filtering
- [ ] Implement filter logic for location, style, difficulty
- [ ] Add vehicle compatibility filtering
- [ ] Create matching algorithm for build similarity
- [ ] Add date range filtering

## Phase 5: Polish & Features
- [ ] Add image upload for trips and vehicles
- [ ] Implement trip messaging/chat
- [ ] Add notifications for join requests
- [ ] Mobile responsive design
- [ ] Loading states and error handling



## Phase 6: Rebranding to TrailMatch
- [x] Generate TrailMatch logo
- [x] Update app title to TrailMatch throughout
- [x] Update environment variables for branding
- [x] Update header/footer with new branding
- [x] Add logo to header
- [x] Update meta tags and page titles



## Bugs
- [x] Fix nested anchor tag error in navigation links



## High Priority Features
- [x] Create user profile page with vehicle setup
- [x] Add riding style preferences: rock crawling, overland, desert, wanna be long travel, long travel only, raptor, jeeping, pre-running
- [x] Add mods list field to vehicle profile
- [x] Update trip minimum requirements: 2wd needed, 4x4, 4x4 with mods, 2wd pre runner, 4wd pre-runner, raptor, long travel (fast), long travel (slow)
- [x] Update database schema for new styles and requirements



## Railway Deployment Issues
- [x] Fix OAuth error - make authentication optional for Railway deployment
- [ ] Implement Google OAuth for Railway deployment
- [ ] Add missing VITE environment variables for production
- [ ] Test site functionality on www.trail-match.com



## Authentication System Enhancement
- [x] Add password field to users table in database schema
- [x] Install bcrypt for password hashing
- [x] Create email/password signup endpoint
- [x] Create email/password login endpoint
- [ ] Add password reset functionality
- [x] Create signup form UI component
- [x] Create login form UI component with Google OAuth and email/password options
- [x] Add email validation
- [x] Add password strength requirements
- [ ] Test both Google OAuth and email/password authentication flows



## Current Bugs
- [x] Fix Google OAuth callback 500 error on Railway deployment
- [x] Ensure Google OAuth callback properly creates user session



## Additional Authentication Features
- [x] Add Facebook OAuth integration
- [x] Add Apple Sign In integration
- [x] Implement password reset functionality via email
- [x] Set up email service (Resend)
- [x] Create password reset request endpoint
- [x] Create password reset confirmation endpoint
- [ ] Build password reset UI flow (forgot password link + reset page)
- [x] Add email templates for password reset
- [ ] Test all OAuth providers after adding credentials (Google works, Facebook/Apple need credentials)
- [ ] Test password reset flow end-to-end after adding email API key

