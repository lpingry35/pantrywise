import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ============================================================================
 * EDIT RECIPE MODAL COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Modal dialog that allows users to edit all fields of a recipe.
 * Changes are saved to Firestore when user clicks "Save Changes".
 *
 * FEATURES:
 * - Edit basic info: name, description, cuisine
 * - Edit recipe stats: cook time, servings, cost per serving
 * - Edit ingredients: quantity, unit, name for each ingredient
 * - Edit instructions: full text area for cooking steps
 * - Validates required fields (recipe name)
 * - Pre-fills all fields with current recipe data
 *
 * HOW IT WORKS:
 * 1. User clicks "Edit Recipe" button on recipe detail page
 * 2. Modal opens with all fields pre-filled
 * 3. User modifies any fields
 * 4. User clicks "Save Changes"
 * 5. Validation runs (name is required)
 * 6. Parent component saves to Firestore
 * 7. Modal closes and recipe detail page updates
 *
 * INGREDIENTS EDITING:
 * - Each ingredient has 3 fields: quantity, unit, name
 * - Displayed in a scrollable grid (handles many ingredients)
 * - All ingredients editable in-place
 *
 * STATE:
 * - editedRecipe: Local copy of recipe being edited
 * - Updates when recipe prop changes (handles external updates)
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {object} recipe - Recipe to edit
 * @param {function} onSave - Function to call when saving (editedRecipe)
 */

function EditRecipeModal({ isOpen, onClose, recipe, onSave }) {
  const [editedRecipe, setEditedRecipe] = useState(recipe);

  // Update local state when recipe prop changes
  // This handles cases where recipe is updated externally
  useEffect(() => {
    if (recipe) {
      setEditedRecipe(recipe);
    }
  }, [recipe]);

  /**
   * Handle changes to basic recipe fields (name, description, etc.)
   * Updates the editedRecipe state
   */
  const handleChange = (field, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle changes to individual ingredient fields
   * Updates a specific ingredient in the ingredients array
   */
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  /**
   * Handle saving the edited recipe
   * Validates required fields and calls parent save handler
   */
  const handleSave = async () => {
    // Validate required fields
    if (!editedRecipe.name || !editedRecipe.name.trim()) {
      alert('Recipe name is required');
      return;
    }

    await onSave(editedRecipe);
    onClose();
  };

  // Don't render if modal is closed or no recipe
  if (!isOpen || !recipe) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================
            MODAL HEADER
            ===================================================================
            Title and close button
        */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Recipe</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ===================================================================
            RECIPE NAME (Required)
            ===================================================================
            Main identifier for the recipe
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Recipe Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editedRecipe.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter recipe name"
          />
        </div>

        {/* ===================================================================
            DESCRIPTION
            ===================================================================
            Brief summary or overview of the recipe
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description:
          </label>
          <input
            type="text"
            value={editedRecipe.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the recipe"
          />
        </div>

        {/* ===================================================================
            CUISINE
            ===================================================================
            Type of cuisine (Italian, Mexican, etc.)
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cuisine:
          </label>
          <input
            type="text"
            value={editedRecipe.cuisine}
            onChange={(e) => handleChange('cuisine', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Italian, Mexican, Asian"
          />
        </div>

        {/* ===================================================================
            RECIPE STATS (Cook Time, Servings, Cost)
            ===================================================================
            Three number inputs in a grid layout
        */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Cook Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cook Time (min):
            </label>
            <input
              type="number"
              value={editedRecipe.cookTime}
              onChange={(e) => handleChange('cookTime', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Servings */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Servings:
            </label>
            <input
              type="number"
              value={editedRecipe.servings}
              onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cost Per Serving */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cost ($/serving):
            </label>
            <input
              type="number"
              step="0.01"
              value={editedRecipe.costPerServing}
              onChange={(e) => handleChange('costPerServing', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ===================================================================
            INGREDIENTS LIST (Editable)
            ===================================================================
            Three-column grid for each ingredient: quantity, unit, name
            Scrollable to handle long ingredient lists
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Ingredients:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {editedRecipe.ingredients && editedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                {/* Quantity Input */}
                <input
                  type="number"
                  step="0.01"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Qty"
                />

                {/* Unit Input */}
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Unit"
                />

                {/* Ingredient Name Input */}
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Ingredient"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================
            INSTRUCTIONS (Text Area)
            ===================================================================
            Large text area for cooking instructions
        */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Instructions:
          </label>
          <textarea
            value={editedRecipe.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Step-by-step cooking instructions..."
          />
        </div>

        {/* ===================================================================
            ACTION BUTTONS
            ===================================================================
            Cancel or save changes
        */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditRecipeModal;
