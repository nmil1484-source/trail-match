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
- [ ] Add profile photo upload for users
- [ ] Add vehicle photo upload to user profiles
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

