# Fix Shops Database Schema - Instructions

## Problem
The MySQL `shops` table has NOT NULL constraints on optional fields without default values, causing shop creation to fail when those fields are empty.

## Solution
Run the migration script to make these columns nullable:
- description
- otherDescription  
- address
- city
- state
- zipCode
- phone
- email
- website
- photos

## Steps to Fix

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```
This will open your browser to authenticate.

### 3. Link to Your Project
Navigate to your trail-match project folder, then run:
```bash
railway link
```
Select your `trail-match` or `happy-emotion` project.

### 4. Run the Migration Script
```bash
railway run node scripts/fix-shops-schema.mjs
```

This will connect to your Railway MySQL database and execute the ALTER TABLE commands to make the columns nullable.

### 5. Verify Success
You should see output like:
```
🔧 Connecting to database...
✅ Connected to database
🔄 Altering shops table to make optional columns nullable...

  Running: ALTER TABLE shops MODIFY COLUMN description TEXT NULL
  ✅ Success

  Running: ALTER TABLE shops MODIFY COLUMN otherDescription TEXT NULL
  ✅ Success
  
  ... (etc for all columns)

✅ Migration complete! All optional shop fields are now nullable.
🎉 You can now add shops with empty optional fields!
```

### 6. Update Code (After Migration Succeeds)
After the migration runs successfully, we can update the code to:
- Remove "N/A" default values
- Allow truly optional fields (null instead of "N/A")
- Make the UI cleaner by not showing "N/A" everywhere

## Alternative: MySQL Workbench
If Railway CLI doesn't work, you can use MySQL Workbench:

1. Download and install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. In Railway dashboard, go to MySQL → Database → Connect
3. Copy the connection details
4. In MySQL Workbench, create a new connection with those details
5. Open a SQL query window and paste the ALTER TABLE commands from `scripts/fix-shops-schema.mjs`
6. Execute the queries

## Troubleshooting

**Error: "railway: command not found"**
- Make sure npm's global bin directory is in your PATH
- Try closing and reopening your terminal
- On Windows, you may need to restart your computer

**Error: "Cannot connect to database"**
- Make sure you're linked to the correct Railway project
- Check that your DATABASE_URL environment variable is set in Railway
- Verify the MySQL service is running in Railway dashboard

**Error: "Column already nullable"**
- The migration may have already run successfully
- You can safely ignore this error
