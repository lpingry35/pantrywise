# Firebase Cloud Functions Deployment Guide

## Overview
The recipe URL scraping feature uses Firebase Cloud Functions to fetch and parse recipe data server-side, avoiding CORS issues that occur when fetching from the browser.

## What Was Set Up

### 1. Firebase Functions Configuration
- `firebase.json` - Firebase configuration file
- `.firebaserc` - Firebase project configuration (cooking-website-163f1)
- `functions/` directory with the Cloud Function code

### 2. Cloud Function: `scrapeRecipe`
Located in `functions/index.js`, this function:
- Accepts a recipe URL as a parameter
- Fetches the webpage server-side (no CORS issues)
- Parses schema.org/Recipe structured data (JSON-LD)
- Extracts: title, ingredients, instructions, cook time, servings, images
- Returns parsed recipe data to the frontend

### 3. Frontend Integration
Updated `src/utils/recipeScraper.js` to call the Cloud Function using Firebase SDK

## Deployment Steps

### Step 1: Ensure You're Logged In to Firebase
```bash
firebase login
```

This will open your browser for authentication. Once logged in, you can proceed.

### Step 2: Verify Your Project
```bash
firebase projects:list
```

Make sure `cooking-website-163f1` is listed and selected.

### Step 3: Deploy the Cloud Function
```bash
firebase deploy --only functions
```

This command will:
- Upload the function code to Firebase
- Deploy the `scrapeRecipe` function
- Provide you with the function URL

**Note:** The first deployment may take 2-3 minutes.

### Step 4: Verify Deployment
After deployment, you should see output like:
```
✔  Deploy complete!

Functions:
  scrapeRecipe(us-central1): [deployed URL]
```

### Step 5: Test in the App
1. Start the development server (if not already running):
   ```bash
   npm start
   ```

2. Navigate to "Add Recipe" page
3. Click the "Import from URL" tab
4. Paste a recipe URL (e.g., from AllRecipes, Food Network, NYT Cooking)
5. Click "Import Recipe"

## Common Issues & Solutions

### Issue: "Authentication required" error
**Solution:** Make sure you've run `firebase login` successfully

### Issue: "Functions not found" error
**Solution:** Deploy the function using `firebase deploy --only functions`

### Issue: Function deployment fails with permission error
**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: cooking-website-163f1
3. Go to Build > Functions
4. Enable Cloud Functions for Firebase (if not already enabled)
5. Try deploying again

### Issue: "Billing required" error
**Solution:**
Firebase Cloud Functions requires the Blaze (pay-as-you-go) plan. However:
- The free tier includes 2 million invocations per month
- You won't be charged unless you exceed the free tier
- To upgrade: Go to Firebase Console > Settings > Usage and billing

## Supported Recipe Sites

The function works with any site that uses schema.org/Recipe structured data, including:
- AllRecipes.com
- Food Network
- NYT Cooking
- Bon Appétit
- Serious Eats
- Budget Bytes
- And many more!

## Function Costs (Blaze Plan)

**Free Tier (monthly):**
- 2M invocations
- 400K GB-seconds of compute time
- 200K CPU-seconds of compute time

**Typical Usage:**
- Each recipe import = 1 invocation
- Average execution time: ~2-3 seconds
- You can import ~2 million recipes per month for free!

## Development & Testing

### Local Testing with Firebase Emulator
```bash
cd functions
npm run serve
```

This starts the Firebase Functions Emulator for local testing without deploying.

### View Function Logs
```bash
firebase functions:log
```

### Update Function Code
1. Edit `functions/index.js`
2. Run `firebase deploy --only functions`
3. Wait for deployment to complete

## Security Notes

- The function validates URLs before fetching
- Has a 10-second timeout to prevent hanging requests
- Only accepts HTTPS/HTTP URLs
- Returns structured error messages
- No authentication required (but can be added if needed)

## Next Steps

After deployment, you can:
1. Test with various recipe URLs
2. Monitor usage in Firebase Console
3. Add error tracking (Firebase Crashlytics)
4. Implement caching for frequently scraped recipes
5. Add user authentication to track imports per user

## Support

If you encounter issues:
1. Check Firebase Console for function logs
2. Verify the function is deployed and active
3. Check browser console for detailed error messages
4. Review the function code in `functions/index.js`

---

**Ready to deploy?** Run:
```bash
firebase login
firebase deploy --only functions
```
