import React, { useState, useEffect } from 'react';
import { Download, CheckCircle } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <div className="bg-[#05080C] border border-[#0047AB]/40 rounded-xl p-3 mx-4 my-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-[#00D2FF]" />
        <span className="text-xs text-white font-medium">Install XChat App for Native Desktop/Mobile Access</span>
      </div>
      <button
        onClick={handleInstallClick}
        className="px-4 py-1.5 bg-gradient-to-r from-[#0047AB] to-[#00D2FF] text-white font-bold text-xs rounded-lg hover:opacity-90 transition"
      >
        Install App
      </button>
    </div>
  );
};