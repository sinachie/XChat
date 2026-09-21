import React from 'react';

export const Header = () => {
  return (
    <header className="w-full bg-[#0A1118] border-b border-[#0047AB]/20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/favicon.svg" alt="XChat Icon" className="w-9 h-9" />
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-wider text-white">XCHAT</span>
          <span className="text-[9px] font-semibold tracking-[0.25em] text-[#00D2FF]">
            CONNECT BEYOND BOUNDARIES
          </span>
        </div>
      </div>
    </header>
  );
};