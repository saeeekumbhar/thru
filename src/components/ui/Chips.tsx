import React from 'react';

interface ChipsProps {
  label: string;
  options: { value: string; label: string; icon?: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export const Chips: React.FC<ChipsProps> = ({ label, options, selectedValues, onChange, className = '' }) => {
  const toggleSelection = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleSelection(opt.value)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all flex items-center space-x-2 ${
                isSelected 
                  ? 'bg-ink text-paper border-ink' 
                  : 'bg-paper text-ink border-ink/20 hover:border-ink/50'
              }`}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span className={isSelected ? 'font-bold' : ''}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
