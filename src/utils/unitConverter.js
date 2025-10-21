// ============================================================================
// UNIT CONVERTER UTILITY
// Handles conversions between cooking units (volume, weight, count)
// Supports ingredient-specific conversions using density data
// ============================================================================

// ============================================================================
// VOLUME CONVERSION FACTORS (to milliliters)
// All volume units converted to ml as base unit
// ============================================================================

const VOLUME_TO_ML = {
  // Metric
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'liter': 1000,
  'liters': 1000,
  'l': 1000,

  // US Standard
  'cup': 236.588,
  'cups': 236.588,
  'tablespoon': 14.787,
  'tablespoons': 14.787,
  'tbsp': 14.787,
  'teaspoon': 4.929,
  'teaspoons': 4.929,
  'tsp': 4.929,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
  'fl oz': 29.574,
  'floz': 29.574,
  'pint': 473.176,
  'pints': 473.176,
  'quart': 946.353,
  'quarts': 946.353,
  'gallon': 3785.41,
  'gallons': 3785.41
};

// ============================================================================
// WEIGHT CONVERSION FACTORS (to grams)
// All weight units converted to grams as base unit
// ============================================================================

const WEIGHT_TO_GRAMS = {
  // Metric
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'mg': 0.001,
  'milligram': 0.001,
  'milligrams': 0.001,

  // Imperial/US
  'lb': 453.592,
  'lbs': 453.592,
  'pound': 453.592,
  'pounds': 453.592,
  'oz': 28.3495,
  'ounce': 28.3495,
  'ounces': 28.3495,

  // Container units (canned goods)
  // Standard can size: 15 oz = 425.243 grams
  // Can conversions:
  //   - 1 can = 15 oz (weight)
  //   - 1 can = 425.243 grams
  //   - 1 can ≈ 1.875 cups (volume, ingredient-dependent)
  // Note: Common can sizes are 8 oz (small), 15 oz (standard), 28 oz (large)
  // Using 15 oz as default standard can
  'can': 425.243,
  'cans': 425.243
};

// ============================================================================
// INGREDIENT DENSITY MAP
// Maps ingredient names to their density (grams per cup)
// Used for volume ↔ weight conversions
// ============================================================================

const INGREDIENT_DENSITIES = {
  // Flours & Grains
  'flour': 120,                    // All-purpose flour: 1 cup = 120g
  'all-purpose flour': 120,
  'ap flour': 120,
  'bread flour': 127,              // Denser than AP
  'whole wheat flour': 120,
  'rice': 185,                     // Uncooked white rice: 1 cup = 185g
  'white rice': 185,
  'brown rice': 195,
  'pasta': 100,                    // Dry pasta: 1 cup = 100g
  'quinoa': 170,                   // Uncooked quinoa: 1 cup = 170g

  // Sugars & Sweeteners
  'sugar': 200,                    // Granulated sugar: 1 cup = 200g
  'granulated sugar': 200,
  'white sugar': 200,
  'brown sugar': 220,              // Packed brown sugar: 1 cup = 220g
  'powdered sugar': 120,           // Sifted powdered sugar: 1 cup = 120g
  'confectioners sugar': 120,
  'honey': 340,                    // 1 cup = 340g
  'maple syrup': 322,              // 1 cup = 322g

  // Fats & Dairy
  'butter': 227,                   // 1 cup = 227g (2 sticks)
  'oil': 218,                      // Vegetable oil: 1 cup = 218g
  'vegetable oil': 218,
  'olive oil': 216,                // 1 cup = 216g
  'milk': 244,                     // 1 cup = 244g (approximately 244ml)
  'whole milk': 244,
  'cream': 240,                    // Heavy cream: 1 cup = 240g
  'heavy cream': 240,
  'sour cream': 230,               // 1 cup = 230g
  'yogurt': 245,                   // 1 cup = 245g
  'cheese': 113,                   // Shredded cheese: 1 cup ≈ 113g (varies by type)
  'shredded cheese': 113,
  'parmesan': 100,                 // Grated parmesan: 1 cup = 100g
  'grated parmesan': 100,

  // Vegetables & Fruits (chopped/diced)
  'onion': 160,                    // Chopped onion: 1 cup = 160g
  'onions': 160,
  'garlic': 136,                   // Minced garlic: 1 cup = 136g
  'tomato': 180,                   // Chopped tomato: 1 cup = 180g
  'tomatoes': 180,
  'carrot': 128,                   // Chopped carrot: 1 cup = 128g
  'carrots': 128,
  'bell pepper': 149,              // Chopped bell pepper: 1 cup = 149g
  'potato': 150,                   // Diced potato: 1 cup = 150g
  'potatoes': 150,

  // Proteins
  'chicken': 140,                  // Cooked, diced chicken: 1 cup = 140g
  'chicken breast': 140,
  'ground beef': 225,              // Raw ground beef: 1 cup = 225g
  'beef': 225,

  // Nuts & Seeds
  'almonds': 143,                  // Whole almonds: 1 cup = 143g
  'walnuts': 117,                  // Chopped walnuts: 1 cup = 117g
  'peanuts': 146,                  // 1 cup = 146g

  // Liquids (approximate for volume-weight)
  'water': 237,                    // 1 cup water ≈ 237g (1 ml water ≈ 1g)
  'broth': 240,                    // Chicken/beef broth: 1 cup = 240g
  'chicken broth': 240,
  'beef broth': 240,
  'stock': 240,

  // Canned Goods
  'crushed tomatoes': 243,         // 1 cup = 243g
  'tomato sauce': 245,             // 1 cup = 245g
  'beans': 256,                    // Cooked/canned beans: 1 cup = 256g
  'black beans': 256,
  'chickpeas': 240,                // Cooked chickpeas: 1 cup = 240g
  'kidney beans': 256
};

