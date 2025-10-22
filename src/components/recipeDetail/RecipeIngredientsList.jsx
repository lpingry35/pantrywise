import { formatQuantity } from '../../utils/unitConverter';

/**
 * ============================================================================
 * RECIPE INGREDIENTS LIST COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays all recipe ingredients with quantities and units in a clean,
 * numbered list format for easy reference while cooking.
 *
 * FEATURES:
 * - Numbered ingredient list (1, 2, 3...)
 * - Formatted quantities (handles fractions like 1.5 → "1 ½")
 * - Unit display (cups, tbsp, tsp, oz, etc.)
 * - Ingredient name in clear text
 * - Hover effect for better interactivity
 * - Light gray background for each item
 *
 * WHY SEPARATE COMPONENT:
 * - Keeps recipe detail page organized
 * - Makes ingredients easy to scan while cooking
 * - Can be modified independently (e.g., add checkboxes later)
 * - Reduces main file size for better maintainability
 *
 * DATA FORMAT:
 * Each ingredient is an object with:
 * - quantity: Number (e.g., 2, 1.5, 0.25)
 * - unit: String (e.g., "cups", "tbsp", "tsp")
 * - name: String (e.g., "flour", "sugar", "milk")
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {array} ingredients - Array of ingredient objects
 */

function RecipeIngredientsList({ ingredients }) {
  return (
    <div>
      {/* ===================================================================
          SECTION HEADER
          ===================================================================
          Title with clipboard icon
      */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {/* Clipboard Icon */}
        <svg
          className="w-6 h-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Ingredients
      </h2>

      {/* ===================================================================
          INGREDIENTS LIST
          ===================================================================
          Numbered list with quantity, unit, and ingredient name
          Each item has:
          - Numbered badge (1, 2, 3...) in blue circle
          - Quantity + unit in bold
          - Ingredient name in regular weight
      */}
      <ul className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Number Badge - Blue circle with white number */}
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
              {index + 1}
            </div>

            {/* Ingredient Details */}
            <div className="flex-1">
              {/* Quantity and Unit - Bold for emphasis */}
              <span className="font-medium text-gray-800">
                {formatQuantity(ingredient.quantity, ingredient.unit)} {ingredient.unit}
              </span>

              {/* Ingredient Name - Regular weight */}
              <span className="text-gray-600"> {ingredient.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecipeIngredientsList;
