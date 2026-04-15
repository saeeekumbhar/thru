import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface OptionCardProps {
  type: 'stay' | 'food' | 'place' | 'transport' | 'interest';
  title: string;
  subtitle?: string;
  price?: string;
  rating?: number;
  tags?: string[];
  icon?: React.ReactNode;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  type,
  title,
  subtitle,
  price,
  rating,
  tags,
  icon,
  onSelect,
  isSelected
}) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={isSelected ? { scale: 1.02, zIndex: 10 } : { scale: 1, zIndex: 1 }}
      onClick={onSelect}
      className={`group relative border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? type === 'interest'
            ? 'bg-stamp-red/5 border-stamp-red shadow-md'
            : 'bg-ink border-ink shadow-2xl ring-2 ring-stamp-red/20' 
          : 'bg-white border-ink/10 hover:border-ink/30 shadow-sm'
      } ${type === 'interest' ? 'p-4 flex flex-col items-center text-center' : 'p-4 rounded-lg'}`}
      style={{
        borderRadius: type === 'interest' ? '0' : '8px',
      }}
    >
      {type === 'interest' ? (
        <>
          <div className={`mb-3 transition-all duration-300 ${isSelected ? 'scale-110 text-stamp-red' : 'text-ink/60 group-hover:scale-105 group-hover:text-ink'}`}>
            {icon}
          </div>
          <h3 className={`font-serif text-lg leading-tight transition-colors ${isSelected ? 'text-stamp-red font-bold' : 'text-ink'}`}>
            {title}
          </h3>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif font-bold text-lg text-ink line-clamp-1">{title}</h3>
            {price && <span className="font-typewriter text-sm text-stamp-red font-bold">{price}</span>}
          </div>
          
          {subtitle && (
            <div className="flex items-center text-xs text-ink-light mb-3">
              <MapPin size={12} className="mr-1" />
              <span className="line-clamp-1">{subtitle}</span>
            </div>
          )}

          {rating && (
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.floor(rating) ? 'fill-mustard text-mustard' : 'text-ink/10'} 
                />
              ))}
              <span className="ml-2 text-[10px] font-bold text-ink-light">{rating}</span>
            </div>
          )}

          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, i) => (
                <span key={i} className="text-[10px] uppercase font-typewriter bg-paper-dark px-1.5 py-0.5 rounded text-ink-light">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isSelected && (
            <div className="absolute -top-2 -right-2 bg-stamp-red text-paper rounded-full p-1 shadow-md z-20">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
