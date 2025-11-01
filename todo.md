# TrailMatch TODO

## Email/Password Authentication
- [x] Update database schema to support passwordHash field
- [x] Install bcrypt and jsonwebtoken packages
- [x] Add email/password signup endpoint
- [x] Add email/password login endpoint  
- [x] Create AuthModal component with login/signup forms
- [x] Add Google OAuth button to AuthModal
- [x] Integrate AuthModal into Home page
- [x] Test production build successfully
- [ ] Test email/password signup flow
- [ ] Test email/password login flow
- [ ] Test Google OAuth still works
- [ ] Deploy to Railway and run database migration

## Future Enhancements
- [ ] Add password reset functionality via email
- [ ] Add Facebook OAuth
- [ ] Add Apple Sign In
- [ ] Add email verification for new accounts
- [ ] Add "Forgot Password" link in login form



## Photo Upload Features
- [x] Add photo upload to trip creation/posting
- [x] Add multiple photo support for trip listings
- [x] Add profile photo upload for users
- [x] Add vehicle photo upload to user profiles
- [x] Integrate with S3 storage for photo hosting
- [x] Add image preview and delete functionality
- [x] Optimize/resize images before upload

## Local Shops Directory
- [x] Create shops database table (name, location, category, contact info)
- [x] Create shop reviews database table (rating, review text, user, shop)
- [x] Build shops listing page with search/filter
- [ ] Add shop detail page with reviews
- [ ] Create "Add Shop" form for users
- [ ] Create "Write Review" form for shops
- [x] Add star rating system (1-5 stars)
- [x] Add shop categories (mechanic, parts, fabrication, etc.)
- [x] Add location-based search for nearby shops



## Bugs
- [x] Fix 404 error on /shops/add page - need to create AddShop component
- [x] Fix Google OAuth login - user redirects to home but doesn't stay logged in (cookie and/or frontend auth check issue)
  - Fixed by modifying authenticateRequest in server/_core/sdk.ts to support both JWT tokens (email/password) and SDK session tokens (OAuth)
  - Added getUserById function to server/db.ts



## Google Places Integration
- [x] Add Google Places API key to environment variables
- [x] Install Google Places API library
- [x] Add Google Places Autocomplete search box to AddShop page
- [x] Auto-populate shop details when user selects from autocomplete
- [x] Fetch and display shop photos from Google Places
- [x] Add manual override option if Google data is incorrect


- [x] Fix nested anchor tags in Home.tsx line 175-176 causing React hydration errors



## Profile and Vehicle Management
- [x] Add edit profile functionality (name, bio, location, experience level)
- [x] Add edit vehicle functionality (make, model, year, build level, mods, riding styles)
- [x] Add delete vehicle functionality
- [x] Add edit buttons to Profile page UI



## Shop "Other" Category
- [x] Add "other" to shop category enum in database schema
- [x] Add "Other" checkbox to AddShop form
- [x] Add "Other" checkbox to Shops filter

## Trip Creation Disclaimer
- [x] Create disclaimer component with land management warnings
- [x] Add Tread Lightly principles reminder
- [x] Warn about checking with land management agencies
- [x] Mention special event permit requirements
- [x] Add disclaimer to PostTrip page before form



## "Other" Category Text Input
- [x] Add otherDescription field to shops database schema
- [x] Show text input in AddShop when "Other" is checked
- [x] Save otherDescription to database
- [x] Display otherDescription on shop cards when category is "other"



## Google Places API Key Setup
- [x] Request GOOGLE_PLACES_API_KEY from user
- [x] Update GooglePlacesAutocomplete component to use env variable
- [x] Test Google Places search functionality



## Fix Google Maps Duplicate Loading
- [x] Update GooglePlacesAutocomplete to check if script already exists before loading
- [x] Prevent script from being removed on unmount to avoid re-loading
- [x] Test that Google Places search works without duplicate loading errors




## Phase 1: Critical Bug Fixes
- [x] Fix navigation link mismatch (was false alarm - navigation is correct)
- [x] Test all navigation paths to ensure they work

## Phase 2: Password Recovery
- [ ] Set up email service configuration (AWS SES)
- [ ] Create password reset token generation
- [ ] Create password reset email template
- [ ] Add password reset request endpoint
- [ ] Add password reset confirmation endpoint
- [ ] Build password reset request form UI
- [ ] Build password reset confirmation form UI
- [ ] Test end-to-end password recovery flow

## Phase 3: Admin Dashboard
- [x] Create admin route protection middleware
- [x] Build admin dashboard layout
- [x] Create user management page (view, edit, delete users)
- [x] Create trip management page (view, edit, delete, moderate trips)
- [x] Create shop management page (view, edit, delete, moderate shops)
- [x] Add analytics dashboard (user count, trip count, shop count)
- [x] Add admin navigation in header (only visible to admins)
- [x] Test admin access control

## Phase 4: UI/UX Polish
- [ ] Add form validation to all forms
- [ ] Add loading states (skeleton loaders, spinners)
- [ ] Add hover effects to cards and buttons
- [ ] Improve error handling and error messages
- [ ] Test mobile responsiveness
- [ ] Add confirmation dialogs for destructive actions

