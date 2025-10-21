# Quick Deploy & Test Guide

## 🚀 Deploy the Function

```bash
# Step 1: Login (if not already)
firebase login

# Step 2: Deploy the function
firebase deploy --only functions

# Step 3: Watch logs in real-time (open in new terminal)
firebase functions:log --only scrapeRecipe
```

## ✅ Test the Function

### Option 1: Test in Firebase Console
1. Go to https://console.firebase.google.com/
2. Select **cooking-website-163f1**
3. Navigate to **Build > Functions**
4. Click **scrapeRecipe**
5. Go to **Testing** tab
6. Enter:
   ```json
   {
     "url": "https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"
   }
   ```
7. Click **Test the function**

### Option 2: Test in Your App
1. Go to http://localhost:3000
2. Click **Add Recipe**
3. Click **Import from URL** tab
4. Paste: `https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/`
5. Click **Import Recipe**

## 📊 View Logs

### Real-time logs:
```bash
firebase functions:log --only scrapeRecipe
```

### View in Console:
1. Firebase Console > Functions
2. Click on **scrapeRecipe**
3. Go to **Logs** tab

## 🔍 What the Logs Should Show

**Successful import:**
```
=== scrapeRecipe function called ===
Extracted URL: https://www.allrecipes.com/...
URL validated successfully
Starting to fetch URL...
Fetch successful. Status: 200
Response size: XXXXX characters
HTML parsed successfully
Found X JSON-LD script tags
Found Recipe schema! Parsing...
Recipe name: Best Chocolate Chip Cookies
Parsed X ingredients
Successfully scraped recipe
```

**Error example:**
```
ERROR: Failed to fetch URL
Error code: ENOTFOUND
```

## 🧪 Test URLs

Known working URLs:
- https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
- https://www.allrecipes.com/recipe/213742/moist-chocolate-cake/
- https://www.foodnetwork.com/recipes/alton-brown/homemade-soft-pretzels-recipe-1948242

## ⚠️ Common Issues

**"internal" error:**
- Check Firebase logs for details
- Look for ERROR: messages

**"not-found" error:**
- URL doesn't have recipe schema
- Try a different URL

**"unavailable" error:**
- Website is down or unreachable
- Check URL in browser first

## 💡 Pro Tips

1. **Always watch logs when testing:**
   ```bash
   firebase functions:log --only scrapeRecipe
   ```

2. **Test URLs in browser first:**
   - View page source (Ctrl+U)
   - Search for `"@type":"Recipe"`

3. **Use Google's Rich Results Test:**
   - https://search.google.com/test/rich-results
   - Paste recipe URL
   - Verify structured data

## 📝 Next Steps After Deploy

1. Test with multiple recipe URLs
2. Monitor logs for any errors
3. Check Firebase Console for function invocations
4. Report any issues with log details

---

**Need more help?** See `FUNCTION_DEBUGGING.md` for detailed troubleshooting.
