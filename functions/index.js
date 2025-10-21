const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const axios = require('axios');
const cheerio = require('cheerio');

// Set global options
setGlobalOptions({
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB'
});

/**
 * Cloud Function to scrape recipe data from a URL
 * This runs server-side, avoiding CORS issues
 */
exports.scrapeRecipe = onCall(async (request) => {
  const data = request.data;
  const context = request.auth;
  console.log('=== scrapeRecipe function called ===');
  console.log('Request data:', JSON.stringify(data));
  console.log('Context:', JSON.stringify(context));

  try {
    // Extract URL from data
    const { url } = data;
    console.log('Extracted URL:', url);

    // Validate input
    if (!url) {
      console.error('ERROR: URL is missing from request');
      throw new HttpsError('invalid-argument', 'URL is required');
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      console.log('URL validated successfully:', urlObj.href);
    } catch (error) {
      console.error('ERROR: Invalid URL format:', error.message);
      throw new HttpsError('invalid-argument', 'Invalid URL format: ' + error.message);
    }

    console.log('Starting to fetch URL...');

    // Fetch the webpage with comprehensive browser headers to bypass anti-scraping
    let response;
    try {
      response = await axios.get(url, {
        headers: {
          // Latest Chrome browser User-Agent
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

          // Accept headers that mimic real browser
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',

          // Referrer to make it look like we came from a search engine
          'Referer': 'https://www.google.com/',

          // Additional headers for authenticity
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'cross-site',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive'
        },
        timeout: 20000, // 20 second timeout
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Accept all status codes < 500 (including 404, 403, etc.)
        }
      });

      console.log('Fetch successful. Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Response size:', response.data?.length || 0, 'characters');

      // Check if we got a successful response
      if (response.status >= 400) {
        console.error('HTTP Error Status:', response.status);
        console.error('Response headers:', JSON.stringify(response.headers));
        console.error('Response preview:', response.data?.substring(0, 500));
        throw new HttpsError('unavailable', `Website returned HTTP ${response.status}: ${response.statusText}. The site may be blocking automated requests.`);
      }

    } catch (fetchError) {
      console.error('ERROR: Failed to fetch URL');
      console.error('Error code:', fetchError.code);
      console.error('Error message:', fetchError.message);

      // Log response details if available
      if (fetchError.response) {
        console.error('HTTP Status:', fetchError.response.status);
        console.error('Status Text:', fetchError.response.statusText);
        console.error('Response Headers:', JSON.stringify(fetchError.response.headers));
        console.error('Response Data Preview:', fetchError.response.data?.substring(0, 500));
      }

      console.error('Full Error Object:', JSON.stringify({
        code: fetchError.code,
        message: fetchError.message,
        status: fetchError.response?.status,
        statusText: fetchError.response?.statusText
      }));

      if (fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        throw new HttpsError('unavailable', 'Unable to reach the specified URL. Please check the URL and try again.');
      }

      if (fetchError.code === 'ETIMEDOUT' || fetchError.code === 'ECONNABORTED') {
        throw new HttpsError('deadline-exceeded', 'Request timed out. The website may be slow or unavailable.');
      }

      if (fetchError.response) {
        throw new HttpsError('unavailable', `Website returned HTTP ${fetchError.response.status}: ${fetchError.response.statusText}. The site may be blocking automated requests or the URL may not exist.`);
      }

      throw new HttpsError('unavailable', 'Failed to fetch URL: ' + fetchError.message);
    }

    const html = response.data;
    console.log('HTML received, starting to parse...');

    // Log first 500 characters of HTML for debugging
    console.log('HTML preview (first 500 chars):');
    console.log(html.substring(0, 500));

    // Parse the HTML
    let $;
    try {
      $ = cheerio.load(html);
      console.log('HTML parsed successfully with Cheerio');
    } catch (parseError) {
      console.error('ERROR: Failed to parse HTML with Cheerio');
      console.error('Parse error:', parseError.message);
      throw new HttpsError('internal', 'Failed to parse HTML: ' + parseError.message);
    }

    // Extract recipe data from JSON-LD
    let recipeData = null;

    // Find all script tags with type application/ld+json
    const ldJsonScripts = $('script[type="application/ld+json"]');
    console.log('Found', ldJsonScripts.length, 'JSON-LD script tags');

    ldJsonScripts.each((i, element) => {
      console.log(`\n=== Processing JSON-LD script #${i + 1} ===`);
      try {
        const scriptContent = $(element).html();
        console.log('Script content length:', scriptContent?.length || 0);

        if (!scriptContent) {
          console.log('Script is empty, skipping');
          return true; // continue
        }

        // Log full script content for debugging
        console.log('Full JSON-LD content:');
        console.log(scriptContent.substring(0, 1000));
        if (scriptContent.length > 1000) {
          console.log('... (truncated, total length:', scriptContent.length, ')');
        }

        const jsonData = JSON.parse(scriptContent);
        console.log('JSON-LD @context:', jsonData['@context']);
        console.log('JSON-LD @type:', jsonData['@type']);

        // Handle both single objects and arrays
        const items = Array.isArray(jsonData) ? jsonData : [jsonData];
        console.log('Processing', items.length, 'items from JSON-LD');

        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          const itemType = item['@type'];
          console.log(`Item #${j + 1} @type:`, itemType);

          // Check if this is a Recipe schema
          if (itemType === 'Recipe' ||
              (Array.isArray(itemType) && itemType.includes('Recipe'))) {
            console.log('✓ Found Recipe schema! Parsing...');
            recipeData = parseRecipeSchema(item);
            console.log('✓ Recipe data parsed successfully');
            return false; // Break out of loop
          }

          // Sometimes recipe is nested in @graph
          if (item['@graph']) {
            console.log('Item has @graph with', item['@graph'].length, 'nodes');
            const recipe = item['@graph'].find(
              node => node['@type'] === 'Recipe' ||
                     (Array.isArray(node['@type']) && node['@type'].includes('Recipe'))
            );
            if (recipe) {
              console.log('✓ Found Recipe in @graph! Parsing...');
              recipeData = parseRecipeSchema(recipe);
              console.log('✓ Recipe data parsed successfully from @graph');
              return false; // Break out of loop
            }
          }
        }
      } catch (e) {
        console.warn('⚠ Failed to parse JSON-LD script:', e.message);
        console.warn('Error stack:', e.stack);
      }
    });

    // If no JSON-LD found, try microdata
    if (!recipeData) {
      console.log('\n=== No JSON-LD recipe found, trying microdata ===');
      recipeData = extractMicrodataRecipe($);
    }

    // If still no data, try fallback HTML parsing
    if (!recipeData) {
      console.log('\n=== No microdata found, trying HTML fallback parsing ===');
      recipeData = extractRecipeFromHTML($, url);
    }

    if (!recipeData) {
      console.error('\n❌ ERROR: No recipe data found using any method');
      console.error('Tried: JSON-LD, Microdata, HTML fallback');

      // Log what we did find to help debug
      console.log('\nPage title:', $('title').text());
      console.log('Meta description:', $('meta[name="description"]').attr('content'));
      console.log('Open Graph title:', $('meta[property="og:title"]').attr('content'));

      throw new HttpsError(
        'not-found',
        'No recipe data found at this URL. The page may not contain structured recipe data, or the format is not supported yet.'
      );
    }

    console.log('\n✓ Successfully scraped recipe:', recipeData.name);
    console.log('Ingredients count:', recipeData.ingredients?.length || 0);
    console.log('Returning recipe data to client');

    return recipeData;

  } catch (error) {
    console.error('\n=== ERROR in scrapeRecipe function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // If it's already an HttpsError, rethrow it
    if (error instanceof HttpsError) {
      throw error;
    }

    // Otherwise wrap it in an internal error
    throw new HttpsError('internal', 'Unexpected error: ' + error.message);
  }
});