// ============================================================================
// NORMALIZE UNIT
// Converts units to lowercase and singular form for consistent comparison
// ============================================================================

/**
 * Normalizes a unit string to lowercase singular form
 * All count-based units are normalized to "piece" for consistency
 * @param {string} unit - The unit to normalize (e.g., "Cups", "lbs", "whole", "unit")
 * @returns {string} - Normalized unit (e.g., "cup", "lb", "piece")
 */
export function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return '';

  let normalized = unit.trim().toLowerCase();

  // Handle common plural forms by removing trailing 's'
  // But preserve units that naturally end in 's' (oz stays oz)
  const unitsEndingInS = ['oz', 'floz'];
  if (!unitsEndingInS.includes(normalized) && normalized.endsWith('s') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }

  // Explicitly normalize "cans" to "can" for container units
  if (normalized === 'cans') {
    normalized = 'can';
  }

  // Normalize all count-based units to "piece" for consistency
  // This allows "4 whole onion" to match with "3 unit onion"
  const countUnitMap = {
    'whole': 'piece',
    'unit': 'piece',
    'clove': 'piece',
    'item': 'piece',
    'each': 'piece',
    'count': 'piece',
    'serving': 'piece',
    'portion': 'piece'
  };

  if (countUnitMap[normalized]) {
    return countUnitMap[normalized];
  }

  return normalized;
}

// ============================================================================
// UNIT TYPE DETECTION
// Determines if a unit is volume, weight, or count
// ============================================================================

/**
 * Determines the type of measurement unit
 * @param {string} unit - Normalized unit string
 * @returns {string} - 'volume', 'weight', 'count', or 'unknown'
 */
function getUnitType(unit) {
  if (VOLUME_TO_ML[unit]) return 'volume';
  if (WEIGHT_TO_GRAMS[unit]) return 'weight';

  // Count-based units
  const countUnits = ['piece', 'whole', 'clove', 'item', 'unit', 'each'];
  if (countUnits.includes(unit) || unit === '') return 'count';

  return 'unknown';
}

// ============================================================================
// INGREDIENT NAME LOOKUP
// Finds the best matching ingredient name in density map
// ============================================================================

/**
 * Looks up ingredient density by matching ingredient name
 * @param {string} ingredientName - The ingredient name to look up
 * @returns {number|null} - Density in grams per cup, or null if not found
 */
