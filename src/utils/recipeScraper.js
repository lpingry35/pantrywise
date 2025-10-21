/**
 * Recipe Scraper Utility
 * Calls Firebase Cloud Function to scrape recipe data server-side (avoids CORS)
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase';

/**
 * Scrape recipe from a URL using Firebase Cloud Function
 * @param {string} url - The recipe URL to scrape
 * @returns {Promise<Object>} - Parsed recipe data
 */
export async function scrapeRecipeFromUrl(url) {
  try {
    // Validate URL
    if (!url || !isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    // Get Firebase Functions instance
    const functions = getFunctions(app);

    // Call the Cloud Function
    const scrapeRecipe = httpsCallable(functions, 'scrapeRecipe');

    // Call the function with the URL
    const result = await scrapeRecipe({ url });

    // Return the recipe data
    return result.data;

  } catch (error) {
    console.error('Error scraping recipe:', error);

    // Handle Firebase Functions errors
    if (error.code) {
      switch (error.code) {
        case 'functions/invalid-argument':
          throw new Error('Invalid URL format');
        case 'functions/not-found':
          throw new Error('No recipe data found at this URL. Make sure the URL points to a recipe page.');
        case 'functions/unavailable':
          throw new Error('Unable to reach the specified URL');
        case 'functions/deadline-exceeded':
          throw new Error('Request timed out. Please try again.');
        case 'functions/unauthenticated':
          throw new Error('Authentication required. Please sign in.');
        default:
          throw new Error(error.message || 'Failed to import recipe. Please try again.');
      }
    }

    throw error;
  }
}

/**
 * Validate if string is a valid URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
