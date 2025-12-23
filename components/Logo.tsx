import React from 'react';
import { Car, Bike } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', vertical?: boolean }> = ({ size = 'md', vertical = false }) => {
  const sizes = {
    sm: { icon: 16, text: 'text-lg' },
    md: { icon: 28, text: 'text-3xl' },
    lg: { icon: 48, text: 'text-6xl' }
  };

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'items-center'} items-center gap-2 select-none`}>
      <div className="flex items-end gap-1">
        <Car 
          size={sizes[size].icon * 1.2} 
          className="text-orange-600 fill-orange-600" 
        />
        <Bike 
          size={sizes[size].icon * 0.9} 
          className="text-orange-600 fill-orange-600 -ml-1 mb-0.5" 
        />
      </div>
      <span className={`font-black tracking-tight text-black ${sizes[size].text}`}>
        SakayPH
      </span>
    </div>
  );
};