/**
 * Extract recipe from microdata (fallback)
 */
function extractMicrodataRecipe($) {
  console.log('Looking for microdata Recipe...');

  const recipeElement = $('[itemtype*="schema.org/Recipe"]');
  console.log('Found microdata elements:', recipeElement.length);

  if (recipeElement.length === 0) {
    return null;
  }

  const getProp = (prop) => {
    const element = recipeElement.find(`[itemprop="${prop}"]`);
    return element.first().text().trim() || element.first().attr('content') || '';
  };

  const name = getProp('name');
  console.log('Microdata recipe name:', name);

  if (!name) {
    return null;
  }

  // Extract ingredients
  const ingredients = [];
  recipeElement.find('[itemprop="recipeIngredient"]').each((i, el) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push(parsed);
    }
  });

  console.log('Microdata ingredients found:', ingredients.length);

  // Extract instructions
  let instructions = getProp('recipeInstructions');

  // Sometimes instructions are in multiple elements
  if (!instructions) {
    const instructionSteps = [];
    recipeElement.find('[itemprop="recipeInstructions"]').each((i, el) => {
      instructionSteps.push($(el).text().trim());
    });
    instructions = instructionSteps.join('\n\n');
  }

  return {
    name: name,
    description: getProp('description') || '',
    cuisine: 'Other',
    cookTime: parseDuration(getProp('totalTime') || getProp('cookTime') || 'PT30M'),
    servings: parseServings(getProp('recipeYield') || '4'),
    costPerServing: 0,
    ingredients: ingredients,
    instructions: instructions,
    imageUrl: recipeElement.find('[itemprop="image"]').first().attr('src') || ''
  };
}

