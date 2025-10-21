import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveRecipe } from '../services/firestoreService';
import { scrapeRecipeFromUrl } from '../utils/recipeScraper';
import { Link2, FileEdit, Loader, AlertCircle, CheckCircle } from 'lucide-react';

function AddRecipe() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'url'

  // URL Import state
  const [recipeUrl, setRecipeUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    cookTime: '',
    servings: '',
    costPerServing: '',
    instructions: '',
    imageUrl: ''
  });

  // Ingredients state
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '' }
  ]);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Cuisine options
  const cuisineOptions = [
    'Italian', 'Asian', 'Mexican', 'American', 'Greek',
    'Mediterranean', 'Indian', 'French', 'Japanese', 'Thai', 'Other'
  ];

  // Common unit options
  const unitOptions = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'piece', 'pieces', 'clove', 'cloves', 'small', 'medium', 'large', 'whole'
  ];

  // Handle URL import
  const handleImportFromUrl = async () => {
    if (!recipeUrl.trim()) {
      setImportError('Please enter a recipe URL');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccess(false);

    try {
      const scrapedData = await scrapeRecipeFromUrl(recipeUrl);

      // Populate form with scraped data
      setFormData({
        name: scrapedData.name || '',
        description: scrapedData.description || '',
        cuisine: scrapedData.cuisine || '',
        cookTime: scrapedData.cookTime || '',
        servings: scrapedData.servings || '',
        costPerServing: scrapedData.costPerServing || '',
        instructions: scrapedData.instructions || '',
        imageUrl: scrapedData.imageUrl || ''
      });

      // Populate ingredients
      if (scrapedData.ingredients && scrapedData.ingredients.length > 0) {
        setIngredients(scrapedData.ingredients);
      }

      setImportSuccess(true);
      setImportError('');

      // Switch to manual tab after successful import
      setTimeout(() => {
        setActiveTab('manual');
        setImportSuccess(false);
      }, 1500);

    } catch (error) {
      console.error('Import error:', error);
      setImportError(error.message || 'Failed to import recipe. Please check the URL and try again.');
      setImportSuccess(false);
    } finally {
      setImporting(false);
    }
  };

  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle ingredient field changes
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  // Add new ingredient row
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  // Remove ingredient row
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // Validate form
  const validateForm = () => {
    console.log('🔍 VALIDATION STARTED');
    console.log('📋 Full ingredients array:', JSON.stringify(ingredients, null, 2));

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.cuisine) {
      newErrors.cuisine = 'Please select a cuisine';
    }

    if (!formData.cookTime || formData.cookTime <= 0) {
      newErrors.cookTime = 'Cook time must be greater than 0';
    }

    if (!formData.servings || formData.servings <= 0) {
      newErrors.servings = 'Servings must be greater than 0';
    }

    if (!formData.costPerServing || formData.costPerServing < 0) {
      newErrors.costPerServing = 'Cost per serving must be 0 or greater';
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    // DEBUG: Validate ingredients with detailed logging
    console.log('🧪 INGREDIENT VALIDATION:');
    console.log('Total ingredients in array:', ingredients.length);

    ingredients.forEach((ing, index) => {
      console.log(`\n  Ingredient #${index + 1}:`);
      console.log('    name:', `"${ing.name}"`, typeof ing.name, 'trimmed:', `"${ing.name.trim()}"`);
      console.log('    quantity:', `"${ing.quantity}"`, typeof ing.quantity);
      console.log('    unit:', `"${ing.unit}"`, typeof ing.unit);
      console.log('    Checks:');
      console.log('      - name.trim():', !!ing.name.trim());
      console.log('      - quantity exists:', !!ing.quantity);
      console.log('      - quantity.toString().trim() !== "":', ing.quantity && ing.quantity.toString().trim() !== '');
      console.log('      - parseFloat(quantity):', ing.quantity ? parseFloat(ing.quantity) : 'N/A');
      console.log('      - parseFloat(quantity) > 0:', ing.quantity ? parseFloat(ing.quantity) > 0 : false);
      console.log('      - unit exists:', !!ing.unit);

      const isValid = ing.name.trim() && ing.quantity && ing.quantity.toString().trim() !== '' && parseFloat(ing.quantity) > 0 && ing.unit;
      console.log('    ✅ VALID?', isValid);
    });

    const validIngredients = ingredients.filter(
      ing => ing.name.trim() && ing.quantity && ing.quantity.toString().trim() !== '' && parseFloat(ing.quantity) > 0 && ing.unit
    );

    console.log('\n✅ Valid ingredients count:', validIngredients.length);
    console.log('Valid ingredients:', validIngredients);

    if (validIngredients.length === 0) {
      // Find which ingredient is incomplete and what's missing
      const incompleteIngredient = ingredients[0];
      const missingFields = [];

      if (!incompleteIngredient.name.trim()) missingFields.push('name');
      if (!incompleteIngredient.quantity || incompleteIngredient.quantity.toString().trim() === '' || parseFloat(incompleteIngredient.quantity) <= 0) {
        missingFields.push('quantity');
      }
      if (!incompleteIngredient.unit) missingFields.push('unit');

      if (missingFields.length > 0) {
        newErrors.ingredients = `Please complete all ingredient fields: ${missingFields.join(', ')} required`;
      } else {
        newErrors.ingredients = 'At least one complete ingredient is required (name, quantity > 0, and unit)';
      }

      console.log('❌ INGREDIENT VALIDATION FAILED');
      console.log('Missing fields:', missingFields);
    } else {
      console.log('✅ INGREDIENT VALIDATION PASSED');
    }

    console.log('\n🔍 All validation errors:', newErrors);
    console.log('🔍 Validation result:', Object.keys(newErrors).length === 0 ? 'PASS' : 'FAIL');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter(
      ing => ing.name.trim() && ing.quantity && ing.quantity.toString().trim() !== '' && parseFloat(ing.quantity) > 0 && ing.unit
    ).map(ing => ({
      name: ing.name.trim(),
      quantity: parseFloat(ing.quantity),
      unit: ing.unit
    }));

    // Create recipe object (without ID - Firestore will generate it)
    const newRecipe = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      cuisine: formData.cuisine,
      cookTime: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      costPerServing: parseFloat(formData.costPerServing),
      ingredients: validIngredients,
      instructions: formData.instructions.trim(),
      imageUrl: formData.imageUrl.trim() || 'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=No+Image'
    };

    // Save to Firestore
    try {
      setSaving(true);
      const recipeId = await saveRecipe(newRecipe);
      console.log('Recipe saved to Firestore with ID:', recipeId);

      // Show success message
      alert('Recipe added successfully!');

      // Navigate back to recipe library
      navigate('/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recipes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recipes
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Add New Recipe</h1>
        <p className="text-gray-600 mt-2">Import from a URL or enter recipe details manually</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileEdit className="w-5 h-5" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'url'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Link2 className="w-5 h-5" />
            Import from URL
          </button>
        </div>
      </div>

      {/* URL Import Tab */}
      {activeTab === 'url' && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Import Recipe from URL</h2>
          <p className="text-gray-600 mb-6">
            Enter a recipe URL from popular sites like AllRecipes, Food Network, or NYT Cooking.
            We'll automatically extract the recipe details for you to review and edit.
          </p>

          {/* URL Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe URL *
            </label>
            <input
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              disabled={importing}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              placeholder="https://www.allrecipes.com/recipe/..."
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImportFromUrl}
            disabled={importing || !recipeUrl.trim()}
            className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Importing Recipe...
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Import Recipe
              </>
            )}
          </button>

          {/* Error Message */}
          {importError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Import Failed</p>
                <p className="text-red-700 text-sm mt-1">{importError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Recipe Imported Successfully!</p>
                <p className="text-green-700 text-sm mt-1">
                  Switching to manual entry for review and editing...
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-blue-800 font-medium mb-2">Tips for best results:</h3>
            <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
              <li>Use the full URL from the recipe page (not the homepage)</li>
              <li>Most popular recipe sites like AllRecipes, Food Network, and Bon Appétit work great</li>
              <li>After import, review and edit the recipe details before saving</li>
              <li>You may need to adjust the cost per serving manually</li>
            </ul>
          </div>
        </div>
      )}

      {/* Manual Entry Form Tab */}
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h2>

            {/* Recipe Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Classic Spaghetti Marinara"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the recipe"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Grid for Cuisine, Cook Time, Servings */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Cuisine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine *
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.cuisine ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select cuisine</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                {errors.cuisine && <p className="text-red-500 text-sm mt-1">{errors.cuisine}</p>}
              </div>

              {/* Cook Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.cookTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errors.cookTime && <p className="text-red-500 text-sm mt-1">{errors.cookTime}</p>}
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.servings ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="4"
                />
                {errors.servings && <p className="text-red-500 text-sm mt-1">{errors.servings}</p>}
              </div>
            </div>

            {/* Cost Per Serving */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Per Serving ($) *
              </label>
              <input
                type="number"
                name="costPerServing"
                value={formData.costPerServing}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.costPerServing ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5.50"
              />
              {errors.costPerServing && <p className="text-red-500 text-sm mt-1">{errors.costPerServing}</p>}
            </div>

            {/* Image URL (Optional) */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Leave blank for placeholder image</p>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ingredients *</h2>
                <p className="text-sm text-gray-600 mt-1">All fields required: name, quantity, and unit</p>
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-success text-white px-4 py-2 rounded-md hover:bg-success-hover transition-colors text-sm font-medium"
              >
                + Add Ingredient
              </button>
            </div>

            {errors.ingredients && (
              <p className="text-red-500 text-sm mb-3">{errors.ingredients}</p>
            )}

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-start">
                  {/* Ingredient Name */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="Ingredient name *"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      placeholder="Qty *"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Unit */}
                  <div className="w-32">
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                        ingredient.unit === '' ? 'text-gray-400 border-gray-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select unit *</option>
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className={`p-2 rounded-md transition-colors ${
                      ingredients.length === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Remove ingredient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Instructions *
            </h2>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="8"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.instructions ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Step-by-step instructions for preparing this recipe..."
            />
            {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions}</p>}
          </div>

          {/* Form Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Recipe'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recipes')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddRecipe;