function getIngredientDensity(ingredientName) {
  if (!ingredientName) return null;

  const normalized = ingredientName.toLowerCase().trim();

  // Direct match
  if (INGREDIENT_DENSITIES[normalized]) {
    return INGREDIENT_DENSITIES[normalized];
  }

  // Check if ingredient name contains any of the keys
  for (const [key, density] of Object.entries(INGREDIENT_DENSITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return density;
    }
  }

  return null;
}

// ============================================================================
// CORE CONVERSION FUNCTION
// Converts quantities between different units
// ============================================================================

/**
 * Converts a quantity from one unit to another
 * @param {number} value - The quantity to convert
 * @param {string} fromUnit - The source unit (e.g., "cups")
 * @param {string} toUnit - The target unit (e.g., "grams")
 * @param {string} ingredientName - Optional ingredient name for density-based conversions
 * @returns {number|null} - Converted value, or null if conversion not possible
 *
 * @example
 * convertUnit(2, 'cups', 'ml')  // Returns 473.176 (2 cups = 473ml)
 * convertUnit(1, 'lb', 'oz')    // Returns 16 (1 pound = 16 ounces)
 * convertUnit(1, 'cup', 'grams', 'flour')  // Returns 120 (1 cup flour = 120g)
 * convertUnit(2, 'cups', 'pounds', 'sugar')  // Returns ~0.88 (2 cups sugar ≈ 400g ≈ 0.88lb)
 */
export function convertUnit(value, fromUnit, toUnit, ingredientName = null) {
  // Validate inputs
  if (typeof value !== 'number' || value < 0) return null;
  if (!fromUnit || !toUnit) return null;

  // Normalize units
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  // If units are the same, no conversion needed
  if (from === to) return value;

  // Handle empty units (count-based) - can only convert to other count units
  if (from === '' && to === '') return value;
  if (from === '' || to === '') return null;

  // Get unit types
  const fromType = getUnitType(from);
  const toType = getUnitType(to);

  // CASE 1: Both units are the same type (volume-to-volume, weight-to-weight, or count-to-count)
  if (fromType === toType && fromType !== 'unknown') {
    if (fromType === 'volume') {
      // Convert: fromUnit → ml → toUnit
      const mlValue = value * VOLUME_TO_ML[from];
      return mlValue / VOLUME_TO_ML[to];
    } else if (fromType === 'weight') {
      // Convert: fromUnit → grams → toUnit
      const gramValue = value * WEIGHT_TO_GRAMS[from];
      return gramValue / WEIGHT_TO_GRAMS[to];
    } else if (fromType === 'count') {
      // Count-to-count: No conversion needed, all count units are normalized to "piece"
      // "4 whole" → "4 piece", "3 unit" → "3 piece", so they can be directly compared
      return value;
    }
  }

  // CASE 2: Converting between volume and weight (requires ingredient density)
  if ((fromType === 'volume' && toType === 'weight') ||
      (fromType === 'weight' && toType === 'volume')) {

    // Get ingredient density (grams per cup)
    const density = getIngredientDensity(ingredientName);

    if (!density) {
      // Cannot convert between volume and weight without knowing ingredient density
      console.log(`Cannot convert ${from} to ${to} for ingredient "${ingredientName}": density unknown`);
      return null;
    }

    if (fromType === 'volume' && toType === 'weight') {
      // Volume → Weight
      // Step 1: Convert volume to cups
      const mlValue = value * VOLUME_TO_ML[from];
      const cupsValue = mlValue / VOLUME_TO_ML['cup'];

      // Step 2: Convert cups to grams using density
      const gramsValue = cupsValue * density;

      // Step 3: Convert grams to target weight unit
      return gramsValue / WEIGHT_TO_GRAMS[to];
    } else {
      // Weight → Volume
      // Step 1: Convert weight to grams
      const gramsValue = value * WEIGHT_TO_GRAMS[from];

      // Step 2: Convert grams to cups using density
      const cupsValue = gramsValue / density;

      // Step 3: Convert cups to target volume unit
      const mlValue = cupsValue * VOLUME_TO_ML['cup'];
      return mlValue / VOLUME_TO_ML[to];
    }
  }

  // CASE 3: Count-based units mixed with volume/weight
  // Count units can only be compared with other count units (handled in CASE 1)
  // Cannot convert count to/from volume or weight
  if (fromType === 'count' || toType === 'count') {
    if (fromType === 'count' && toType === 'count') {
      // This should have been caught by CASE 1, but handle it here as fallback
      return value;
    }
    // One is count, other is volume/weight → incompatible
    return null;
  }

  // CASE 4: Unknown unit types or incompatible conversion
  console.log(`Cannot convert ${from} (${fromType}) to ${to} (${toType})`);
  return null;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// Helper functions for common conversions
// ============================================================================

/**
 * Checks if two units are compatible for comparison/conversion
 * @param {string} unit1 - First unit
 * @param {string} unit2 - Second unit
 * @param {string} ingredientName - Optional ingredient name for density check
 * @returns {boolean} - True if units can be compared
 */
export function areUnitsCompatible(unit1, unit2, ingredientName = null) {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);

  if (norm1 === norm2) return true;

  const type1 = getUnitType(norm1);
  const type2 = getUnitType(norm2);

  // Same type units are always compatible
  if (type1 === type2 && type1 !== 'unknown') return true;

  // Volume-weight conversion possible if we have ingredient density
  if ((type1 === 'volume' && type2 === 'weight') ||
      (type1 === 'weight' && type2 === 'volume')) {
    return getIngredientDensity(ingredientName) !== null;
  }

  return false;
}

