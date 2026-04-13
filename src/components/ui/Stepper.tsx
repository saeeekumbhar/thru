import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  min = 1,
  max = 20,
  onChange,
  unit = '',
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider">{label}</label>
      <div className="flex items-center space-x-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => value > min && onChange(value - 1)}
          disabled={value <= min}
          className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-ink hover:text-paper disabled:opacity-20 transition-all shadow-sm"
        >
          <Minus size={18} />
        </motion.button>
        
        <div className="flex flex-col items-center">
          <motion.span 
            key={value}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-serif text-3xl font-bold text-ink"
          >
            {value}
          </motion.span>
          {unit && <span className="text-[10px] font-typewriter uppercase text-ink-light">{unit}</span>}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => value < max && onChange(value + 1)}
          disabled={value >= max}
          className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-ink hover:text-paper disabled:opacity-20 transition-all shadow-sm"
        >
          <Plus size={18} />
        </motion.button>
      </div>
    </div>
  );
};