/**
 * Extract recipe from common HTML structures (fallback)
 */
function extractRecipeFromHTML($, url) {
  console.log('Attempting HTML fallback parsing...');

  // Try common recipe site patterns
  const name = $('h1').first().text().trim() ||
               $('.recipe-title').first().text().trim() ||
               $('.recipe-name').first().text().trim() ||
               $('[class*="recipe"][class*="title"]').first().text().trim();

  console.log('HTML fallback - found title:', name);

  if (!name) {
    console.log('No title found in HTML');
    return null;
  }

  // Extract ingredients from common selectors
  const ingredients = [];
  const ingredientSelectors = [
    '.recipe-ingredients li',
    '.ingredients-list li',
    '[class*="ingredient"] li',
    '.ingredient',
    '[class*="Ingredient"]'
  ];

  for (const selector of ingredientSelectors) {
    const elements = $(selector);
    console.log(`Trying selector "${selector}": found ${elements.length} elements`);

    if (elements.length > 0) {
      elements.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 2) {
          const parsed = parseIngredientString(text);
          ingredients.push(parsed);
        }
      });

      if (ingredients.length > 0) {
        console.log('Found ingredients with selector:', selector);
        break;
      }
    }
  }

  console.log('HTML fallback - found ingredients:', ingredients.length);

  // Extract instructions from common selectors
  let instructions = '';
  const instructionSelectors = [
    '.recipe-instructions li',
    '.instructions-list li',
    '[class*="instruction"] li',
    '.directions li',
    '[class*="Direction"] li',
    '.step'
  ];

  for (const selector of instructionSelectors) {
    const elements = $(selector);
    console.log(`Trying instruction selector "${selector}": found ${elements.length} elements`);

    if (elements.length > 0) {
      const steps = [];
      elements.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 5) {
          steps.push(`${i + 1}. ${text}`);
        }
      });

      if (steps.length > 0) {
        instructions = steps.join('\n\n');
        console.log('Found instructions with selector:', selector);
        break;
      }
    }
  }

  // If no li elements, try paragraphs
  if (!instructions) {
    const paragraphs = $('.recipe-instructions p, .instructions p, [class*="instruction"] p');
    if (paragraphs.length > 0) {
      const steps = [];
      paragraphs.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 5) {
          steps.push(text);
        }
      });
      instructions = steps.join('\n\n');
    }
  }

  console.log('HTML fallback - instructions length:', instructions.length);

  // Only return data if we have ingredients
  if (ingredients.length === 0) {
    console.log('No ingredients found, returning null');
    return null;
  }

  return {
    name: name,
    description: $('meta[name="description"]').attr('content') || '',
    cuisine: 'Other',
    cookTime: 30,
    servings: 4,
    costPerServing: 0,
    ingredients: ingredients,
    instructions: instructions || 'See original recipe for instructions.',
    imageUrl: $('meta[property="og:image"]').attr('content') || ''
  };
}

