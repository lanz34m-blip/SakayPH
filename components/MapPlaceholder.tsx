import React from 'react';
import { MapPin } from 'lucide-react';

export const MapPlaceholder: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-slate-200 relative overflow-hidden flex items-center justify-center ${className}`}>
      {/* Abstract Map Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Decorative Road */}
      <div className="absolute w-[200%] h-12 bg-slate-300 rotate-[35deg] top-1/4 -left-1/4 shadow-sm"></div>
      <div className="absolute w-[200%] h-8 bg-slate-300 -rotate-[15deg] bottom-1/4 -left-1/4 shadow-sm"></div>

      {/* Simulated Pins */}
      <div className="relative">
        <MapPin className="text-orange-600 animate-bounce" size={32} fill="rgba(234, 88, 12, 0.2)" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm"></div>
      </div>

      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-xs font-medium text-slate-500 shadow-sm">
        GPS Active: Metro Manila
      </div>
    </div>
  );
};