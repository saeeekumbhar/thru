import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedSelectorProps {
  label: string;
  options: { value: string; label: string; sublabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedSelector: React.FC<SegmentedSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider">{label}</label>
      <div className="flex bg-paper p-1.5 rounded-xl border border-ink/5 relative overflow-hidden">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="relative flex-1 py-3 px-2 rounded-lg transition-all duration-300 z-10"
            >
              <div className="flex flex-col items-center">
                <span className={`font-serif text-sm font-bold transition-colors ${isActive ? 'text-paper' : 'text-ink-light'}`}>
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span className={`text-[8px] font-typewriter uppercase tracking-tighter mt-1 transition-colors ${isActive ? 'text-paper/60' : 'text-ink/30'}`}>
                    {opt.sublabel}
                  </span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="active-segment"
                  className="absolute inset-0 bg-ink rounded-lg -z-10 shadow-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
