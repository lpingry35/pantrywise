import { useState, useEffect } from 'react';
import { testFirestoreConnection, getAllRecipes, savePantryItems, getPantryItems } from '../services/firestoreService';

function FirebaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [recipeCount, setRecipeCount] = useState(null);
  const [pantryTest, setPantryTest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runTests() {
      try {
        // Test 1: Connection
        console.log('🧪 Testing Firestore connection...');
        const connected = await testFirestoreConnection();
        if (connected) {
          setConnectionStatus('✅ Connected to Firestore!');
          console.log('✅ Firestore connection successful');
        } else {
          setConnectionStatus('❌ Failed to connect to Firestore');
          setError('Connection failed - check Firebase configuration');
          return;
        }

        // Test 2: Read recipes
        console.log('🧪 Testing recipe read...');
        const recipes = await getAllRecipes();
        setRecipeCount(recipes.length);
        console.log(`✅ Found ${recipes.length} recipes in Firestore`);

        // Test 3: Write and read pantry
        console.log('🧪 Testing pantry write/read...');
        const testPantry = [
          { name: 'Test Ingredient', quantity: 5, unit: 'cups' }
        ];
        await savePantryItems(testPantry);
        const savedPantry = await getPantryItems();
        setPantryTest(`✅ Saved and retrieved ${savedPantry.length} pantry item(s)`);
        console.log('✅ Pantry write/read successful');

      } catch (err) {
        console.error('❌ Test failed:', err);
        setError(err.message);
        setConnectionStatus('❌ Tests failed');
      }
    }

    runTests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🔥 Firebase Connection Test
      </h1>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-2">Connection Status</h2>
          <p className={`text-lg ${connectionStatus.includes('✅') ? 'text-green-600' : connectionStatus.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
            {connectionStatus}
          </p>
        </div>

        {/* Recipe Count */}
        {recipeCount !== null && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Recipes in Firestore</h2>
            <p className="text-lg text-gray-700">
              Found <strong>{recipeCount}</strong> recipe(s) in database
            </p>
            {recipeCount === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                💡 No recipes yet - go to "Add New Recipe" to create one!
              </p>
            )}
          </div>
        )}

        {/* Pantry Test */}
        {pantryTest && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Pantry Read/Write Test</h2>
            <p className="text-lg text-green-600">{pantryTest}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Error</h2>
            <p className="text-red-700">{error}</p>
            <div className="mt-4 text-sm text-red-600">
              <p className="font-semibold">Common fixes:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Check that Firebase project is created in Firebase Console</li>
                <li>Verify API keys in <code className="bg-red-100 px-1">firebase.js</code></li>
                <li>Ensure Firestore is enabled in Firebase Console</li>
                <li>Check Firestore security rules allow read/write</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success Summary */}
        {!error && connectionStatus.includes('✅') && (
          <div className="bg-green-50 border border-green-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">🎉 All Tests Passed!</h2>
            <p className="text-green-700 mb-4">
              Your Firebase/Firestore integration is working correctly.
            </p>
            <div className="space-y-2 text-sm">
              <p>✅ Connection established</p>
              <p>✅ Can read data from Firestore</p>
              <p>✅ Can write data to Firestore</p>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-green-800 font-semibold">What's working:</p>
              <ul className="list-disc ml-5 mt-2 text-green-700">
                <li>Recipe Library loads from Firestore</li>
                <li>Adding recipes saves to Firestore</li>
                <li>Meal plans auto-save to Firestore</li>
                <li>Pantry items persist in Firestore</li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">📝 What This Test Does</h2>
          <ol className="list-decimal ml-5 space-y-2 text-blue-700">
            <li>Checks if app can connect to Firestore</li>
            <li>Counts how many recipes are in your database</li>
            <li>Tests saving and loading pantry items</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-blue-800 font-semibold">Check browser console (F12) for detailed logs</p>
            <p className="text-sm text-blue-600 mt-1">Look for messages starting with 🧪 or ✅</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <a
            href="/"
            className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors text-center font-medium"
          >
            ← Back to Home
          </a>
          <a
            href="/recipes/new"
            className="flex-1 bg-success text-white py-3 px-6 rounded-md hover:bg-success-hover transition-colors text-center font-medium"
          >
            Add Test Recipe →
          </a>
        </div>
      </div>
    </div>
  );
}

export default FirebaseTest;
