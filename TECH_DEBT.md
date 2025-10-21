# 🔧 Technical Debt Tracker - Smart Meal Planner

## What is Technical Debt?

Technical debt refers to code that works but could be improved for better maintainability, performance, or scalability. These are "shortcuts" we took to ship the MVP faster that should be addressed before scaling the app.

---

## 📚 System Documentation

### How Sample Recipes Loading Works

**Feature:** "Load Sample Recipes" button in Recipe Library  
**Location:** `src/pages/RecipeLibrary.jsx`  
**Purpose:** Repopulate Firestore database with test recipes when empty

**How It Works:**
1. **Conditional Display:** Blue banner appears only when database has < 5 recipes
2. **Data Source:** Reads from `src/data/sampleRecipes.js` (25 recipes)
3. **Process:**
   - Loops through all 25 sample recipes
   - Saves each to Firestore using `saveRecipe()` from `firestoreService.js`
   - Shows progress: "Loading recipes... 5/25"
   - Reloads recipe list from Firestore when complete
4. **UI States:**
   - Loading: Button disabled, shows progress counter
   - Success: Green checkmark, "Successfully loaded 25 recipes!"
   - Auto-hide: Banner disappears after 3 seconds

**When to Use:**
- Database is empty (fresh install)
- Accidentally deleted all recipes
- Need test data for development/demo

**Technical Notes:**
- Uses `firestoreService.saveRecipe()` which auto-generates recipe IDs
- Error handling: Continues loading even if individual recipes fail
- Banner checks `recipes.length < 5` on every render
- Sample recipes remain in `sampleRecipes.js` as backup/fallback

---

### Recipe URL Scraping (Cloud Function)

**Feature:** Import recipes from website URLs  
**Location:** Firebase Cloud Function `scrapeRecipe` in `functions/index.js` (833 lines)  
**Deployed:** Node.js 20, Firebase Functions v2 API

**Parsing Strategy (Three-Tier):**
1. **Tier 1 - JSON-LD** (Primary method)
   - Searches for `<script type="application/ld+json">`
   - Looks for `@type: "Recipe"` in schema.org format
   - Handles nested `@graph` structures
   - **Works with:** AllRecipes, many modern recipe sites

2. **Tier 2 - Microdata** (Fallback 1)
   - Searches for `itemtype="schema.org/Recipe"`
   - Extracts `itemprop` attributes
   - Handles older schema.org format

3. **Tier 3 - HTML Parsing** (Fallback 2)
   - Uses CSS selectors to find ingredients/instructions
   - Tries multiple class patterns: `.recipe-ingredients`, `.ingredients-list`, etc.
   - Works even without structured data

**Special Handling:**
- **Instructions:** Parses HowToStep objects, itemListElement arrays, and text arrays
- **Cuisine:** Handles both strings and arrays
- **Ingredients:** Extracts name, quantity, and unit from various formats