/**
 * Gets a human-readable explanation of why units can't be converted
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @param {string} ingredientName - Ingredient name
 * @returns {string} - Explanation message
 */
export function getConversionMessage(fromUnit, toUnit, ingredientName = null) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return 'Units are the same';

  const fromType = getUnitType(from);
  const toType = getUnitType(to);

  if (fromType === 'unknown' || toType === 'unknown') {
    return `Unknown unit type: ${fromType === 'unknown' ? fromUnit : toUnit}`;
  }

  if ((fromType === 'volume' && toType === 'weight') ||
      (fromType === 'weight' && toType === 'volume')) {
    const density = getIngredientDensity(ingredientName);
    if (!density) {
      return `Cannot convert ${fromUnit} to ${toUnit}: ingredient density unknown for "${ingredientName}"`;
    }
  }

  if (fromType === 'count' || toType === 'count') {
    return `Cannot convert between count-based units and ${fromType === 'count' ? toType : fromType} units`;
  }

  return `Cannot convert ${fromUnit} (${fromType}) to ${toUnit} (${toType})`;
}

/**
 * Formats a quantity value with intelligent rounding based on unit type
 * Provides clean, human-readable values especially for container units like cans
 *
 * @param {number} value - The quantity value to format
 * @param {string} unit - The unit type (e.g., "can", "cup", "oz")
 * @returns {number} - Formatted/rounded value
 *
 * @example
 * formatQuantity(1.9999997, 'can')    // Returns 2
 * formatQuantity(0.3333333, 'can')    // Returns 0.3
 * formatQuantity(1.6, 'can')          // Returns 1.5 (nearest 0.25)
 * formatQuantity(0.05, 'can')         // Returns 0.1 (minimum threshold)
 * formatQuantity(2.456, 'cup')        // Returns 2.5 (standard rounding)
 */
export function formatQuantity(value, unit) {
  if (typeof value !== 'number' || value < 0) return 0;

  const normalizedUnit = normalizeUnit(unit);

  // Special handling for can units - need clean values like 1.5, 2, 2.5
  if (normalizedUnit === 'can') {
    // Less than 0.1 can - treat as minimum usable amount
    if (value < 0.1) {
      return 0.1;
    }

    // Between 0.1 and 1 can - round to 1 decimal place
    if (value < 1) {
      return Math.round(value * 10) / 10;
    }

    // Greater than 1 can - round to nearest 0.25
    // This gives us values like 1.25, 1.5, 1.75, 2.0
    return Math.round(value * 4) / 4;
  }

  // For most other units, round to 2 decimal places
  // This handles common cooking measurements cleanly
  return Math.round(value * 100) / 100;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  convertUnit,
  normalizeUnit,
  areUnitsCompatible,
  getConversionMessage,
  formatQuantity,
  VOLUME_TO_ML,
  WEIGHT_TO_GRAMS,
  INGREDIENT_DENSITIES
};
