# 🐛 Bug Tracker - Smart Meal Planner

## 🔴 Open Bugs (Need Fixing)

### Bug #6: Recipe URL Import Fails on Some Sites
**Status:** 🔴 Open  
**Priority:** Medium  
**Reported:** Today  
**Location:** `functions/index.js` scrapeRecipe function

**Issue:**
- AllRecipes URLs work perfectly
- Food Network and other sites fail to import
- Example failing URL: https://www.foodnetwork.com/recipes/food-network-kitchen/3-ingredient-mac-and-cheese-18926685
- Error: Likely "No recipe data found" or "Unable to reach URL"

**Expected Behavior:**
- Should work with all major recipe sites (Food Network, NYT Cooking, Serious Eats, etc.)
- Each site may use different recipe schema formats

**Likely Causes:**
1. Site-specific anti-scraping protection (blocking requests)
2. Different JSON-LD schema structure
3. Recipe data in different format than expected
4. Site requires cookies/authentication

**To Reproduce:**
1. Go to Add Recipe → Import from URL
2. Paste Food Network URL
3. Click Import Recipe
4. Fails to import

**Workaround:**
- Use AllRecipes URLs for now
- Manually enter recipes from other sites

**To Fix (Phase 7.1.1):**
- Test with multiple recipe sites
- Add site-specific parsing logic if needed
- Improve headers/user agent to avoid blocking
- Add better error messages showing which parsing method failed

---

*(No other open bugs at this time)*

---

## ✅ Fixed Bugs

### Bug #3: Shopping List Not Combining Ingredients Across Different Recipes ✅
**Status:** ✅ Fixed  
**Priority:** Medium  
**Reported:** Earlier today  
**Fixed:** Today  
**Location:** `src/utils/shoppingListGenerator.js`

**Issue:**
- Ingredients from different recipes didn't get combined/summed properly
- Only ingredients from the SAME recipe (added multiple times) combined correctly
- Example: Recipe A needs "2 cups chicken" + Recipe B needs "1 cup chicken" = showed both separately instead of "3 cups chicken"

**Resolution:**
- Fixed `normalizeIngredient()` to be applied consistently across all ingredients
- Updated `combineQuantities()` function to properly match ingredients from different recipe sources
- Ingredient names now normalized using the same synonym map before grouping
- Duplicate ingredients now combine regardless of which recipe they came from
- Quantities sum correctly when units match

---

### Bug #4: Singular/Plural Unit Mismatch ✅
**Status:** 🔴 Open  
**Priority:** Medium  
**Reported:** Earlier today  
**Location:** `src/utils/shoppingListGenerator.js`

**Issue:**
- Ingredients from different recipes don't get combined/summed properly
- Only ingredients from the SAME recipe (added multiple times) combine correctly
- Example: Recipe A needs "2 cups chicken" + Recipe B needs "1 cup chicken" = shows both separately instead of "3 cups chicken"

**Expected Behavior:**
- All duplicate ingredients should combine regardless of which recipe they came from
- Should sum quantities when units match

**Likely Cause:**
- Issue with `normalizeIngredient()` function not standardizing ingredient names consistently
- Or `combineQuantities()` function not matching ingredients from different sources properly

**To Reproduce:**
1. Add multiple recipes to meal plan that share ingredients
2. Go to Shopping List
3. See duplicate ingredients instead of combined totals

---

## ✅ Fixed Bugs

### Bug #4: Singular/Plural Unit Mismatch ✅
**Status:** ✅ Fixed  
**Priority:** High  
**Reported:** Today  
**Fixed:** Today  
**Location:** `src/utils/ingredientMatching.js`

**Issue:**
- "lb" and "lbs" didn't match when comparing pantry to recipes
- Plural units weren't recognized as matching their singular forms

**Resolution:**
- Created `normalizeUnit()` helper function that strips trailing 's' from plural units
- Applied normalization when comparing quantities
- Now "cups" = "cup", "lbs" = "lb", "pieces" = "piece", etc.
- Pantry items with "2 lbs chicken" now correctly match recipes needing "1 lb chicken"

---

### Bug #5: No Partial Matches Shown ✅
**Status:** ✅ Fixed  
**Priority:** Medium  
**Reported:** Today  
**Fixed:** Today  
**Location:** `src/utils/ingredientMatching.js` and `src/components/RecipeCard.jsx`

**Issue:**
- When user had some but not all of an ingredient (e.g., 1 cup of 2 cups needed), it showed as completely missing
- No way to see partial availability

**Resolution:**
- Enhanced `matchRecipesToPantry()` to track partial matches with percentage calculations
- Added new "Partial Match" section (yellow) in RecipeCard showing:
  - "Ingredient: Have X of Y unit (Z%)" 
  - Example: "Flour: Have 1 of 2 cup (50%)"
- Three-tier system now:
  - Green "You Have" = sufficient quantity
  - Yellow "Partial Match" = have some but not enough
  - Orange "Need to Buy" = completely missing

---

### Bug #1: Pantry Match Percentage Not Displaying ✅
**Status:** ✅ Fixed  
**Priority:** High  
**Reported:** Today  
**Fixed:** Today  
**Location:** `src/components/RecipeCard.jsx` and `src/utils/ingredientMatching.js`

**Issue:**
- Recipe cards showed "\_%" instead of actual match percentage
- The `matchRecipesToPantry()` function wasn't calculating `pantryMatchPercentage` correctly

**Resolution:**
- Fixed calculation in `ingredientMatching.js`
- Ensured percentage value is properly formatted and passed to RecipeCard
- Now displays correct percentages like "75%", "60%", etc.

---

### Bug #2: Missing Ingredients Display Incomplete ✅
**Status:** ✅ Fixed  
**Priority:** Medium  
**Reported:** Today  
**Fixed:** Today  
**Location:** `src/components/RecipeCard.jsx`

**Issue:**
- Only showed missing ingredients
- Didn't display what user already had in pantry

**Resolution:**
- Added "You have" section (green) showing matched ingredients from pantry
- Added "Need to buy" section (orange/yellow) showing missing ingredients
- Both sections show up to 3 items with "+N more" indicator
- Visually distinct with different colors and icons

---

## 📝 Bug Reporting Template

When adding a new bug, include:
- **Status:** 🔴 Open / 🟡 In Progress / ✅ Fixed
- **Priority:** Critical / High / Medium / Low
- **Reported:** Date
- **Location:** File path(s)
- **Issue:** Clear description of the problem
- **Expected Behavior:** What should happen
- **To Reproduce:** Steps to trigger the bug
- **Likely Cause:** (if known)

---

## 🎯 Bug Fixing Priority

1. **Critical:** App-breaking bugs (can't use core features)
2. **High:** Major functionality issues (pantry match %)
3. **Medium:** Feature incomplete or working incorrectly (shopping list combining)
4. **Low:** Minor UI issues or edge cases