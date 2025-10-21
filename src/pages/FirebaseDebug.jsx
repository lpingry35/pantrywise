import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function FirebaseDebug() {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const runDetailedTest = async () => {
    setLogs([]);
    setTesting(true);

    try {
      addLog('🔍 Starting detailed Firebase diagnostic...', 'info');

      // Test 1: Check if db object exists
      addLog('Test 1: Checking db object...', 'info');
      if (!db) {
        addLog('❌ FAILED: db object is undefined', 'error');
        addLog('💡 Fix: Check firebase.js configuration', 'warning');
        setTesting(false);
        return;
      }
      addLog('✅ PASSED: db object exists', 'success');

      // Test 2: Try to get a collection reference
      addLog('Test 2: Getting collection reference...', 'info');
      let testCollection;
      try {
        testCollection = collection(db, 'test-collection');
        addLog('✅ PASSED: Collection reference created', 'success');
      } catch (err) {
        addLog(`❌ FAILED: ${err.message}`, 'error');
        addLog('💡 Fix: Check Firebase initialization in firebase.js', 'warning');
        setTesting(false);
        return;
      }

      // Test 3: Try to write a document
      addLog('Test 3: Attempting to write test document...', 'info');
      try {
        const docRef = await addDoc(testCollection, {
          test: 'data',
          timestamp: new Date().toISOString()
        });
        addLog(`✅ PASSED: Document written with ID: ${docRef.id}`, 'success');
      } catch (err) {
        addLog(`❌ FAILED: ${err.message}`, 'error');
        addLog(`Error code: ${err.code}`, 'error');

        if (err.code === 'permission-denied') {
          addLog('💡 Fix: Update Firestore Security Rules', 'warning');
          addLog('Go to Firebase Console → Firestore → Rules', 'warning');
          addLog('Set: allow read, write: if true;', 'warning');
        } else if (err.code === 'unavailable') {
          addLog('💡 Fix: Check internet connection', 'warning');
        } else {
          addLog('💡 Fix: Check Firebase configuration in .env file', 'warning');
        }
        setTesting(false);
        return;
      }

      // Test 4: Try to read documents
      addLog('Test 4: Attempting to read documents...', 'info');
      try {
        const querySnapshot = await getDocs(testCollection);
        addLog(`✅ PASSED: Read ${querySnapshot.size} document(s)`, 'success');
      } catch (err) {
        addLog(`❌ FAILED: ${err.message}`, 'error');
        addLog(`Error code: ${err.code}`, 'error');
        setTesting(false);
        return;
      }

      // All tests passed
      addLog('', 'info');
      addLog('🎉 ALL TESTS PASSED!', 'success');
      addLog('Firebase is working correctly!', 'success');

    } catch (err) {
      addLog(`❌ UNEXPECTED ERROR: ${err.message}`, 'error');
      console.error('Full error:', err);
    } finally {
      setTesting(false);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50';
      case 'error': return 'text-red-700 bg-red-50';
      case 'warning': return 'text-yellow-700 bg-yellow-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '💡';
      default: return '🔍';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        🔧 Firebase Debugging Tool
      </h1>
      <p className="text-gray-600 mb-6">
        This will run detailed tests and show you exactly what's failing
      </p>

      {/* Environment Variables Check */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-blue-900 mb-2">📋 Environment Variables</h2>
        <div className="text-sm font-mono space-y-1">
          <div className={process.env.REACT_APP_FIREBASE_API_KEY ? 'text-green-700' : 'text-red-700'}>
            {process.env.REACT_APP_FIREBASE_API_KEY ? '✅' : '❌'} REACT_APP_FIREBASE_API_KEY: {process.env.REACT_APP_FIREBASE_API_KEY ? '***' + process.env.REACT_APP_FIREBASE_API_KEY.slice(-4) : 'NOT SET'}
          </div>
          <div className={process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'text-green-700' : 'text-red-700'}>
            {process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅' : '❌'} REACT_APP_FIREBASE_PROJECT_ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID || 'NOT SET'}
          </div>
          <div className={process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'text-green-700' : 'text-red-700'}>
            {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅' : '❌'} REACT_APP_FIREBASE_AUTH_DOMAIN: {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'NOT SET'}
          </div>
        </div>
        {(!process.env.REACT_APP_FIREBASE_API_KEY || !process.env.REACT_APP_FIREBASE_PROJECT_ID) && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 font-semibold">⚠️ Environment variables not loaded!</p>
            <p className="text-sm text-red-700 mt-1">
              Fix: Stop dev server (Ctrl+C), then run: <code className="bg-red-200 px-1">npm start</code>
            </p>
          </div>
        )}
      </div>

      {/* Run Test Button */}
      <button
        onClick={runDetailedTest}
        disabled={testing}
        className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors font-semibold text-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testing ? '🔄 Running Tests...' : '▶️ Run Diagnostic Tests'}
      </button>

      {/* Test Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-3 font-semibold">
            📝 Test Results
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${getLogColor(log.type)} ${log.message === '' ? 'h-4' : ''}`}
                >
                  {log.message && (
                    <>
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      <span>{getLogIcon(log.type)}</span>{' '}
                      <span>{log.message}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 border border-gray-300 rounded-lg p-4">
        <h3 className="font-bold text-gray-900 mb-2">🎯 What This Tool Does</h3>
        <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
          <li>Checks if Firebase is properly initialized</li>
          <li>Tests if it can create a collection reference</li>
          <li>Tries to write a test document (checks permissions)</li>
          <li>Tries to read documents back</li>
          <li>Shows you the exact error if something fails</li>
        </ol>
      </div>

      {/* Common Fixes */}
      <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">🔧 Common Fixes</h3>
        <div className="text-sm space-y-2">
          <div>
            <p className="font-semibold text-yellow-800">Permission Denied Error:</p>
            <p className="text-yellow-700">
              1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a><br/>
              2. Click "Firestore Database" → "Rules"<br/>
              3. Change to: <code className="bg-yellow-100 px-1">allow read, write: if true;</code><br/>
              4. Click "Publish"
            </p>
          </div>
          <div>
            <p className="font-semibold text-yellow-800 mt-3">Variables Not Loading:</p>
            <p className="text-yellow-700">
              1. Stop dev server (Ctrl+C)<br/>
              2. Run: <code className="bg-yellow-100 px-1">npm start</code><br/>
              3. Hard refresh browser (Ctrl+Shift+R)
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <a
          href="/"
          className="inline-block bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

export default FirebaseDebug;
