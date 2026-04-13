import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  currency?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  min, 
  max, 
  step, 
  value, 
  onChange, 
  formatValue, 
  currency = '₹',
  className = '' 
}) => {
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-typewriter uppercase text-ink-light tracking-widest">{label}</label>
        <div className="flex items-center space-x-2 bg-paper px-3 py-1 rounded-lg border border-ink/5 shadow-inner">
          <span className="font-serif text-lg font-bold text-ink/40">{currency}</span>
          <input 
            type="number"
            value={value}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) onChange(Math.min(max, Math.max(min, val)));
            }}
            className="w-24 bg-transparent font-serif text-xl font-bold text-stamp-red focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      
      <div className="relative pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-ink cursor-pointer bg-ink/10 h-1.5 rounded-full"
        />
        <div className="flex justify-between mt-2 text-[10px] font-typewriter text-ink/40 uppercase tracking-tighter">
          <span>{currency}{min.toLocaleString()}</span>
          <span>{currency}{max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
