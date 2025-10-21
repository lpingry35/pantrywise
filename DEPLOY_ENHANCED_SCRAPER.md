# Enhanced Recipe Scraper - Deployment Guide

## What's New

The Cloud Function has been significantly enhanced to handle multiple recipe data formats and provide detailed debugging information.

### ✅ Enhanced Features

1. **Detailed Logging**
   - Logs first 500 characters of HTML for debugging
   - Logs full JSON-LD content (first 1000 chars)
   - Shows @context and @type for each JSON-LD script
   - Logs which parsing method succeeded (JSON-LD, microdata, or HTML fallback)
   - Visual indicators (✓, ⚠, ❌) for easier log reading

2. **Three-Tier Parsing Strategy**
   - **Primary**: JSON-LD (schema.org/Recipe)
   - **Fallback 1**: Microdata parsing
   - **Fallback 2**: HTML structure parsing

3. **Microdata Support**
   - Extracts recipes with `itemtype="schema.org/Recipe"`
   - Parses itemprop attributes (name, recipeIngredient, recipeInstructions, etc.)
   - Handles common microdata patterns

4. **HTML Fallback Parsing**
   - Searches for common CSS classes:
     - `.recipe-ingredients`, `.ingredients-list`, `[class*="ingredient"]`
     - `.recipe-instructions`, `.instructions-list`, `[class*="instruction"]`
   - Tries multiple selector patterns
   - Logs which selectors found data
   - Works even without structured data

5. **Better Error Messages**
   - Shows what methods were tried
   - Logs page title and meta tags when no recipe found
   - Provides actionable error messages

## Deploy the Enhanced Function

### Step 1: Deploy
```bash
firebase deploy --only functions
```

### Step 2: Watch Logs
Open a new terminal:
```bash
firebase functions:log --only scrapeRecipe
```

### Step 3: Test with an AllRecipes URL
Try this URL:
```
https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
```

## What You'll See in Logs

### ✅ Successful Parse (JSON-LD):
```
=== scrapeRecipe function called ===
Extracted URL: https://www.allrecipes.com/...
Fetch successful. Status: 200
Response size: 245678 characters

HTML preview (first 500 chars):
<!DOCTYPE html><html lang="en">...

HTML parsed successfully with Cheerio
Found 3 JSON-LD script tags

=== Processing JSON-LD script #1 ===
Script content length: 12543
Full JSON-LD content:
{"@context":"https://schema.org","@type":"Recipe"...
JSON-LD @context: https://schema.org
JSON-LD @type: Recipe
✓ Found Recipe schema! Parsing...
parseRecipeSchema called
Recipe name: Best Chocolate Chip Cookies
Parsed 12 ingredients
Instructions length: 856 characters
✓ Recipe data parsed successfully

✓ Successfully scraped recipe: Best Chocolate Chip Cookies
Ingredients count: 12
```

### ⚠ Fallback to Microdata:
```
Found 0 JSON-LD script tags

=== No JSON-LD recipe found, trying microdata ===
Looking for microdata Recipe...
Found microdata elements: 1
Microdata recipe name: Chocolate Cookies
Microdata ingredients found: 10

✓ Successfully scraped recipe: Chocolate Cookies
```

### ⚠ Fallback to HTML Parsing:
```
=== No microdata found, trying HTML fallback parsing ===
Attempting HTML fallback parsing...
HTML fallback - found title: Chocolate Chip Cookies
Trying selector ".recipe-ingredients li": found 12 elements
Found ingredients with selector: .recipe-ingredients li
HTML fallback - found ingredients: 12
Trying instruction selector ".recipe-instructions li": found 8 elements
Found instructions with selector: .recipe-instructions li

✓ Successfully scraped recipe: Chocolate Chip Cookies
```

### ❌ No Recipe Found:
```
❌ ERROR: No recipe data found using any method
Tried: JSON-LD, Microdata, HTML fallback

Page title: Home | Example Site
Meta description: Welcome to our website
Open Graph title: Example Site

Error: No recipe data found at this URL...
```

## Supported Sites

### Tier 1: JSON-LD (Best Support)
- AllRecipes.com
- Food Network
- NYT Cooking
- Bon Appétit
- Serious Eats
- Budget Bytes

### Tier 2: Microdata (Good Support)
- Older recipe blogs
- Some WordPress recipe plugins
- Sites using older schema.org format

### Tier 3: HTML Fallback (Basic Support)
- Recipe sites without structured data
- Custom recipe blogs
- Sites with standard HTML classes
- May require manual editing of ingredients

## Testing Different URLs

Try these to see different parsing methods:

```bash
# Test with AllRecipes (JSON-LD)
https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/

# Test with Food Network (JSON-LD)
https://www.foodnetwork.com/recipes/alton-brown/homemade-soft-pretzels-recipe-1948242

# Test with a blog (may use microdata or HTML fallback)
https://sallysbakingaddiction.com/chocolate-chip-cookies/
```

## Debugging Tips

### If a site doesn't work:

1. **Check the logs** - They'll show exactly what was tried:
   ```bash
   firebase functions:log --only scrapeRecipe
   ```

2. **Look for the HTML preview** - First 500 chars shows page structure

3. **Check JSON-LD output** - See if Recipe schema exists

4. **Review selector attempts** - See which CSS classes were tried

5. **Share the logs** - Full context for troubleshooting

### Common Issues:

**"No recipe data found"**
- Site uses JavaScript rendering (not accessible via axios)
- Site has unusual CSS classes (can be added to fallback)
- Site requires authentication or has anti-bot measures

**Ingredients parsed incorrectly**
- Site uses non-standard format
- Can be manually edited after import

**Missing instructions**
- Site stores instructions in unusual format
- Fallback message: "See original recipe for instructions"

## Next Steps

After successful import:
1. ✅ Recipe data populates the form
2. ✅ Review and edit as needed
3. ✅ Adjust cost per serving
4. ✅ Save to your library

## Future Enhancements

Potential improvements:
- JavaScript rendering support (Puppeteer)
- Custom CSS selector configuration per domain
- Recipe caching to avoid re-scraping
- Support for more international recipe sites
- Ingredient unit conversion

---

**Ready to test?** Deploy and try importing a recipe!
