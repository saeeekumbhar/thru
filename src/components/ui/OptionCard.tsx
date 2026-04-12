import React from 'react';
import { Star, MapPin, Clock, Info } from 'lucide-react';

interface OptionCardProps {
  type: 'stay' | 'food' | 'place' | 'transport';
  title: string;
  subtitle?: string;
  price?: string;
  rating?: number;
  tags?: string[];
  imageUrl?: string;
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
  imageUrl,
  onSelect,
  isSelected
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`group relative bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-ink ring-1 ring-ink' : 'border-ink/10'
      }`}
    >
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
        <div className="absolute -top-2 -right-2 bg-ink text-paper rounded-full p-1 shadow-sm">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};
