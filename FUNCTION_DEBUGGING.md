# Firebase Cloud Function Debugging Guide

## What Was Updated

The `scrapeRecipe` Cloud Function now has comprehensive error logging and debugging capabilities:

### ✅ Enhanced Error Handling
- Detailed console logs at every step
- Try-catch blocks around all critical operations
- Specific error messages for different failure scenarios
- Full error stack traces logged

### ✅ Logging Points
1. Function invocation (request data and context)
2. URL validation
3. HTTP fetch operation (status, content-type, response size)
4. HTML parsing with Cheerio
5. JSON-LD script discovery
6. Recipe data extraction
7. Each parsing step (ingredients, instructions, etc.)
8. Success/failure at each stage

## How to Redeploy and Test

### Step 1: Deploy the Updated Function
```bash
firebase deploy --only functions
```

Expected output:
```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: updating Node.js 18 function scrapeRecipe(us-central1)...
✔  functions[scrapeRecipe(us-central1)]: Successful update operation.
```

### Step 2: View Real-Time Logs

Open a new terminal and run:
```bash
firebase functions:log --only scrapeRecipe
```

This will stream logs in real-time as the function runs.

### Step 3: Test in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **cooking-website-163f1**
3. Navigate to: **Build > Functions**
4. Click on the `scrapeRecipe` function
5. Go to the **Testing** tab
6. Enter test data:
```json
{
  "url": "https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"
}
```
7. Click **Test the function**
8. View results and logs

### Step 4: Test from Your App

1. Go to http://localhost:3000
2. Navigate to **Add Recipe**
3. Click **Import from URL** tab
4. Paste this URL:
   ```
   https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
   ```
5. Click **Import Recipe**
6. Watch the logs in your terminal (from Step 2)

## What to Look For in Logs

### Successful Import Logs:
```
=== scrapeRecipe function called ===
Request data: {"url":"https://www..."}
Extracted URL: https://www...
URL validated successfully: https://www...
Starting to fetch URL...
Fetch successful. Status: 200
Content-Type: text/html; charset=utf-8
Response size: XXXXX characters
HTML received, starting to parse...
HTML parsed successfully with Cheerio
Found X JSON-LD script tags
Processing JSON-LD script #1
Script content length: XXXX
Parsed JSON-LD: {"@context":"https://schema.org"...
Processing 1 items from JSON-LD
Item #1 @type: Recipe
Found Recipe schema! Parsing...
parseRecipeSchema called
Recipe name: Best Chocolate Chip Cookies
Parsed X ingredients
Instructions length: XXX characters
Cook time: 30 minutes
Servings: 4
Successfully scraped recipe: Best Chocolate Chip Cookies
Returning recipe data to client
```

### Error Logs to Watch For:

**1. URL Fetch Error:**
```
ERROR: Failed to fetch URL
Error code: ENOTFOUND
Error message: getaddrinfo ENOTFOUND...
```
→ Website is unreachable or URL is invalid

**2. No Recipe Found:**
```
Found 0 JSON-LD script tags
ERROR: No recipe data found in any JSON-LD scripts
```
→ Website doesn't have schema.org/Recipe structured data

**3. Parse Error:**
```
Failed to parse JSON-LD script: Unexpected token...
```
→ Malformed JSON in the page

**4. Internal Error:**
```
=== ERROR in scrapeRecipe function ===
Error type: TypeError
Error message: Cannot read property...
```
→ Bug in the parsing logic

## Common Issues and Solutions

### Issue: "functions/internal" error
**What to check:**
1. Look at the Firebase logs for the detailed error
2. Check if the website requires JavaScript rendering
3. Verify the URL has schema.org/Recipe data

**Solution:**
View logs to see exact error:
```bash
firebase functions:log --only scrapeRecipe
```

### Issue: "functions/not-found" error
**Meaning:** No recipe schema found on the page

**Solution:**
- Try a different recipe URL
- Test with known working sites:
  - AllRecipes: https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
  - Food Network: https://www.foodnetwork.com/recipes/
  - NYT Cooking: https://cooking.nytimes.com/recipes/

### Issue: "functions/unavailable" error
**Meaning:** Cannot reach the website

**Solution:**
- Check if the website is up
- Verify the URL is correct
- Try accessing the URL in your browser first

### Issue: "functions/deadline-exceeded" error
**Meaning:** Request timed out (15 seconds)

**Solution:**
- The website is slow or unresponsive
- Try again later
- The timeout is set to 15 seconds in the code

## Manual Testing URLs

Test with these known working URLs:

### AllRecipes (Excellent schema.org support)
```
https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
https://www.allrecipes.com/recipe/213742/moist-chocolate-cake/
https://www.allrecipes.com/recipe/158968/spinach-and-feta-turkey-burgers/
```

### Food Network (Good support)
```
https://www.foodnetwork.com/recipes/alton-brown/homemade-soft-pretzels-recipe-1948242
```

### Bon Appétit (Good support)
```
https://www.bonappetit.com/recipe/chocolate-chip-cookies
```

## Debugging Steps

If the function returns an error:

1. **Check Firebase Logs**
   ```bash
   firebase functions:log --only scrapeRecipe
   ```

2. **Look for specific error messages**
   - Search for "ERROR:" in the logs
   - Note the error type and message

3. **Test the URL manually**
   - Open the URL in your browser
   - View page source (Ctrl+U)
   - Search for `"@type":"Recipe"` or `<script type="application/ld+json">`

4. **Verify the schema**
   - Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
   - Paste the recipe URL
   - Verify it has Recipe structured data

5. **Check function deployment**
   ```bash
   firebase functions:list
   ```
   Should show `scrapeRecipe` as deployed

## Next Steps After Debugging

Once you identify the issue from the logs:

1. **If it's a parsing issue:** Update the parsing logic in `functions/index.js`
2. **If it's a CORS issue:** Already solved by using Cloud Function
3. **If it's a timeout:** Increase timeout in the axios config
4. **If it's authentication:** Add auth headers if needed

Then redeploy:
```bash
firebase deploy --only functions
```

## Cost Monitoring

View function usage:
1. Go to Firebase Console
2. Navigate to **Usage and billing**
3. Check function invocations count
4. Monitor to stay within free tier (2M/month)

## Support

If issues persist:
1. Share the Firebase logs
2. Share the specific URL being tested
3. Check if the site requires JavaScript rendering (sites like NYT Cooking)
4. Consider using a headless browser for JS-heavy sites (future enhancement)

---

**Ready to debug?** Run:
```bash
# Deploy the updated function
firebase deploy --only functions

# Watch logs in real-time
firebase functions:log --only scrapeRecipe
```

Then test with a URL in your app!
