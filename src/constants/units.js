/**
 * ============================================================================
 * STREAMLINED UNIT CONSTANTS - MATH-COMPATIBLE ONLY
 * ============================================================================
 *
 * IMPORTANT: Only units that can be converted for pantry deduction!
 *
 * Before adding a new unit, ask:
 * 1. Can unitConverter.js convert this?
 * 2. Does it work with pantry deduction math?
 * 3. Is it universal (not ingredient-specific)?
 *
 * Used in:
 * - Shopping List: AddManualItemModal, PantryTransferModal
 * - Pantry: Manual entry, Edit item
 *
 * USAGE:
 * import { UNIT_OPTIONS_JSX } from '../constants/units';
 *
 * <select>
 *   {UNIT_OPTIONS_JSX}
 * </select>
 */

export const UNIT_OPTIONS_JSX = (
  <>
    <optgroup label="Volume (Liquid)">
      <option value="tsp">tsp</option>
      <option value="tbsp">tbsp</option>
      <option value="cup">cup</option>
      <option value="cups">cups</option>
      <option value="oz">oz (fluid ounce)</option>
      <option value="pint">pint</option>
      <option value="quart">quart</option>
      <option value="gallon">gallon</option>
      <option value="ml">ml</option>
      <option value="liter">liter</option>
    </optgroup>

    <optgroup label="Weight">
      <option value="lb">lb</option>
      <option value="lbs">lbs</option>
      <option value="oz">oz (weight)</option>
      <option value="g">g</option>
      <option value="kg">kg</option>
    </optgroup>

    <optgroup label="Count / Whole Items">
      <option value="whole">whole</option>
      <option value="piece">piece</option>
      <option value="pieces">pieces</option>
      <option value="item">item</option>
      <option value="items">items</option>
    </optgroup>

    <optgroup label="Canned Goods">
      <option value="can">can (15 oz)</option>
      <option value="cans">cans (15 oz each)</option>
    </optgroup>

    <optgroup label="Produce Measures">
      <option value="bunch">bunch</option>
      <option value="head">head</option>
      <option value="bulb">bulb</option>
      <option value="clove">clove</option>
      <option value="stalk">stalk</option>
    </optgroup>

    <optgroup label="Special">
      <option value="stick">stick (butter - 4 oz)</option>
      <option value="sticks">sticks (butter - 4 oz each)</option>
      <option value="egg">egg</option>
      <option value="eggs">eggs</option>
    </optgroup>
  </>
);
