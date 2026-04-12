import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrency(destination: string): string {
  const dest = destination.toLowerCase();
  
  // Domestic (India)
  if (dest.includes('india') || 
      dest.includes('mumbai') || 
      dest.includes('delhi') || 
      dest.includes('bangalore') || 
      dest.includes('goa') || 
      dest.includes('kerala') || 
      dest.includes('jaipur')) {
    return '₹';
  }
  
  // International
  if (dest.includes('japan') || dest.includes('tokyo') || dest.includes('kyoto')) return '¥';
  if (dest.includes('europe') || dest.includes('paris') || dest.includes('london') || dest.includes('france')) return '€';
  if (dest.includes('uk') || dest.includes('london')) return '£';
  
  return '$'; // Default
}
