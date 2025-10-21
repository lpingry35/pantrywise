import { useState, useMemo } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
import { generateShoppingList, exportShoppingListText } from '../utils/shoppingListGenerator';
import { compareShoppingListWithPantry } from '../utils/ingredientMatching';
// Import ShoppingCart icon for Shopping List page header
import { ShoppingCart } from 'lucide-react';
// Import formatQuantity for clean display of can units
import { formatQuantity } from '../utils/unitConverter';

function ShoppingListPage() {
  // Get meal plan and pantry items from context
  const { mealPlan, pantryItems, transferShoppingListToPantry, clearMealPlan } = useMealPlan();
  const [checkedItems, setCheckedItems] = useState({});
  const [showAlreadyHave, setShowAlreadyHave] = useState(true); // Show by default
  const [showTransferConfirm, setShowTransferConfirm] = useState(false); // Transfer confirmation dialog
  const [transferMessage, setTransferMessage] = useState({ type: '', text: '' }); // Success/error message
  const [transferring, setTransferring] = useState(false); // Loading state

  // State for editable quantities (what user actually bought)
  const [editableItems, setEditableItems] = useState([]);

  // Generate shopping list from meal plan
  const shoppingList = generateShoppingList(mealPlan);

  // Flatten all items from all categories for pantry comparison
  const allShoppingItems = useMemo(() => {
    const items = [];
    Object.values(shoppingList.items).forEach(categoryItems => {
      items.push(...categoryItems);
    });
    return items;
  }, [shoppingList.items]);

  // Compare with pantry to categorize items
  const categorizedItems = useMemo(() => {
    return compareShoppingListWithPantry(allShoppingItems, pantryItems);
  }, [allShoppingItems, pantryItems]);

  // Calculate savings (rough estimate: $3 average per item already have)
  const estimatedSavings = categorizedItems.alreadyHave.length * 3;

  // Calculate dynamic "Need to Buy" count (total items minus checked items)
  const totalNeedToBuy = categorizedItems.needToBuy.length + categorizedItems.needMore.length;

  // Count checked items from needMore and needToBuy categories
  const checkedNeedToBuyCount = [...categorizedItems.needMore, ...categorizedItems.needToBuy]
    .filter(item => {
      const itemKey = `${item.name}-${item.quantity}-${item.unit}`;
      return checkedItems[itemKey];
    }).length;

  const remainingNeedToBuy = totalNeedToBuy - checkedNeedToBuyCount;

  // Toggle checkbox
  const toggleItem = (itemName) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Export shopping list
  const handleExport = () => {
    const text = exportShoppingListText(shoppingList);
    // For now, just show in alert
    // TODO: Create proper export (download as text file, copy to clipboard, etc.)
    alert(text);

    // Also log to console for copying
    console.log(text);
  };

  // ============================================================================
  // TRANSFER TO PANTRY - OPEN DIALOG
  // Opens the transfer dialog and initializes editable quantities
  // ============================================================================

  /**
   * Opens the transfer dialog and initializes items with recipe quantities
   */
  const openTransferDialog = () => {
    // Get all items that need to be bought
    const itemsToTransfer = [...categorizedItems.needMore, ...categorizedItems.needToBuy];

    if (itemsToTransfer.length === 0) {
      setTransferMessage({
        type: 'error',
        text: 'No items to transfer! All items are already in your pantry.'
      });
      return;
    }

    // Initialize editable items with recipe quantities
    // User can modify these to match what they actually bought
    const initialEditableItems = itemsToTransfer.map((item, index) => ({
      id: `${item.name}-${index}`, // Unique ID for React keys
      originalName: item.name,
      name: item.name,
      recipeQuantity: item.needQty || item.quantity, // What recipe needs
      recipeUnit: item.unit || '',
      purchasedQuantity: item.needQty || item.quantity, // Pre-fill with recipe amount
      purchasedUnit: item.unit || '',
      skip: false // Whether to skip this item (user didn't buy it)
    }));

    setEditableItems(initialEditableItems);
    setShowTransferConfirm(true);
  };

  // ============================================================================
  // UPDATE EDITABLE ITEM
  // Updates quantity/unit/skip for a specific item
  // ============================================================================

  /**
   * Updates a field for a specific editable item
   * @param {string} itemId - ID of the item to update
   * @param {string} field - Field to update (purchasedQuantity, purchasedUnit, or skip)
   * @param {any} value - New value
   */
  const updateEditableItem = (itemId, field, value) => {
    setEditableItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // ============================================================================
  // USE RECIPE AMOUNTS
  // Quickly fills all items with recipe amounts
  // ============================================================================

  /**
   * Sets all items to use their recipe amounts (for when user bought exact amounts)
   */
  const useRecipeAmounts = () => {
    setEditableItems(prev =>
      prev.map(item => ({
        ...item,
        purchasedQuantity: item.recipeQuantity,
        purchasedUnit: item.recipeUnit,
        skip: false
      }))
    );
  };

  // ============================================================================
  // TRANSFER TO PANTRY
  // Transfers items with user-specified quantities to pantry
  // ============================================================================

  /**
   * Handles the transfer of shopping items to pantry with actual purchased amounts
   * @param {boolean} clearAfterTransfer - Whether to clear the meal plan (shopping list) after transfer
   */
  const handleTransferToPantry = async (clearAfterTransfer = false) => {
    try {
      setTransferring(true);

      // Filter out skipped items and validate quantities
      const itemsToTransfer = editableItems
        .filter(item => !item.skip) // Remove skipped items
        .map(item => ({
          name: item.name,
          quantity: parseFloat(item.purchasedQuantity) || 0, // Use purchased amount, not recipe amount!
          unit: item.purchasedUnit.trim()
        }))
        .filter(item => item.quantity > 0); // Remove items with invalid/zero quantities

      if (itemsToTransfer.length === 0) {
        setTransferMessage({
          type: 'error',
          text: 'No items to transfer! Please specify quantities or uncheck "Skip" for at least one item.'
        });
        setTransferring(false);
        return;
      }

      // Call the transfer function from context with ACTUAL purchased amounts
      const result = transferShoppingListToPantry(itemsToTransfer);

      if (result.success) {
        // Show success message
        setTransferMessage({
          type: 'success',
          text: result.message
        });

        // Optionally clear the meal plan (which clears the shopping list)
        if (clearAfterTransfer) {
          clearMealPlan();
        }

        // Hide confirmation dialog
        setShowTransferConfirm(false);
        setEditableItems([]);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setTransferMessage({ type: '', text: '' });
        }, 5000);
      } else {
        // Show error message
        setTransferMessage({
          type: 'error',
          text: result.message
        });

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setTransferMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setTransferMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setTransferring(false);
    }
  };

  // Check if there are any items
  const hasItems = shoppingList.totalItems > 0;

  // Render "Already Have" item with enhanced display
  const renderAlreadyHaveItem = (item) => {
    const itemKey = `${item.name}-${item.quantity}-${item.unit}`;

    // Parse conversion info from message or data
    const pantryQty = item.pantryQty;
    const pantryUnit = item.pantryUnit || '';
    const recipeQty = item.quantity;
    const recipeUnit = item.unit || '';

    // Check if units are different (conversion happened)
    const unitsAreDifferent = pantryUnit.toLowerCase() !== recipeUnit.toLowerCase();

    // Extract converted value from message if it exists
    const conversionMatch = item.message?.match(/≈\s*(\d+\.?\d*)\s*(\w+)/);
    const convertedValue = conversionMatch ? conversionMatch[1] : null;

    return (
      <li
        key={itemKey}
        className="flex items-start gap-3 p-3 rounded-lg"
      >
        {/* Status Icon - Checkmark (visual indicator only, not interactive) */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Item Details - Enhanced Format */}
        <div className="flex-1">
          <div className="text-gray-800">
            {/* Ingredient Name (Bold) */}
            <span className="font-bold capitalize">{item.name}:</span>
            {' '}

            {/* Pantry Quantity */}
            <span className="text-gray-700">
              Have {formatQuantity(pantryQty, pantryUnit)} {pantryUnit}
              {unitsAreDifferent && convertedValue && (
                <span className="text-green-700"> (≈{formatQuantity(parseFloat(convertedValue), recipeUnit)} {recipeUnit})</span>
              )}
            </span>

            {/* Separator */}
            <span className="text-gray-500 mx-2">•</span>

            {/* Recipe Requirement */}
            <span className="text-gray-600">
              Recipe needs {formatQuantity(recipeQty, recipeUnit)} {recipeUnit}
            </span>
          </div>
        </div>
      </li>
    );
  };

  // Render item component (for Need More and Need to Buy sections)
  const renderItem = (item, statusColor) => {
    const itemKey = `${item.name}-${item.quantity}-${item.unit}`;
    const isChecked = checkedItems[itemKey] || false;

    return (
      <li
        key={itemKey}
        className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
          isChecked ? 'bg-gray-50' : ''
        }`}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleItem(itemKey)}
          className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
        />

        {/* Item Details */}
        <div className="flex-1">
          <div className={`${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            <span className="font-semibold">
              {item.status === 'partial' && item.needQty
                ? `${formatQuantity(item.needQty, item.unit)} ${item.unit}`
                : `${formatQuantity(item.quantity, item.unit)} ${item.unit}`}
            </span>
            {' '}
            <span className="capitalize">{item.name}</span>
          </div>
          {item.message && (
            <div className="text-sm text-gray-600 mt-1">{item.message}</div>
          )}
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0">
          {item.status === 'have' && (
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {item.status === 'partial' && (
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header with Icon */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          {/* ShoppingCart icon for Shopping List - visually represents shopping/purchasing */}
          <ShoppingCart size={32} className="text-primary" aria-hidden="true" />
          <span>Shopping List</span>
        </h1>
        <p className="text-gray-600">
          Smart shopping list with pantry awareness
        </p>
      </div>

      {/* Success/Error Message Notification */}
      {transferMessage.text && (
        <div className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 animate-slide-in ${
          transferMessage.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {transferMessage.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <div className="flex-1">
            <p className="font-semibold">{transferMessage.text}</p>
          </div>
          <button
            onClick={() => setTransferMessage({ type: '', text: '' })}
            className="flex-shrink-0 hover:opacity-70"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {hasItems ? (
        <>
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Items</div>
                <div className="text-3xl font-bold text-primary">{shoppingList.totalItems}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                <div className="text-3xl font-bold text-success">${shoppingList.totalCost}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Estimated Savings</div>
                <div className="text-3xl font-bold text-green-700">${estimatedSavings}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Need to Buy</div>
                <div className="text-3xl font-bold text-orange-600">
                  {remainingNeedToBuy}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Checked Off</div>
                <div className="text-3xl font-bold text-gray-700">
                  {Object.values(checkedItems).filter(Boolean).length}
                </div>
              </div>
            </div>

            {/* Toggle and Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              {/* Show/Hide Already Have Toggle */}
              {pantryItems.length > 0 && categorizedItems.alreadyHave.length > 0 && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Show items I already have
                  </label>
                  <button
                    onClick={() => setShowAlreadyHave(!showAlreadyHave)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      showAlreadyHave ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        showAlreadyHave ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Transfer to Pantry Button - Primary Action */}
                <button
                  onClick={openTransferDialog}
                  disabled={transferring || (categorizedItems.needMore.length === 0 && categorizedItems.needToBuy.length === 0)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {transferring ? 'Transferring...' : 'Transfer to Pantry'}
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export List
                </button>
              </div>
            </div>
          </div>

          {/* Three-Tier Shopping List */}
          <div className="space-y-6">
            {/* Already Have Section (Green) - Only show if toggle is on */}
            {showAlreadyHave && categorizedItems.alreadyHave.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                  <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Already Have
                    <span className="text-sm font-normal text-green-700 ml-2">
                      ({categorizedItems.alreadyHave.length} {categorizedItems.alreadyHave.length === 1 ? 'item' : 'items'})
                    </span>
                  </h2>
                  <p className="text-sm text-green-700 mt-1">
                    These items are in your pantry with sufficient quantity
                  </p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {categorizedItems.alreadyHave.map((item) => renderAlreadyHaveItem(item))}
                  </ul>
                </div>
              </div>
            )}

            {/* Need More Section (Yellow) */}
            {categorizedItems.needMore.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-yellow-500">
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                  <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Need More
                    <span className="text-sm font-normal text-yellow-700 ml-2">
                      ({categorizedItems.needMore.length} {categorizedItems.needMore.length === 1 ? 'item' : 'items'})
                    </span>
                  </h2>
                  <p className="text-sm text-yellow-700 mt-1">
                    You have some of these items, but need to buy more
                  </p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {categorizedItems.needMore.map((item) => renderItem(item, 'yellow'))}
                  </ul>
                </div>
              </div>
            )}

            {/* Need to Buy Section (Orange) */}
            {categorizedItems.needToBuy.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-orange-500">
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                  <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Need to Buy
                    <span className="text-sm font-normal text-orange-700 ml-2">
                      ({categorizedItems.needToBuy.length} {categorizedItems.needToBuy.length === 1 ? 'item' : 'items'})
                    </span>
                  </h2>
                  <p className="text-sm text-orange-700 mt-1">
                    These items are not in your pantry
                  </p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {categorizedItems.needToBuy.map((item) => renderItem(item, 'orange'))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ===================================================================
            EMPTY STATE - WELCOME NEW USERS TO SHOPPING LIST
            ===================================================================
            SHOW WHEN: User has 0 items in their shopping list (no meal plan)
            PURPOSE: Guide new users to create a meal plan to generate shopping list
            BENEFIT: Automatic shopping list generation from meal plan
        */
        <div className="mt-4 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🛒 Your Shopping List is Empty
            </h3>
            <p className="text-gray-700 mb-2">
              Create a meal plan to automatically generate a shopping list, or add items manually.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>✓ Add recipes to your meal plan for automatic shopping lists</li>
              <li>✓ Smart pantry comparison shows what you already have</li>
              <li>✓ See estimated costs and savings before you shop</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
              {/* Primary action: Go to Meal Planner */}
              <a
                href="/meal-planner"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-md hover:from-orange-700 hover:to-amber-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📅 Go to Meal Planner
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {hasItems && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Pantry-Aware Shopping List
              </h3>
              <p className="text-sm text-blue-800">
                This list automatically compares your shopping needs with your pantry inventory.
                Items are color-coded: <span className="font-semibold text-green-700">Green</span> = already have,
                <span className="font-semibold text-yellow-700"> Yellow</span> = need more,
                <span className="font-semibold text-orange-700"> Orange</span> = need to buy.
                {pantryItems.length === 0 && (
                  <span className="block mt-1 italic">
                    Add items to your pantry to see which ingredients you already have!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          TRANSFER CONFIRMATION DIALOG WITH EDITABLE QUANTITIES
          Shows when user clicks "Transfer to Pantry" button
          Allows editing quantities to match what was actually purchased
          ======================================================================== */}
      {showTransferConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">What Did You Actually Buy?</h3>
                  <p className="text-green-100 text-sm mt-1">Update quantities to match package sizes from the store</p>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  Recipes show what you needed, but stores sell in package sizes. Update the amounts below to match what you actually purchased.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={useRecipeAmounts}
                className="text-sm bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All to Recipe Amounts
              </button>
            </div>

            {/* Scrollable Items List */}
            <div className="max-h-96 overflow-y-auto p-6">
              <div className="space-y-4">
                {editableItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      item.skip
                        ? 'bg-gray-50 border-gray-300 opacity-60'
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Skip Checkbox */}
                      <div className="flex items-center pt-1">
                        <input
                          type="checkbox"
                          checked={item.skip}
                          onChange={(e) => updateEditableItem(item.id, 'skip', e.target.checked)}
                          className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                          title="Check to skip this item"
                        />
                      </div>

                      <div className="flex-1">
                        {/* Item Name */}
                        <h4 className="font-bold text-gray-900 capitalize mb-2">{item.name}</h4>

                        {/* Recipe Needed (Read-only info) */}
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Recipe needed: <span className="font-semibold">{item.recipeQuantity} {item.recipeUnit}</span></span>
                        </div>

                        {/* Editable Inputs for Purchased Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity Purchased
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.purchasedQuantity}
                              onChange={(e) => updateEditableItem(item.id, 'purchasedQuantity', e.target.value)}
                              disabled={item.skip}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={item.purchasedUnit}
                              onChange={(e) => updateEditableItem(item.id, 'purchasedUnit', e.target.value)}
                              disabled={item.skip}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                              placeholder="e.g., cups, oz, lbs"
                            />
                          </div>
                        </div>

                        {/* Skip Label */}
                        {item.skip && (
                          <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                            Skipped - won't be added to pantry
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-1 gap-3">
                {/* Transfer and Keep List */}
                <button
                  onClick={() => handleTransferToPantry(false)}
                  disabled={transferring}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {transferring ? 'Transferring...' : 'Transfer to Pantry & Keep List'}
                </button>

                {/* Transfer and Clear List */}
                <button
                  onClick={() => handleTransferToPantry(true)}
                  disabled={transferring}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {transferring ? 'Transferring...' : 'Transfer to Pantry & Clear List'}
                </button>

                {/* Cancel */}
                <button
                  onClick={() => {
                    setShowTransferConfirm(false);
                    setEditableItems([]);
                  }}
                  disabled={transferring}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingListPage;
