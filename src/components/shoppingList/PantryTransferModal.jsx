import PackageSizeSelector from './PackageSizeSelector';
import { UNIT_OPTIONS_JSX } from '../../constants/units';

/**
 * ============================================================================
 * PANTRY TRANSFER MODAL COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Allows users to transfer purchased shopping list items to their pantry
 * with editable quantities to match what they actually bought from the store.
 *
 * WHY EDITABLE QUANTITIES:
 * - Recipes may need "1.5 cups flour" but stores sell "5 lb bags"
 * - Users need to record what they BOUGHT, not what recipe NEEDS
 * - Accurate pantry inventory requires actual purchased amounts
 *
 * WORKFLOW:
 * 1. User clicks "Transfer to Pantry" button
 * 2. Modal opens with all items pre-filled with recipe amounts
 * 3. User can:
 *    - QUICK SELECT common package sizes (NEW!)
 *    - Edit quantities to match package sizes
 *    - Edit units if needed
 *    - Skip items they didn't buy (checkbox)
 *    - Quick reset all to recipe amounts
 * 4. User clicks "Transfer to Pantry"
 * 5. Items are added to pantry with actual purchased amounts
 * 6. Meal plan stays intact (always)
 * 7. Shopping list items recategorize to "Already Have" section
 *
 * FEATURES:
 * - Quick-select package size buttons (eggs: 6/12/18, oil: 8oz/16oz/32oz)
 * - Pre-filled with recipe amounts (can be overridden)
 * - Skip checkbox for items not purchased
 * - "Reset All to Recipe Amounts" quick action
 * - Shows both recipe needed and purchased amount
 * - Scrollable list for many items
 * - Two transfer options (keep or clear list)
 * - Disabled state while transferring
 *
 * PARENT: ShoppingListPage.jsx
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {Array} editableItems - Items with editable quantities
 * @param {function} onUpdateItem - Function to update item field
 * @param {function} onUseRecipeAmounts - Function to reset all to recipe amounts
 * @param {function} onTransfer - Function to handle transfer (keepList boolean)
 * @param {boolean} transferring - Whether transfer is in progress
 */

function PantryTransferModal({
  isOpen,
  onClose,
  editableItems,
  onUpdateItem,
  onUseRecipeAmounts,
  onTransfer,
  transferring
}) {
  /**
   * Handler for quick-select package size buttons
   * Updates both quantity and unit when user clicks a package size button
   */
  const handleQuickSelect = (itemId, quantity, unit) => {
    console.log(`⚡ Quick select triggered: ${quantity} ${unit} for item ${itemId}`);

    // Update both purchasedQuantity and purchasedUnit
    onUpdateItem(itemId, 'purchasedQuantity', quantity.toString());
    onUpdateItem(itemId, 'purchasedUnit', unit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 animate-scale-in">

        {/* ===================================================================
            HEADER - Gradient Green Background
            ===================================================================
            Sets the tone for a positive action (adding to pantry)
        */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {/* Icon Circle */}
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Title and Description */}
            <div>
              <h3 className="text-2xl font-bold text-white">What Did You Actually Buy?</h3>
              <p className="text-green-100 text-sm mt-1">
                Update quantities to match package sizes from the store
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            INFO BANNER - Explanation
            ===================================================================
            Helps users understand why they need to edit quantities
        */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              Recipes show what you needed, but stores sell in package sizes.
              Update the amounts below to match what you actually purchased.
            </p>
          </div>
        </div>

        {/* ===================================================================
            QUICK ACTION BUTTON - Reset All
            ===================================================================
            Allows users to quickly reset all items to recipe amounts
            Useful if user bought exact amounts or wants to start over
        */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={onUseRecipeAmounts}
            className="text-sm bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset All to Recipe Amounts
          </button>
        </div>

        {/* ===================================================================
            SCROLLABLE ITEMS LIST
            ===================================================================
            Shows all items with editable quantities
            Scrollable to handle many items without making modal too tall
        */}
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

                  {/* =============================================================
                      SKIP CHECKBOX
                      =============================================================
                      Allows user to mark items they didn't purchase
                      Skipped items won't be added to pantry
                  */}
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={item.skip}
                      onChange={(e) => onUpdateItem(item.id, 'skip', e.target.checked)}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      title="Check to skip this item"
                    />
                  </div>

                  <div className="flex-1">

                    {/* Item Name */}
                    <h4 className="font-bold text-gray-900 capitalize mb-2">{item.name}</h4>

                    {/* ==========================================================
                        PACKAGE SIZE SELECTOR (QUICK SELECT)
                        ==========================================================
                        Shows common package sizes based on ingredient type
                        Allows user to click a button instead of typing
                    */}
                    {!item.skip && (
                      <PackageSizeSelector
                        category={item.category || 'Other'}
                        ingredientName={item.name}
                        recipeAmount={`${item.recipeQuantity} ${item.recipeUnit}`}
                        onSelect={(quantity, unit) => handleQuickSelect(item.id, quantity, unit)}
                      />
                    )}

                    {/* ==========================================================
                        EDITABLE INPUTS FOR PURCHASED AMOUNT
                        ==========================================================
                        User enters what they actually bought from the store
                        Pre-filled with recipe amounts but can be changed
                    */}
                    <div className="grid grid-cols-2 gap-3">

                      {/* Quantity Input */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity Purchased
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.purchasedQuantity}
                          onChange={(e) => onUpdateItem(item.id, 'purchasedQuantity', e.target.value)}
                          disabled={item.skip}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                          placeholder="0"
                        />
                      </div>

                      {/* Unit Dropdown - Ensures consistent unit values */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.purchasedUnit}
                          onChange={(e) => onUpdateItem(item.id, 'purchasedUnit', e.target.value)}
                          disabled={item.skip}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 appearance-none cursor-pointer bg-white"
                        >
                          {UNIT_OPTIONS_JSX}
                        </select>
                      </div>
                    </div>

                    {/* Skip Label - Shows when item is skipped */}
                    {item.skip && (
                      <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                            clipRule="evenodd"
                          />
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

        {/* ===================================================================
            ACTION BUTTONS
            ===================================================================
            Simple two-button interface:

            1. Transfer to Pantry (Green Button)
               - Adds all items to pantry
               - Meal plan stays intact
               - Shopping list items recategorize to "Already Have" (green)
               - You can still see what to cook for the week!

            2. Cancel (Gray Button)
               - Closes modal without making any changes

            NOTE: To clear your meal plan when you're done with the week,
            use the "Clear All" button on the Meal Planner page.
        */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="grid grid-cols-1 gap-3">

            {/* Transfer to Pantry Button (Primary Action) */}
            <button
              onClick={() => onTransfer(false)}
              disabled={transferring}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {transferring ? 'Transferring...' : 'Transfer to Pantry'}
            </button>

            <div className="text-center text-sm text-gray-600 py-2">
              <p>✅ Items will be added to your pantry</p>
              <p>✅ Your meal plan will stay on the calendar</p>
              <p>✅ Items will show as "Already Have" in green</p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={transferring}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantryTransferModal;
