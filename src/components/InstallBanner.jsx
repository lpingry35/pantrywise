import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Shows banner prompting user to install PWA
 * Only shows on iPhone Safari
 * Can be dismissed (saves to localStorage)
 */

function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if iPhone/iPad
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    // Check if user dismissed banner
    const dismissed = localStorage.getItem('installBannerDismissed');

    // Show banner if: iOS + not installed + not dismissed
    if (isIOS && !isInstalled && !dismissed) {
      // Show banner after a short delay (less intrusive)
      setTimeout(() => setShow(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-4 z-50 lg:max-w-md lg:left-auto lg:right-4 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <Download className="w-6 h-6 flex-shrink-0 mt-1" />
        <div>
          <p className="font-semibold mb-1">Install PantryWise</p>
          <p className="text-sm text-blue-100 mb-3">
            Add to home screen for quick access and offline use!
          </p>
          <Link
            to="/install"
            className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            See How →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InstallBanner;
