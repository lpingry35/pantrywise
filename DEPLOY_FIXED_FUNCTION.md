# Fixed Cloud Function - Ready to Deploy! 🚀

## What Was Fixed

### ✅ Node.js Compatibility Issues Resolved
The "ReferenceError: File is not defined" error was caused by Node.js 18 compatibility issues with the undici package. Fixed by:

1. **Updated Node.js Runtime to 20**
   - Changed `engines.node` from "18" to "20" in `functions/package.json`
   - Added `runtime: "nodejs20"` to `firebase.json`

2. **Updated Firebase Functions to v5**
   - Upgraded from `firebase-functions` v4.3.1 to v5.0.0
   - Updated to use the new v2 API (`onCall` from `firebase-functions/v2/https`)
   - Updated function signature to use `request.data` and `request.auth`

3. **Updated All Dependencies**
   - `firebase-admin`: ^11.8.0 → ^12.0.0
   - `firebase-functions`: ^4.3.1 → ^5.0.0
   - `axios`: ^1.6.0 → ^1.7.0
   - `firebase-functions-test`: ^3.1.0 → ^3.3.0

4. **Updated Function Code**
   - Migrated from v1 API to v2 API
   - Changed `functions.https.onCall()` to `onCall()` from v2
   - Updated all `functions.https.HttpsError` to `HttpsError`
   - Added global options (timeout: 60s, memory: 256MiB, maxInstances: 10)

## Changes Summary

### functions/package.json
```json
{
  "engines": {
    "node": "20"  // Changed from "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",      // Updated
    "firebase-functions": "^5.0.0",   // Updated (v2 API)
    "axios": "^1.7.0",                // Updated
    "cheerio": "^1.0.0-rc.12"
  }
}
```

### firebase.json
```json
{
  "functions": [{
    "runtime": "nodejs20"  // Added
  }]
}
```

### functions/index.js
```javascript
// Old (v1 API)
const functions = require('firebase-functions');
exports.scrapeRecipe = functions.https.onCall(async (data, context) => {

// New (v2 API)
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
exports.scrapeRecipe = onCall(async (request) => {
  const data = request.data;
  const context = request.auth;
```

## Deploy Instructions

### Step 1: Verify Changes
```bash
# Check that dependencies are installed
cd functions
npm list firebase-functions
# Should show: firebase-functions@5.x.x

# Return to project root
cd ..
```

### Step 2: Login to Firebase (if not already)
```bash
firebase login
```

### Step 3: Deploy the Function
```bash
firebase deploy --only functions
```

Expected output:
```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: packaging Node.js 20 function scrapeRecipe(us-central1)...
✔  functions: functions folder uploaded successfully
i  functions: updating Node.js 20 function scrapeRecipe(us-central1)...
✔  functions[scrapeRecipe(us-central1)]: Successful update operation.
✔  Deploy complete!
```

### Step 4: Watch Logs (Open in New Terminal)
```bash
firebase functions:log --only scrapeRecipe
```

### Step 5: Test the Function

#### Option A: Test in Firebase Console
1. Go to https://console.firebase.google.com/
2. Select project: **cooking-website-163f1**
3. Navigate to **Build > Functions**
4. Click on **scrapeRecipe**
5. Go to **Testing** tab
6. Enter test data:
   ```json
   {
     "url": "https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"
   }
   ```
7. Click **Test the function**
8. Should see successful recipe data returned

#### Option B: Test in Your App
1. Go to http://localhost:3000
2. Navigate to **Add Recipe**
3. Click **Import from URL** tab
4. Paste: `https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/`
5. Click **Import Recipe**
6. Should see success message and recipe data populated

## What to Expect

### ✅ Successful Deployment
- Function deploys without errors
- Uses Node.js 20 runtime
- All dependencies compatible
- No "File is not defined" error

### ✅ Successful Test
You should see logs like:
```
=== scrapeRecipe function called ===
Request data: {"url":"https://www.allrecipes.com/..."}
Extracted URL: https://www.allrecipes.com/...
URL validated successfully
Starting to fetch URL...
Fetch successful. Status: 200
Response size: XXXXX characters
HTML parsed successfully with Cheerio
Found X JSON-LD script tags
Found Recipe schema! Parsing...
Recipe name: Best Chocolate Chip Cookies
Parsed 12 ingredients
Instructions length: 856 characters
Successfully scraped recipe: Best Chocolate Chip Cookies
Returning recipe data to client
```

### ✅ Recipe Imported in App
After clicking "Import Recipe", you should:
1. See a green success message
2. Automatically switch to "Manual Entry" tab
3. See all recipe data pre-populated:
   - Name, description, cuisine
   - Cook time, servings
   - All ingredients with quantities and units
   - Step-by-step instructions
   - Recipe image URL

## Improvements in This Version

1. **Better Performance**
   - 60 second timeout (increased from default)
   - 256MiB memory allocation
   - Up to 10 concurrent instances

2. **Enhanced Logging**
   - Detailed logs at every step
   - Error tracking with stack traces
   - Easy debugging

3. **Modern API**
   - Firebase Functions v2 API
   - Better error handling
   - Improved TypeScript support (for future)

## Troubleshooting

### If deployment fails:
1. Check Firebase project is correct:
   ```bash
   firebase use
   # Should show: cooking-website-163f1
   ```

2. Verify Node.js version in package.json:
   ```bash
   cat functions/package.json | grep -A 1 "engines"
   # Should show: "node": "20"
   ```

3. Check firebase.json has runtime:
   ```bash
   cat firebase.json | grep runtime
   # Should show: "runtime": "nodejs20"
   ```

### If function returns error:
1. Check logs:
   ```bash
   firebase functions:log --only scrapeRecipe
   ```

2. Look for detailed error messages (now with full logging)

3. Test URL in browser first to verify it has recipe data

### Common Issues:

**"functions/unauthenticated"**
- Try redeploying: `firebase deploy --only functions`

**"functions/not-found"**
- URL doesn't have schema.org/Recipe data
- Try a known working URL from AllRecipes

**"functions/unavailable"**
- Website is down or blocking requests
- Check URL is accessible in browser

## Next Steps After Successful Deploy

1. ✅ Test with multiple recipe URLs
2. ✅ Monitor function invocations in Firebase Console
3. ✅ Check logs for any unexpected errors
4. ✅ Test edge cases (long URLs, non-recipe pages, etc.)
5. ✅ Document any sites that don't work for future reference

## Cost & Usage

With the updated configuration:
- **Free tier**: 2M invocations/month
- **Timeout**: 60 seconds (sufficient for most sites)
- **Memory**: 256MiB (optimal for HTML parsing)
- **Concurrent**: Up to 10 instances (scales automatically)

**Estimated cost per import**: $0.000 (well within free tier)

## Support

If issues persist after deployment:
1. Share the complete Firebase logs
2. Share the specific URL being tested
3. Check Firebase Console > Functions for error details
4. Verify the function is using Node.js 20 runtime

---

**Ready to deploy?** Run:
```bash
firebase deploy --only functions
```

Then test at: http://localhost:3000
