
import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Car, Bike, User, Compass, Crosshair, Flag } from 'lucide-react';
import { useApp } from '../store';
import { RideStatus, Ride } from '../types';
import L from 'leaflet';

const CITIES = {
  CDO: {
    name: 'Cagayan de Oro',
    center: [8.4772, 124.6459] as [number, number],
  },
  ILIGAN: {
    name: 'Iligan City',
    center: [8.2280, 124.2452] as [number, number],
  }
};

export const RealtimeMap: React.FC<{
  className?: string, 
  userCoords?: [number, number] | null,
  activeRide?: Ride | null,
  isDriverView?: boolean
}> = ({ className, userCoords, activeRide, isDriverView }) => {
  const { onlineDrivers } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routingLayerRef = useRef<L.LayerGroup | null>(null);
  const [currentCity, setCurrentCity] = useState<'CDO' | 'ILIGAN'>('CDO');

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { 
      center: CITIES[currentCity].center, 
      zoom: 15, 
      zoomControl: false, 
      attributionControl: false 
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
    routingLayerRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);

  const recenter = () => {
    if (!mapRef.current) return;
    if (activeRide && activeRide.originCoords && activeRide.destinationCoords) {
      const bounds = L.latLngBounds([activeRide.originCoords, activeRide.destinationCoords]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (userCoords) {
      mapRef.current.setView(userCoords, 16);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !routingLayerRef.current) return;

    routingLayerRef.current.clearLayers();
    
    // 1. Update/Create Driver Markers
    onlineDrivers.forEach(d => {
      const markerId = `driver-${d.id}`;
      const driverPos: [number, number] = [d.y, d.x];
      
      if (!markersRef.current[markerId]) {
        const driverIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="p-2 rounded-xl bg-slate-900 text-white shadow-2xl border-2 border-orange-500 flex items-center justify-center transition-all duration-500 transform scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                </div>`,
          iconSize: [40, 40]
        });
        markersRef.current[markerId] = L.marker(driverPos, { icon: driverIcon }).addTo(mapRef.current!);
      } else {
        markersRef.current[markerId].setLatLng(driverPos);
      }

      // 2. Advanced Route Guide Logic
      if (activeRide && activeRide.driverId === d.id && activeRide.originCoords && activeRide.destinationCoords) {
        const origin: [number, number] = activeRide.originCoords;
        const dest: [number, number] = activeRide.destinationCoords;
        
        // Waypoint A: Pickup (Origin)
        const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-black animate-bounce">A</div>`,
          iconSize: [32, 32]
        });
        L.marker(origin, { icon: startIcon }).addTo(routingLayerRef.current).bindTooltip("Pickup Location", { permanent: false, direction: 'top' });

        // Waypoint B: Destination
        const endIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-10 h-10 rounded-full bg-orange-600 border-2 border-white shadow-xl flex items-center justify-center text-white shadow-orange-600/30 animate-pulse">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </div>`,
          iconSize: [40, 40]
        });
        L.marker(dest, { icon: endIcon }).addTo(routingLayerRef.current).bindTooltip("Destination", { permanent: false, direction: 'top' });

        // LEG 1: APPROACHING PICKUP
        if (activeRide.status === RideStatus.ACCEPTED || activeRide.status === RideStatus.ARRIVED) {
          // Glow route to pickup
          L.polyline([driverPos, origin], { 
            color: '#3b82f6', // Blue for approach
            weight: 8, 
            opacity: 0.8, 
            dashArray: '1, 12', 
            lineCap: 'round' 
          }).addTo(routingLayerRef.current);

          // Faded route to destination
          L.polyline([origin, dest], { 
            color: '#94a3b8', 
            weight: 4, 
            opacity: 0.3 
          }).addTo(routingLayerRef.current);

          if (isDriverView) {
            mapRef.current.fitBounds(L.latLngBounds([driverPos, origin]), { padding: [70, 70] });
          }
        } 
        // LEG 2: CARRYING PASSENGER TO DESTINATION
        else if (activeRide.status === RideStatus.IN_PROGRESS) {
          L.polyline([driverPos, dest], { 
            color: '#ea580c', // Orange for delivery
            weight: 10, 
            opacity: 1,
            lineCap: 'round' 
          }).addTo(routingLayerRef.current);

          if (isDriverView) {
            mapRef.current.fitBounds(L.latLngBounds([driverPos, dest]), { padding: [70, 70] });
          }
        }
      }
    });

    // 3. Current User Location (Idle)
    if (userCoords && !activeRide) {
      const userMarkerId = 'user-location';
      if (!markersRef.current[userMarkerId]) {
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="p-2 rounded-full bg-blue-600 text-white shadow-2xl border-2 border-white flex items-center justify-center animate-pulse">
                  <div class="w-3 h-3 bg-white rounded-full"></div>
                </div>`,
          iconSize: [28, 28]
        });
        markersRef.current[userMarkerId] = L.marker(userCoords, { icon: userIcon }).addTo(mapRef.current);
      } else {
        markersRef.current[userMarkerId].setLatLng(userCoords);
      }
      mapRef.current.setView(userCoords, 16);
    }
  }, [onlineDrivers, userCoords, activeRide, isDriverView]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* Route Indicator Legend */}
      {activeRide && (
        <div className="absolute top-4 left-4 z-20 flex gap-2">
           <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeRide.status === RideStatus.IN_PROGRESS ? 'bg-orange-600' : 'bg-blue-600'}`} />
              <span className="text-[9px] font-black uppercase text-slate-900 tracking-widest">
                {activeRide.status === RideStatus.IN_PROGRESS ? 'Navigating to Dest' : 'Approaching Pickup'}
              </span>
           </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
        <button 
          onClick={recenter}
          className="w-14 h-14 bg-white rounded-[20px] shadow-2xl flex items-center justify-center text-slate-900 border border-slate-100 active:scale-90 transition-transform"
        >
          <Crosshair size={28} />
        </button>
      </div>
    </div>
  );
};
