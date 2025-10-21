# Smart Meal Planner - Project Guide for Claude Code

This document guides Claude Code on our project architecture, conventions, and how to build features consistently.

---

## Project Overview

**Goal:** A meal planning app that helps users save money by suggesting recipes that share ingredients.

**Core Features (MVP):**
- Recipe library with search/filters
- Manual recipe entry
- Weekly meal planner
- Ingredient matching (find recipes that share ingredients)
- Consolidated shopping list
- Savings calculator

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Firebase or Supabase
- State Management: React hooks (useState, useContext)
- Routing: React Router

---

## Folder Structure

```
cooking-website/
├── public/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeDetail.jsx
│   │   ├── MealPlannerCalendar.jsx
│   │   ├── ShoppingList.jsx
│   │   ├── SavingsDisplay.jsx
│   │   └── ... (other components)
│   ├── pages/               # Full page components
│   │   ├── Home.jsx
│   │   ├── RecipeLibrary.jsx
│   │   ├── MealPlanner.jsx
│   │   ├── ShoppingListPage.jsx
│   │   └── ... (other pages)
│   ├── utils/               # Helper functions & algorithms
│   │   ├── ingredientMatching.js
│   │   ├── shoppingListGenerator.js
│   │   ├── savingsCalculator.js
│   │   └── ... (other utilities)
│   ├── data/                # Mock data & constants
│   │   ├── sampleRecipes.js
│   │   ├── ingredientSynonyms.js
│   │   └── ... (other data)
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── App.jsx              # Main app component
│   └── index.js             # Entry point
├── package.json
├── PROJECT.md               # This file
└── README.md
```

---

## Naming Conventions

### Components
- **File names:** PascalCase (e.g., `RecipeCard.jsx`, `MealPlannerCalendar.jsx`)
- **Component names:** Match file name (e.g., `export function RecipeCard() {}`)
- **Props:** camelCase (e.g., `recipeName`, `onAddRecipe`)

### Functions & Variables
- **camelCase:** `findSharedIngredients()`, `generateShoppingList()`, `calculateSavings()`
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RECIPES_PER_DAY`)

### Data Models
- **Recipes:**
  ```javascript
  {
    id: "string",
    name: "string",
    description: "string",
    cuisine: "string",
    cookTime: number,         // minutes
    servings: number,
    ingredients: [
      { name: "string", quantity: number, unit: "string" }
    ],
    instructions: "string",
    costPerServing: number,   // USD
    imageUrl: "string"
  }
  ```

- **MealPlans:**
  ```javascript
  {
    id: "string",
    weekOf: "date",
    meals: {
      monday: { breakfast: recipeId, lunch: recipeId, dinner: recipeId },
      tuesday: { ... },
      // ... (rest of week)
    },
    createdAt: "date",
    name: "string"
  }
  ```

---

## Key Utilities (Core Business Logic)

### `ingredientMatching.js`
- `normalizeIngredient(ingredientString)` → Returns standardized ingredient name
- `findSharedIngredients(recipe1, recipe2)` → Array of shared ingredient names
- `calculateMatchScore(recipe1, recipe2)` → Number (0-100) representing % overlap
- `suggestRecipes(selectedRecipe, allRecipes, limit = 5)` → Array of suggested recipes ranked by match score

### `shoppingListGenerator.js`
- `generateShoppingList(recipes, servingsMap)` → Consolidated shopping list grouped by category
- `groupByCategory(ingredients)` → Organizes ingredients by type (Proteins, Vegetables, etc.)
- `combineQuantities(ingredients)` → Merges duplicate ingredients and sums quantities

### `savingsCalculator.js`
- `calculateIndividualCost(recipes, servingsMap)` → Sum of all recipes bought separately
- `calculateCombinedCost(shoppingList)` → Cost of buying all unique ingredients
- `calculateSavings(individualCost, combinedCost)` → Returns object with dollar amount and percentage

---

## Component Architecture

### Pages (Full-page components)
- Handle routing and page-level state
- Fetch data from Firebase/database
- Pass data to child components

### Components (Reusable pieces)
- Receive data via props
- Handle local state for UI interactions
- Call parent callbacks via props for data changes
- Keep components focused (one responsibility)

### Example Component Pattern:
```javascript
function RecipeCard({ recipe, onSelect, onAddToMealPlan }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.name}</h3>
      <p>Cook time: {recipe.cookTime} min</p>
      <p>Cost: ${recipe.costPerServing}</p>
      <button onClick={() => onSelect(recipe.id)}>View Details</button>
      <button onClick={() => onAddToMealPlan(recipe.id)}>Add to Plan</button>
    </div>
  );
}
```

---

## Styling Rules

- **Framework:** Tailwind CSS
- **Use utility classes:** `className="flex gap-4 p-6 bg-white rounded-lg"`
- **No custom CSS unless necessary** — prefer Tailwind utilities
- **Mobile-first approach** — design for mobile, scale up
- **Color palette** (define as needed):
  - Primary: `blue-600`
  - Success: `green-600`
  - Warning: `yellow-500`
  - Danger: `red-600`

---

## Data Flow

1. **Pages** fetch recipes/meal plans from Firebase
2. **Pages** manage top-level state (selectedRecipe, currentMealPlan, etc.)
3. **Pages** pass data + callbacks to components
4. **Components** display data and call parent functions when user interacts
5. **Utils** handle all business logic (matching, calculations, filtering)

---

## Development Workflow

1. **Start with a page:** Create the page component that shows all the UI
2. **Break into components:** Extract sections into reusable components
3. **Add business logic:** Implement utility functions for calculations
4. **Connect to data:** Wire up Firebase reads/writes
5. **Test & iterate:** Verify data flows correctly

---

## Common Requests to Claude Code

When asking Claude Code to build features, be specific:

✅ **Good:** "Create a RecipeCard component that displays recipe name, image, cook time, cost, and an 'Add to Meal Plan' button. Props: recipe (object), onAddToMealPlan (function)."

✅ **Good:** "Build a function called `findSharedIngredients` that takes two recipes and returns an array of ingredient names they share."

❌ **Vague:** "Build the meal planner"

❌ **Vague:** "Make ingredient matching work"

---

## Error Handling Patterns

### Component-Level Errors
```javascript
function RecipeCard({ recipe }) {
  if (!recipe) {
    return <div className="text-red-600">Recipe data missing</div>;
  }
  // ... rest of component
}
```

### Async Operations
```javascript
try {
  const recipes = await fetchRecipes();
  setRecipes(recipes);
  setError(null);
} catch (err) {
  setError("Failed to load recipes. Please try again.");
  console.error(err);
}
```

### Error Boundaries (for React errors)
Create an ErrorBoundary component to catch rendering errors and show fallback UI.

---

## Loading & Empty States

**Loading State Pattern:**
```javascript
{isLoading && <div>Loading recipes...</div>}
{!isLoading && recipes.length === 0 && <div>No recipes found. Add your first recipe!</div>}
{!isLoading && recipes.length > 0 && <RecipeGrid recipes={recipes} />}
```

**Always show:**
- Loading spinners for async operations
- Empty state messages with clear next actions
- Error messages with retry options

---

## Form Validation

**Client-Side Validation:**
- Required fields: Show error message if empty on submit
- Number fields: Validate positive numbers only
- Text fields: Trim whitespace, enforce max length
- Provide immediate feedback (highlight invalid fields)

**Example Pattern:**
```javascript
const [errors, setErrors] = useState({});

