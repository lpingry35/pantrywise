import React from 'react';
import { Share, Plus, Home, Smartphone } from 'lucide-react';

/**
 * Instructions for installing PWA on iPhone
 * Link to this from Settings or show as banner
 */

function InstallApp() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Install PantryWise on Your iPhone
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-blue-900 mb-2">
          <strong>Get the full app experience!</strong>
        </p>
        <p className="text-blue-800">
          Install PantryWise on your home screen for faster access,
          offline support, and a native app feel.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Tap the Share button
            </h3>
            <p className="text-gray-700 mb-3">
              In Safari, tap the <Share className="w-4 h-4 inline" /> share icon
              at the bottom of the screen (or top right on iPad).
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-center items-center h-32 bg-white rounded">
                <Share className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-sm text-center text-gray-600 mt-2">
                Share button (bottom center or top right)
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Select "Add to Home Screen"
            </h3>
            <p className="text-gray-700 mb-3">
              Scroll down and tap <Plus className="w-4 h-4 inline" /> "Add to Home Screen"
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-white p-3 rounded w-full">
                  <Plus className="w-5 h-5" />
                  <span>Add to Home Screen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Tap "Add"
            </h3>
            <p className="text-gray-700 mb-3">
              Confirm by tapping "Add" in the top-right corner.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="bg-white p-3 rounded">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-600">Cancel</span>
                  <span className="font-semibold">Add to Home</span>
                  <span className="text-blue-600 font-semibold">Add</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-2xl">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <p className="font-semibold">PantryWise</p>
                  <p className="text-sm text-gray-600">pantrywise.vercel.app</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Done! Find PantryWise on your home screen
            </h3>
            <p className="text-gray-700 mb-3">
              Look for the <Home className="w-4 h-4 inline" /> PantryWise icon
              on your iPhone home screen. Tap it to open the app!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900">
                <strong>Benefits:</strong> Faster access, works offline,
                full-screen experience, saves to home screen!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-3">Why Install?</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-1">✓</span>
            <span><strong>Quick Access:</strong> Launch directly from your home screen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-1">✓</span>
            <span><strong>Offline Support:</strong> View saved recipes and meal plans without internet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-1">✓</span>
            <span><strong>Full Screen:</strong> No browser bars, just your app</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-1">✓</span>
            <span><strong>Native Feel:</strong> Works just like a regular app</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InstallApp;
