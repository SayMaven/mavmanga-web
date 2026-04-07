// src/components/ContentWarning.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ContentWarning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConfirmed = localStorage.getItem('maven_content_confirmed');
    if (!hasConfirmed) {
      setIsVisible(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('maven_content_confirmed', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com/search?q=manga&udm=2';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md px-4 animate-in fade-in duration-300">
      <div className="bg-[#191A1C] w-full max-w-md rounded-lg shadow-2xl border border-white/10 relative flex flex-col p-6">
        <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <span className="text-[#FF6740]">⚠️</span> Content Warning
        </h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-8">
          Situs web ini berisi manga yang mungkin mencakup <strong>konten sensitive</strong> dan <strong>konten dewaasa (18+)</strong>. 
          <br /><br />
          Dengan melanjutkan, Anda menyatakan bahwa Anda menyadari adanya konten tersebut dan memenuhi persyaratan usia untuk melihatnya.
        </p>

        <div className="flex justify-end gap-3">
          <button 
            onClick={handleDecline}
            className="px-5 py-2.5 rounded bg-[#3c3e44] hover:bg-[#4a4d55] text-white font-bold text-sm transition"
          >
            Tolak & Keluar
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded bg-[#FF6740] hover:bg-[#ff5528] text-white font-bold text-sm shadow-lg transition transform active:scale-95"
          >
            Aku Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}