function validateRecipe(recipe) {
  const newErrors = {};
  if (!recipe.name?.trim()) newErrors.name = "Recipe name is required";
  if (!recipe.cookTime || recipe.cookTime <= 0) newErrors.cookTime = "Cook time must be positive";
  return newErrors;
}

function handleSubmit(e) {
  e.preventDefault();
  const validationErrors = validateRecipe(recipe);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  // Proceed with save
}
```

---

## Environment Setup

**Create `.env` file in root:**
```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

**Access in code:**
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

**Never commit `.env` to git** - add it to `.gitignore`

---

## Accessibility Guidelines

**Minimum Requirements:**
- All buttons have descriptive text or `aria-label`
- Form inputs have associated `<label>` tags
- Images have `alt` text
- Keyboard navigation works (Tab through interactive elements)
- Focus states visible (don't remove outline without replacement)
- Color contrast meets WCAG AA standards

**Example:**
```javascript
<button 
  onClick={handleAdd}
  aria-label="Add recipe to meal plan"
  className="focus:ring-2 focus:ring-blue-500"
>
  Add
</button>
```

---

## Backend Choice: Firebase vs Supabase

**Choose Firebase if:**
- Want easiest setup (built-in auth, realtime DB)
- Comfortable with NoSQL (Firestore)
- Free tier is generous for MVP

**Choose Supabase if:**
- Prefer SQL/Postgres
- Want more control over database structure
- Like open-source tools

**Recommendation for MVP:** Firebase - faster setup, better docs for beginners.

---

## Important Notes

- **No localStorage:** Use Firebase/Supabase for all data persistence
- **Ingredient matching:** Currently uses simple synonym map (~30 common ingredients). Will upgrade to API (Spoonacular) when adding recipe scraping in Phase 2.
- **Unit conversion:** Skipped for MVP. Users should enter similar units.
- **User accounts:** Not required for MVP. All data stored anonymously.
- **Error handling:** Always handle errors gracefully with user-friendly messages
- **Loading states:** Never leave users wondering if something is happening

---

## Next Steps

See `DEVELOPMENT_PLAN.md` for the detailed 4-week roadmap and feature breakdown.