/**
 * Parse schema.org Recipe object into our format
 */
function parseRecipeSchema(recipe) {
  console.log('parseRecipeSchema called');
  console.log('Recipe name:', recipe.name);
  console.log('Recipe type:', recipe['@type']);

  try {
    // Extract ingredients
    const ingredients = parseIngredients(recipe.recipeIngredient || recipe.ingredients || []);
    console.log('Parsed', ingredients.length, 'ingredients');

    // Extract instructions
    const instructions = parseInstructions(
      recipe.recipeInstructions || recipe.instructions || ''
    );
    console.log('Instructions length:', instructions.length, 'characters');

    // Extract cook time (convert ISO 8601 duration to minutes)
    const cookTime = parseDuration(
      recipe.totalTime || recipe.cookTime || recipe.prepTime || 'PT30M'
    );
    console.log('Cook time:', cookTime, 'minutes');

    // Extract servings
    const servings = parseServings(recipe.recipeYield || recipe.yield || '4');
    console.log('Servings:', servings);

    // Extract image URL
    const imageUrl = parseImageUrl(recipe.image);
    console.log('Image URL:', imageUrl);

    // Determine cuisine (often not in schema, default to 'Other')
    const cuisine = recipe.recipeCuisine || 'Other';
    console.log('Cuisine:', cuisine);

    // Cost per serving - usually not in schema, set to 0 for user to fill
    const costPerServing = 0;

    const result = {
      name: recipe.name || 'Untitled Recipe',
      description: recipe.description || '',
      cuisine: normalizeCuisine(cuisine),
      cookTime: cookTime,
      servings: servings,
      costPerServing: costPerServing,
      ingredients: ingredients,
      instructions: instructions,
      imageUrl: imageUrl
    };

    console.log('Recipe parsed successfully');
    return result;
  } catch (error) {
    console.error('ERROR in parseRecipeSchema:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Parse ingredients array into our format
 */
function parseIngredients(ingredientList) {
  console.log('parseIngredients called with', Array.isArray(ingredientList) ? ingredientList.length : 1, 'items');

  if (!Array.isArray(ingredientList)) {
    ingredientList = [ingredientList];
  }

  const parsed = ingredientList
    .filter(ing => ing && typeof ing === 'string' && ing.trim())
    .map(ingredient => {
      // Try to parse "2 cups flour" into quantity, unit, and name
      const parsed = parseIngredientString(ingredient);
      return {
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit
      };
    })
    .filter(ing => ing.name); // Remove any that failed to parse

  console.log('Successfully parsed', parsed.length, 'ingredients');
  return parsed;
}

/**
 * Parse individual ingredient string like "2 cups flour" or "1 tablespoon olive oil"
 */
function parseIngredientString(ingredientStr) {
  // Remove extra whitespace
  ingredientStr = ingredientStr.trim();

  // Common units to look for
  const units = [
    'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
    'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs',
    'gram', 'grams', 'g', 'kilogram', 'kilograms', 'kg',
    'milliliter', 'milliliters', 'ml', 'liter', 'liters', 'l',
    'piece', 'pieces', 'clove', 'cloves', 'pinch', 'dash',
    'small', 'medium', 'large', 'whole'
  ];

  // Try to match pattern: [quantity] [unit] [ingredient name]
  // Support fractions like 1/2, 1 1/2, decimals like 1.5
  const quantityPattern = /^(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s+/;
  const match = ingredientStr.match(quantityPattern);

  if (match) {
    const quantityStr = match[1];
    const quantity = parseFraction(quantityStr);
    const remainder = ingredientStr.slice(match[0].length).trim();

    // Look for unit in the remainder
    const lowerRemainder = remainder.toLowerCase();
    for (const unit of units) {
      const unitPattern = new RegExp(`^${unit}\\b`, 'i');
      if (unitPattern.test(lowerRemainder)) {
        const name = remainder.slice(unit.length).trim();
        return {
          quantity: quantity,
          unit: normalizeUnit(unit),
          name: name || ingredientStr
        };
      }
    }

    // No unit found, treat remainder as name
    return {
      quantity: quantity,
      unit: 'piece',
      name: remainder
    };
  }

  // No quantity found, treat as whole ingredient name with quantity 1
  return {
    quantity: 1,
    unit: 'piece',
    name: ingredientStr
  };
}

/**
 * Parse fractions like "1/2", "1 1/2" to decimal
 */
function parseFraction(str) {
  str = str.trim();

  // Check for mixed fraction like "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + (numerator / denominator);
  }

  // Check for simple fraction like "1/2"
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    return numerator / denominator;
  }

  // Otherwise parse as decimal
  return parseFloat(str) || 1;
}

/**
 * Normalize unit to our standard units
 */
function normalizeUnit(unit) {
  const unitMap = {
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'ounce': 'oz',
    'ounces': 'oz',
    'pound': 'lb',
    'pounds': 'lb',
    'lbs': 'lb',
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'liter': 'l',
    'liters': 'l',
    'piece': 'piece',
    'pieces': 'piece',
    'clove': 'clove',
    'cloves': 'clove',
    'cup': 'cup',
    'cups': 'cup'
  };

  return unitMap[unit.toLowerCase()] || unit;
}

/**
 * Parse recipe instructions (can be array, object, or string in various formats)
 */
function parseInstructions(instructions) {
  console.log('\n=== parseInstructions called ===');
  console.log('Type:', typeof instructions);
  console.log('IsArray:', Array.isArray(instructions));

  if (instructions && typeof instructions === 'object') {
    console.log('Instructions @type:', instructions['@type']);
    console.log('Has itemListElement:', !!instructions.itemListElement);
    console.log('Has text property:', !!instructions.text);
  }

  // Handle null/undefined
  if (!instructions) {
    console.log('⚠ No instructions provided');
    return '';
  }

  // Case 1: Already a string
  if (typeof instructions === 'string') {
    console.log('✓ Instructions are already a string, length:', instructions.length);
    return instructions;
  }

  // Case 2: Single object with itemListElement array (HowToSection format)
  if (typeof instructions === 'object' && !Array.isArray(instructions) && instructions.itemListElement) {
    console.log('✓ Found itemListElement array with', instructions.itemListElement.length, 'items');
    return parseInstructionsArray(instructions.itemListElement);
  }

  // Case 3: Single object with text property
  if (typeof instructions === 'object' && !Array.isArray(instructions) && instructions.text) {
    console.log('✓ Found single object with text property');
    return instructions.text;
  }

  // Case 4: Array of steps (most common)
  if (Array.isArray(instructions)) {
    console.log('✓ Instructions is an array with', instructions.length, 'items');
    return parseInstructionsArray(instructions);
  }

  // Case 5: Single object that might be a HowToStep
  if (typeof instructions === 'object' && !Array.isArray(instructions)) {
    console.log('⚠ Instructions is a single object, trying to extract text');
    const text = instructions.text || instructions.name || instructions.description || '';
    if (text) {
      console.log('✓ Extracted text from object');
      return text;
    }
  }

  console.log('⚠ No instructions found, returning empty string');
  return '';
}

/**
 * Parse an array of instruction steps (various formats)
 */
function parseInstructionsArray(stepsArray) {
  console.log('parseInstructionsArray called with', stepsArray.length, 'steps');

  const steps = [];

  for (let i = 0; i < stepsArray.length; i++) {
    const step = stepsArray[i];
    let stepText = '';

    // Log the step type for debugging
    if (i === 0) {
      console.log('First step type:', typeof step);
      if (typeof step === 'object') {
        console.log('First step @type:', step['@type']);
        console.log('First step properties:', Object.keys(step).join(', '));
      }
    }

    // Case 1: Step is already a string
    if (typeof step === 'string') {
      stepText = step.trim();
    }
    // Case 2: HowToStep or HowToDirection object with text property
    else if (typeof step === 'object' && step.text) {
      stepText = step.text.trim();
    }
    // Case 3: Object with name property (sometimes used instead of text)
    else if (typeof step === 'object' && step.name) {
      stepText = step.name.trim();
    }
    // Case 4: Object with description property
    else if (typeof step === 'object' && step.description) {
      stepText = step.description.trim();
    }
    // Case 5: HowToStep with itemListElement (nested steps)
    else if (typeof step === 'object' && step.itemListElement) {
      console.log('Found nested itemListElement in step', i + 1);
      // Recursively parse nested steps
      const nestedText = parseInstructionsArray(step.itemListElement);
      stepText = nestedText;
    }
    // Case 6: Object that might have other text properties
    else if (typeof step === 'object') {
      console.log('⚠ Unknown step object format:', Object.keys(step).join(', '));
      // Try to find any text-like property
      stepText = step.instruction || step.step || '';
    }

    if (stepText) {
      steps.push(stepText);
    }
  }

  console.log('✓ Successfully parsed', steps.length, 'instruction steps');

  // Number the steps and join with line breaks
  const formatted = steps
    .map((step, index) => {
      // Don't add number if step already starts with a number
      if (/^\d+\./.test(step)) {
        return step;
      }
      return `${index + 1}. ${step}`;
    })
    .join('\n\n');

  console.log('Formatted instructions preview:', formatted.substring(0, 200) + '...');

  return formatted;
}

/**
 * Parse ISO 8601 duration to minutes
 * Example: PT30M = 30 minutes, PT1H30M = 90 minutes
 */
function parseDuration(duration) {
  if (typeof duration === 'number') {
    return duration;
  }

  if (!duration || typeof duration !== 'string') {
    return 30; // default
  }

  // Remove 'PT' prefix
  duration = duration.replace('PT', '');

  let minutes = 0;

  // Parse hours
  const hourMatch = duration.match(/(\d+)H/);
  if (hourMatch) {
    minutes += parseInt(hourMatch[1]) * 60;
  }

  // Parse minutes
  const minuteMatch = duration.match(/(\d+)M/);
  if (minuteMatch) {
    minutes += parseInt(minuteMatch[1]);
  }

  return minutes || 30;
}

/**
 * Parse servings (can be number or string like "4 servings")
 */
function parseServings(servingsData) {
  if (typeof servingsData === 'number') {
    return servingsData;
  }

  if (typeof servingsData === 'string') {
    const match = servingsData.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }
  }

  if (Array.isArray(servingsData) && servingsData.length > 0) {
    return parseServings(servingsData[0]);
  }

  return 4; // default
}

/**
 * Parse image URL (can be string, object, or array)
 */
function parseImageUrl(imageData) {
  if (!imageData) {
    return '';
  }

  if (typeof imageData === 'string') {
    return imageData;
  }

  if (Array.isArray(imageData) && imageData.length > 0) {
    return parseImageUrl(imageData[0]);
  }

  if (typeof imageData === 'object') {
    return imageData.url || imageData.contentUrl || '';
  }

  return '';
}

/**
 * Normalize cuisine to match our options
 */
function normalizeCuisine(cuisine) {
  if (!cuisine) return 'Other';

  // Handle arrays (some sites return cuisine as an array)
  if (Array.isArray(cuisine)) {
    cuisine = cuisine[0] || 'Other';
  }

  // Ensure it's a string
  if (typeof cuisine !== 'string') {
    console.log('⚠ Cuisine is not a string:', typeof cuisine, cuisine);
    return 'Other';
  }

  const cuisineMap = {
    'italian': 'Italian',
    'asian': 'Asian',
    'chinese': 'Asian',
    'japanese': 'Japanese',
    'thai': 'Thai',
    'mexican': 'Mexican',
    'american': 'American',
    'greek': 'Greek',
    'mediterranean': 'Mediterranean',
    'indian': 'Indian',
    'french': 'French'
  };

  const lower = cuisine.toLowerCase();
  return cuisineMap[lower] || 'Other';
}
