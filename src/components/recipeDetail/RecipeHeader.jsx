/**
 * ============================================================================
 * RECIPE HEADER COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays the top section of the recipe detail page with hero image,
 * recipe name, description, and cuisine badge.
 *
 * WHAT IT SHOWS:
 * - Large hero image (fills width, 384px height on desktop)
 * - Cuisine badge overlay (top right corner of image)
 * - Recipe name as main heading (large, bold)
 * - Recipe description/summary text
 *
 * WHY SEPARATE COMPONENT:
 * - Keeps main RecipeDetail.jsx focused on logic
 * - Easy to modify header styling independently
 * - Can reuse for recipe preview cards if needed
 * - Makes code more maintainable (1200+ lines → smaller files)
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {object} recipe - Recipe object with name, imageUrl, description, cuisine
 */

function RecipeHeader({ recipe }) {
  return (
    <>
      {/* ===================================================================
          HERO IMAGE SECTION
          ===================================================================
          Full-width recipe image with cuisine badge overlay
          Height is 384px (96 * 4 = h-96 in Tailwind)
      */}
      <div className="relative h-96 overflow-hidden">
        {/* Recipe Image */}
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />

        {/* Cuisine Badge - Positioned in top right corner */}
        <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-lg font-medium">
          {recipe.cuisine}
        </div>
      </div>

      {/* ===================================================================
          RECIPE TITLE AND DESCRIPTION
          ===================================================================
          Main heading and descriptive text below the image
      */}
      <div className="mb-6">
        {/* Recipe Name - Large, bold heading */}
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {recipe.name}
        </h1>

        {/* Recipe Description - Summary or overview text */}
        <p className="text-lg text-gray-600">
          {recipe.description}
        </p>
      </div>
    </>
  );
}

export default RecipeHeader;
