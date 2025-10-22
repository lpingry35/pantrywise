/**
 * ============================================================================
 * RECIPE INSTRUCTIONS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays cooking instructions in a clear, easy-to-follow format.
 * Shows step-by-step guidance for preparing the recipe.
 *
 * FEATURES:
 * - Clean, readable text formatting
 * - Light gray background for easy reading
 * - Preserves line breaks (whitespace-pre-line)
 * - Large, comfortable font size (prose-lg)
 * - Document icon in header
 *
 * WHY SEPARATE COMPONENT:
 * - Keeps recipe detail page organized
 * - Makes instructions easy to read while cooking
 * - Can be modified independently (e.g., add step numbers later)
 * - Reduces main file size for better maintainability
 *
 * TEXT FORMATTING:
 * - whitespace-pre-line: Preserves line breaks from database
 * - prose-lg: Large, comfortable reading size
 * - Rounded corners and padding for clean appearance
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {string} instructions - Recipe cooking instructions text
 */

function RecipeInstructions({ instructions }) {
  return (
    <div>
      {/* ===================================================================
          SECTION HEADER
          ===================================================================
          Title with document/paper icon
      */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {/* Document Icon */}
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Instructions
      </h2>

      {/* ===================================================================
          INSTRUCTIONS TEXT
          ===================================================================
          Formatted cooking instructions with:
          - Preserved line breaks (whitespace-pre-line)
          - Large, readable text (prose-lg)
          - Comfortable spacing (leading-relaxed)
          - Light background for easier reading (bg-gray-50)
      */}
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-lg">
          {instructions}
        </p>
      </div>
    </div>
  );
}

export default RecipeInstructions;
