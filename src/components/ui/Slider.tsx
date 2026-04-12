import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, formatValue, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-end">
        <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider">{label}</label>
        <span className="font-serif text-xl font-bold text-stamp-red">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ink cursor-pointer"
        style={{ height: '4px' }}
      />
      <div className="flex justify-between text-[10px] font-typewriter text-ink/40 uppercase">
        <span>Min</span>
        <span>Max</span>
      </div>
    </div>
  );
};
