// Test script to debug Food Network recipe URL structure
const axios = require('axios');
const cheerio = require('cheerio');

async function testFoodNetwork() {
  const url = 'https://www.foodnetwork.com/recipes/food-network-kitchen/3-ingredient-mac-and-cheese-18926685';

  console.log('Fetching Food Network URL...');

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
      maxRedirects: 5
    });

    console.log('✓ Fetch successful');
    console.log('Status:', response.status);
    console.log('Content length:', response.data.length);

    const $ = cheerio.load(response.data);
    console.log('\n--- Searching for JSON-LD ---');

    const ldJsonScripts = $('script[type="application/ld+json"]');
    console.log('Found', ldJsonScripts.length, 'JSON-LD script tags\n');

    ldJsonScripts.each((index, element) => {
      const scriptContent = $(element).html();
      console.log(`\n=== JSON-LD Script #${index + 1} ===`);
      console.log('Length:', scriptContent.length);

      try {
        const jsonData = JSON.parse(scriptContent);
        console.log('Type:', jsonData['@type']);
        console.log('Context:', jsonData['@context']);

        // Print the full JSON to see structure
        console.log('\n=== FULL JSON CONTENT ===');
        console.log(JSON.stringify(jsonData, null, 2));
        console.log('=== END JSON ===\n');

        if (jsonData['@graph']) {
          console.log('Has @graph with', jsonData['@graph'].length, 'items');
          jsonData['@graph'].forEach((item, i) => {
            console.log(`  Graph item ${i + 1}: ${item['@type']}`);
          });
        }

        // Pretty print if it's a Recipe
        if (jsonData['@type'] === 'Recipe' || (jsonData['@graph'] && jsonData['@graph'].some(item => item['@type'] === 'Recipe'))) {
          console.log('\n✓ FOUND RECIPE!');
        }
      } catch (e) {
        console.log('Failed to parse JSON:', e.message);
      }
    });

    // Check for microdata
    console.log('\n--- Checking for Microdata ---');
    const microdataRecipe = $('[itemtype*="schema.org/Recipe"]');
    console.log('Found', microdataRecipe.length, 'microdata Recipe elements');

    // Check page title
    console.log('\n--- Page Info ---');
    console.log('Title:', $('title').text());
    console.log('H1:', $('h1').first().text());

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testFoodNetwork();