**Known Issues (Bug #6 - RESOLVED):**
- Previously: Only AllRecipes worked
- Now: AllRecipes + Food Network + most schema.org sites work
- Fix: Added comprehensive browser headers (13 total) to bypass anti-scraping
- **Tech Debt (TD-008):** Function is 833 lines, needs refactoring into separate parser files

**Deployment Commands:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**Testing:**
- Test URLs: 
  - https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
  - https://www.foodnetwork.com/recipes/food-network-kitchen/3-ingredient-mac-and-cheese-18926685
- View logs: `firebase functions:log --only scrapeRecipe`
- Successful import populates AddRecipe form with recipe data

---

### Unit Conversion System

**Feature:** Convert between measurement units for accurate pantry matching  
**Location:** `src/utils/unitConverter.js` (400+ lines)  
**Status:** ✅ Completed (Phase 7.4.1)

**Overview:**
Enables accurate comparison of pantry items and recipes using different units. For example, if pantry has "2 lb flour" and recipe needs "4 cups flour", the system converts units and determines the user has enough (2 lb ≈ 7.56 cups).

**Three Conversion Types:**

1. **Volume-to-Volume**
   - Converts between: cups, ml, liters, tablespoons (tbsp), teaspoons (tsp), fluid ounces (fl oz), pints, quarts, gallons
   - Example: 2 cups → 473.18 ml
   - Base unit: milliliters (ml)

2. **Weight-to-Weight**
   - Converts between: pounds (lb), ounces (oz), grams (g), kilograms (kg), milligrams (mg)
   - Example: 1 lb → 453.6 grams
   - Base unit: grams (g)

3. **Cross-Type (Volume ↔ Weight)**
   - Requires ingredient density data
   - Example: 2 cups flour → 240g (using 120g/cup density)
   - Only works for ingredients in the density database
   - Returns null if ingredient density unknown

**Ingredient Density Database (50+ Ingredients):**

Organized by category with grams-per-cup ratios:
- **Flours & Grains:** all-purpose flour (120g/cup), bread flour (127g/cup), rice (185g/cup), pasta (100g/cup), quinoa (170g/cup)
- **Sugars:** granulated sugar (200g/cup), brown sugar (220g/cup), powdered sugar (120g/cup), honey (340g/cup)
- **Fats & Dairy:** butter (227g/cup), olive oil (216g/cup), milk (244g/cup), heavy cream (240g/cup), shredded cheese (113g/cup)
- **Vegetables:** chopped onion (160g/cup), minced garlic (136g/cup), chopped tomato (180g/cup), chopped carrot (128g/cup)
- **Proteins:** cooked chicken (140g/cup), ground beef (225g/cup)
- **Nuts:** almonds (143g/cup), walnuts (117g/cup)
- **Liquids:** water (237g/cup), broth (240g/cup)
- **Canned Goods:** crushed tomatoes (243g/cup), beans (256g/cup), chickpeas (240g/cup)

**Count-Based Unit Normalization:**
All count units normalize to "piece" for consistent comparison:
- whole → piece
- unit → piece  
- clove → piece
- item → piece
- each → piece
- serving → piece
- portion → piece

**Key Functions:**
- `convertUnit(value, fromUnit, toUnit, ingredientName)` - Main conversion function
  - Returns converted value or null if impossible
  - Uses ingredient density for cross-type conversions
- `normalizeUnit(unit)` - Standardizes unit format (handles plurals, case)
- `areUnitsCompatible(unit1, unit2, ingredientName)` - Checks if conversion possible
- `getConversionMessage(fromUnit, toUnit, ingredientName)` - User-friendly error messages

**Integration Points:**

1. **Shopping List Pantry Comparison** (`compareShoppingListWithPantry`)
   - Converts pantry quantities to recipe units before comparison
   - Shows: "Already have 2 lb ≈ 7.56 cups (need 4 cups)"
   - Accurately categorizes as "Already Have" vs "Need More"

2. **Recipe-to-Pantry Matching** (`matchRecipesToPantry`)
   - Converts units when calculating pantry match percentage
   - Shows: "Have 500g (≈2.5 cups) of 2 cups needed"
   - Enables accurate recipe suggestions based on pantry

**Example Conversions:**
- Volume: 2 cups → 473.18 ml
- Weight: 1 lb → 16 oz
- Cross-type: 2 cups flour → 240g (using 120g/cup density)
- Cross-type: 500g sugar → 2.5 cups (using 200g/cup density)
- Count: 4 whole onion = 4 piece = 4 unit (all equivalent)

**Handling Conversion Failures:**
When conversion impossible (e.g., "cups" to "grams" for unknown ingredient):
- Returns null
- UI shows: "Have 2 cups, need 500g (cannot convert units)"
- Falls back to showing both quantities without comparison

**How to Add New Ingredients:**
Edit the `ingredientDensities` object in `unitConverter.js`:
```javascript
const ingredientDensities = {
  'your ingredient': 150, // grams per cup
  // ...
};
```

**Why It's Critical:**
- Without conversion: False "different units" errors everywhere
- With conversion: Accurate pantry matching, better UX, fewer duplicate purchases
- Impact: Users can actually use the pantry feature effectively

**Future Enhancements (Phase 7.4.2):**
- User unit preferences (display everything in metric or imperial)
- Temperature conversions (Fahrenheit ↔ Celsius)
- More ingredient densities (expand to 100+ ingredients)
- User-defined custom ingredient densities

---

## 🔴 High Priority (Fix Before Production Scale)

### TD-008: Cloud Function Code Too Large (833+ Lines)
**Status:** 🔴 Not Started  
**Priority:** High  
**Reported:** Today  
**Effort:** Medium (2-3 hours)  
**Location:** `functions/index.js`

**Issue:**
- scrapeRecipe Cloud Function is 833+ lines in a single file
- Mixes concerns: HTTP handling, JSON-LD parsing, microdata parsing, HTML fallback
- Difficult to test individual parsing methods
- Hard to maintain and debug

**Recommended Fix:**
1. Create `functions/parsers/` directory
2. Split into separate files:
   - `jsonLdParser.js` - Handles JSON-LD recipe schema parsing
   - `microdataParser.js` - Handles microdata format
   - `htmlParser.js` - Handles HTML fallback scraping
   - `recipeNormalizer.js` - Normalizes recipe data from all sources
3. Keep `index.js` as orchestrator (~100 lines)
4. Each parser file ~100-150 lines
5. Add unit tests for each parser

**Target Structure:**
```
functions/
├── index.js (100 lines - main function)
├── parsers/
│   ├── jsonLdParser.js (100 lines)
│   ├── microdataParser.js (100 lines)
│   ├── htmlParser.js (150 lines)
│   └── recipeNormalizer.js (80 lines)
└── package.json
```

**Why Important:**
- Each parsing method can be tested independently
- Easier to add new recipe site support
- Better error isolation
- Future developers can understand code faster

---

### TD-001: Component File Length - Refactor Large Components
**Status:** 🔴 Not Started  
**Priority:** High  
**Reported:** Today  
**Effort:** Medium (2-4 hours)

**Issue:**
- Several components have grown too large (300+ lines)
- Makes code harder to maintain, debug, and understand
- Difficult to reuse parts of the component

**Components Needing Refactoring:**
- `src/components/RecipeCard.jsx` - Likely 200+ lines with pantry matching logic
- `src/pages/MealPlanner.jsx` - Contains calendar + shared ingredients analysis
- `src/components/MealPlannerCalendar.jsx` - Complex meal slot management
- Any other files over 300 lines

**Recommended Fix:**
1. **RecipeCard.jsx**: Extract pantry match display into separate `PantryMatchInfo` component
2. **MealPlanner.jsx**: Move shared ingredients section to `SharedIngredientsPanel` component
3. **MealPlannerCalendar.jsx**: Extract meal slot logic to `MealSlot` component
4. Move complex logic to utility functions where possible
5. Create smaller, focused sub-components

**Target:** Keep all components under 200 lines, utilities under 300 lines

**Why Important:**
- Easier onboarding for new developers
- Faster debugging and testing
- Better code reusability
- Improved performance (smaller components re-render less)

---

## 🟡 Medium Priority (Post-MVP, Pre-Scale)

### TD-002: Ingredient Normalization Logic Consolidation
**Status:** 🟡 Not Started  
**Priority:** Medium  
**Effort:** Small (1-2 hours)

**Issue:**
- Ingredient normalization logic exists in multiple files
- `ingredientMatching.js` has one approach
- `shoppingListGenerator.js` has slight variations
- Risk of inconsistencies as app grows

**Recommended Fix:**
- Create single `src/utils/ingredientNormalizer.js` 
- Centralize all normalization logic (units, quantities, synonyms)
- Import and use consistently across all files
- Add comprehensive unit tests

---

### TD-003: Add Unit Tests for Core Utilities
**Status:** 🟡 Not Started  
**Priority:** Medium  
**Effort:** Medium (3-5 hours)

**Issue:**
- No automated tests for critical business logic
- High risk of breaking features when making changes
- Difficult to confidently refactor code

**Files Needing Tests:**
- `src/utils/ingredientMatching.js` (highest priority - core feature)
- `src/utils/shoppingListGenerator.js`
- `src/utils/sharedIngredientsAnalyzer.js`
- `src/utils/savingsCalculator.js` (when built)

**Recommended Fix:**
- Set up Jest testing framework
- Write unit tests for all utility functions
- Aim for 80%+ code coverage on utilities
- Add integration tests for key user flows

---

### TD-004: Error Handling & User Feedback
**Status:** 🟡 Not Started  
**Priority:** Medium  
**Effort:** Medium (2-3 hours)

**Issue:**
- Limited error handling for edge cases
- No loading states for async operations
- Missing validation messages in some forms
- No global error boundary for React errors

**Recommended Fix:**
- Add React Error Boundary component
- Implement loading spinners for all async operations
- Add try-catch blocks around Firebase operations
- Show user-friendly error messages (not console errors)
- Add form validation feedback on all forms

---

## 🟢 Low Priority (Nice-to-Have Improvements)

### TD-005: Performance Optimization
**Status:** 🟢 Not Started  
**Priority:** Low  
**Effort:** Small-Medium (2-4 hours)

**Issue:**
- No performance optimization done yet
- Large recipe lists could slow down rendering
- Re-renders happening unnecessarily

**Recommended Fix:**
- Add React.memo() to expensive components
- Use useMemo() and useCallback() for heavy computations
- Implement virtual scrolling for long recipe lists
- Lazy load recipe images
- Add loading skeletons for better UX

---

### TD-006: Code Documentation
**Status:** 🟢 Not Started  
**Priority:** Low  
**Effort:** Small (1-2 hours)

**Issue:**
- Limited JSDoc comments on functions
- No inline comments explaining complex logic
- New developers would struggle to understand code

**Recommended Fix:**
- Add JSDoc comments to all exported functions
- Document complex algorithms (especially ingredient matching)
- Add README files in key directories explaining structure
- Create CONTRIBUTING.md for future developers

---

### TD-007: TypeScript Migration
**Status:** 🟢 Not Started  
**Priority:** Low  
**Effort:** Large (10+ hours)

**Issue:**
- Using plain JavaScript - no type safety
- Easy to pass wrong prop types
- Harder to catch bugs at compile time

**Recommended Fix:**
- Gradually migrate to TypeScript
- Start with utility files (easiest)
- Then contexts and services
- Finally components
- Use strict mode for maximum benefit

**Why Wait:**
- Not critical for MVP
- Time-consuming migration
- Better to do after product-market fit established

---

## 📊 Technical Debt Summary

**Total Items:** 7  
**High Priority:** 1  
**Medium Priority:** 3  
**Low Priority:** 3  

**Estimated Total Effort:** 20-30 hours

---

## When to Address Tech Debt

### Before Production Launch:
- TD-001 (Component refactoring) - Critical for maintainability
- TD-004 (Error handling) - Critical for user experience

### After MVP, Before Scaling:
- TD-002 (Normalization consolidation)
- TD-003 (Unit tests)
- TD-005 (Performance optimization)

### Long-term Improvements:
- TD-006 (Documentation)
- TD-007 (TypeScript migration)

---

## Adding New Tech Debt Items

When identifying tech debt, include:
- **ID Number:** TD-XXX
- **Status:** 🔴 High / 🟡 Medium / 🟢 Low priority
- **Effort Estimate:** Small (1-2h) / Medium (2-5h) / Large (5+ h)
- **Issue Description:** What's the problem?
- **Recommended Fix:** How to solve it?
- **Why Important:** Impact on project

---

## Completed Tech Debt

*(Tech debt items will be moved here once resolved)*