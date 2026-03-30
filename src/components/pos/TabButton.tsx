import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
      active 
        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
        : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    {label}
  </button>
);
