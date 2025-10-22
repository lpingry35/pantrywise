import { ShoppingCart } from 'lucide-react';

/**
 * ============================================================================
 * SHOPPING LIST HEADER COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays header section with title, controls, and action buttons.
 * Provides main user actions for shopping list management.
 *
 * SECTIONS:
 * 1. Page Title - "Shopping List" with icon
 * 2. Description - Brief explanation of pantry-aware features
 * 3. Toggle Control - Show/hide "Already Have" items
 * 4. Action Buttons - Transfer to Pantry, Export List
 *
 * WHY THIS COMPONENT:
 * - Centralizes all shopping list controls in one place
 * - Provides consistent header across shopping list experience
 * - Groups related actions together (transfer, export, toggle)
 *
 * PARENT: ShoppingListPage.jsx
 *
 * @param {boolean} showAlreadyHave - Current state of "show already have" toggle
 * @param {function} onToggleAlreadyHave - Function to toggle visibility
 * @param {boolean} hasAlreadyHaveItems - Whether there are items in "Already Have" section
 * @param {boolean} hasPantryItems - Whether user has any pantry items
 * @param {function} onOpenTransferDialog - Function to open transfer modal
 * @param {boolean} transferring - Whether transfer is in progress
 * @param {boolean} hasItemsToTransfer - Whether there are items that can be transferred
 * @param {function} onExport - Function to export shopping list
 */

function ShoppingListHeader({
  showAlreadyHave,
  onToggleAlreadyHave,
  hasAlreadyHaveItems,
  hasPantryItems,
  onOpenTransferDialog,
  transferring,
  hasItemsToTransfer,
  onExport
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">

      {/* ===================================================================
          TOGGLE AND ACTION BUTTONS SECTION
          ===================================================================
          Shows controls for managing shopping list display and actions
      */}
      <div className="space-y-4">

        {/* =================================================================
            SHOW/HIDE "ALREADY HAVE" TOGGLE
            =================================================================
            Only shows if:
            1. User has pantry items
            2. At least one "Already Have" item exists

            WHY HIDE THIS SECTION:
            - Reduces visual clutter when user only wants to see what to buy
            - Useful when shopping in store (only need to see items to purchase)

            TOGGLE STATES:
            - ON (Green): Shows "Already Have" section
            - OFF (Gray): Hides "Already Have" section
        */}
        {hasPantryItems && hasAlreadyHaveItems && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Show items I already have
            </label>

            {/* Toggle Switch Button */}
            <button
              onClick={onToggleAlreadyHave}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                showAlreadyHave ? 'bg-green-500' : 'bg-gray-300'
              }`}
              aria-label="Toggle show items already in pantry"
            >
              {/* Switch Circle - Moves left/right */}
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  showAlreadyHave ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* =================================================================
            ACTION BUTTONS ROW
            =================================================================
            Two main actions for shopping list management:
            1. Transfer to Pantry (Primary) - Adds purchased items to pantry
            2. Export List (Secondary) - Downloads/copies list
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* ===============================================================
              TRANSFER TO PANTRY BUTTON (Primary Action)
              ===============================================================
              Opens modal to transfer purchased items to pantry

              WHEN DISABLED:
              - No items to transfer (all already in pantry)
              - Transfer operation in progress

              WHY THIS IS PRIMARY:
              - Most important action after shopping
              - Updates pantry inventory
              - Completes the shopping workflow
              - Bright green gradient emphasizes importance
          */}
          <button
            onClick={onOpenTransferDialog}
            disabled={transferring || !hasItemsToTransfer}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {/* Checkmark Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>

            {/* Button Text - Changes based on state */}
            {transferring ? 'Transferring...' : 'Transfer to Pantry'}
          </button>

          {/* ===============================================================
              EXPORT BUTTON (Secondary Action)
              ===============================================================
              Exports shopping list as text

              CURRENT FUNCTIONALITY:
              - Shows list in alert dialog
              - Logs to console for copying

              FUTURE ENHANCEMENTS:
              - Download as text file
              - Copy to clipboard button
              - Email shopping list
              - Share with others
          */}
          <button
            onClick={onExport}
            className="bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-2"
          >
            {/* Download/Export Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export List
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListHeader;
