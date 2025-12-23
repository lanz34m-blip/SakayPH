
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { Logo } from '../components/Logo';
import { RealtimeMap } from '../components/RealtimeMap';
import { PaymentGateway, PaymentMethod } from '../components/PaymentGateway';
import { 
  Search, MapPin, Navigation, Clock, CreditCard, 
  ChevronRight, Star, History, User, ShoppingBag, Bike, Car, ArrowLeft, X, Ruler,
  Key, Home, Check, Info, Percent, Sparkles, GraduationCap, Users, Heart, Calendar, Plus, AlarmClock,
  LayoutGrid, Fuel, Droplets, LogOut, Crosshair, Loader2, ListTodo, Zap, Wallet, ArrowUpRight, ShieldCheck,
  Banknote, AlertCircle, Coins, Wrench, FileText, Wind, HeartPulse, UserCheck, Hammer, Paintbrush, Snowflake,
  Verified, Hand, Baby, Stethoscope, Utensils, Shield, Timer, CalendarDays, Briefcase
} from 'lucide-react';
import { RideStatus, ServiceType, DriverProfile, VehicleCategory, PaymentMethodType, RateType } from '../types';

export const UserView: React.FC = () => {
  const { currentUser: user, addRide, rides, addTip, drivers, logout, topUpBalance } = useApp();
  const [origin, setOrigin] = useState('Detecting location...');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState<number>(1);
  const [pabiliItems, setPabiliItems] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [eSerbisyoSubCategory, setESerbisyoSubCategory] = useState<string>('Home Cleaners');
  const [selectedProfessional, setSelectedProfessional] = useState<DriverProfile | null>(null);
  const [rateType, setRateType] = useState<RateType>('HOURLY');
  const [duration, setDuration] = useState<number>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [isPriority, setIsPriority] = useState(false);
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY' | 'WALLET' | 'ACCOUNT'>('HOME');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  // Payment states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [topUpInput, setTopUpInput] = useState('');

  // Auto-search suggestions states
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedStay, setSelectedStay] = useState<{id: number, title: string, price: number, img: string} | null>(null);

  const [selectedRentalCar, setSelectedRentalCar] = useState<DriverProfile | null>(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [isOutsideCity, setIsOutsideCity] = useState(false);
  const [hasDriver, setHasDriver] = useState(false);
  const [includeCarWash, setIncludeCarWash] = useState(false);

  const activeRide = rides.find(r => r.userId === user?.id && r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED);

  // Calculate real-world distance when coordinates change
  useEffect(() => {
    if (userCoords && destCoords) {
      const latDiff = destCoords[0] - userCoords[0];
      const lngDiff = destCoords[1] - userCoords[1];
      const d = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32;
      setDistance(Math.max(1, parseFloat(d.toFixed(2))));
    }
  }, [userCoords, destCoords]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setOrigin('Geolocation not supported');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const address = data.display_name?.split(',').slice(0, 2).join(',') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setOrigin(address);
        } catch (error) {
          setOrigin(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setOrigin('Manual Input Required');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    if (destination.length < 3) {
      setDestSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&countrycodes=ph&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        setDestSuggestions(data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearchingDest(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [destination]);

  const selectSuggestion = (suggestion: any) => {
    setDestination(suggestion.display_name);
    setDestCoords([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setDestSuggestions([]);
  };

  const stayDuration = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkInDate, checkOutDate]);

  const availableProfessionals = useMemo(() => {
    if (serviceType !== 'E_SERBISYO') return [];
    return drivers.filter(d => 
      d.vehicleType === 'E_SERBISYO' && 
      d.eSerbisyoCategory === eSerbisyoSubCategory && 
      d.isOnline && 
      d.status === 'APPROVED'
    );
  }, [drivers, serviceType, eSerbisyoSubCategory]);

  const calculatedFare = useMemo(() => {
    if (!serviceType) return 0;
    const dist = distance;
    let baseFare = 0;
    
    switch (serviceType) {
      case 'CAR':
        baseFare = dist <= 1 ? 40 : 40 + (dist - 1) * 35;
        break;
      case 'HABAL':
        baseFare = dist <= 1 ? 10 : 10 + (dist - 1) * 15;
        if (isPriority) baseFare += 20;
        break;
      case 'PABILI':
        baseFare = 150;
        break;
      case 'E_SERBISYO':
        // Individual rate based on selected worker and duration
        const workerRate = selectedProfessional?.serviceRate || 250;
        if (rateType === 'PAKYAW') {
          baseFare = workerRate; // Pakyaw is fixed
        } else {
          baseFare = workerRate * duration;
        }
        break;
      case 'RENTAL':
        if (!selectedRentalCar) return 0;
        let dailyRate = 0;
        const category = (selectedRentalCar.vehicleModel.toUpperCase().includes('SUV') ? 'SUV' : 
                         (selectedRentalCar.vehicleModel.toUpperCase().includes('VAN') || selectedRentalCar.vehicleModel.toUpperCase().includes('HILUX') || selectedRentalCar.vehicleModel.toUpperCase().includes('PICK') ? 'VAN_PICKUP' : 'SEDAN')) as VehicleCategory;
        
        if (category === 'SEDAN') {
          dailyRate = isOutsideCity ? 2000 : 1500;
        } else if (category === 'SUV') {
          dailyRate = isOutsideCity ? 2500 : 2000;
        } else {
          dailyRate = isOutsideCity ? 3500 : 2800;
        }

        baseFare = (dailyRate + (hasDriver ? 800 : 0)) * rentalDays;
        if (includeCarWash && selectedRentalCar.carWashFee) {
          baseFare += selectedRentalCar.carWashFee;
        }
        break;
      case 'STAY':
        baseFare = (selectedStay?.price || 0) * stayDuration;
        break;
    }

    return Math.ceil(baseFare);
  }, [serviceType, distance, selectedRentalCar, isOutsideCity, hasDriver, selectedStay, rentalDays, includeCarWash, isPriority, stayDuration, selectedProfessional, rateType, duration]);

  if (!user) return null;

  const handleBook = (isAdvance: boolean = false) => {
    if (serviceType === 'STAY' && (!selectedStay || stayDuration === 0)) return;
    if (serviceType === 'PABILI' && (!pabiliItems || !destination)) return;
    if (serviceType === 'E_SERBISYO' && (!serviceDescription || !selectedProfessional)) return;
    if ((serviceType === 'CAR' || serviceType === 'HABAL' || serviceType === 'E_SERBISYO') && !destination) return;
    
    if (paymentMethod === 'GCASH' && user.balance < calculatedFare) {
      alert("Insufficient Wallet Balance. Please top up via GCash first.");
      setActiveTab('WALLET');
      return;
    }

    addRide({
      userId: user.id,
      userName: user.name,
      driverId: serviceType === 'E_SERBISYO' ? selectedProfessional?.id : undefined,
      driverName: serviceType === 'E_SERBISYO' ? selectedProfessional?.name : undefined,
      origin: serviceType === 'STAY' ? 'N/A' : origin,
      destination: serviceType === 'STAY' ? selectedStay?.title || '' : destination,
      originCoords: userCoords || undefined,
      destinationCoords: destCoords || undefined,
      fare: calculatedFare,
      serviceType: serviceType!,
      paymentMethod: paymentMethod,
      pabiliItems: serviceType === 'PABILI' ? pabiliItems : undefined,
      serviceDescription: serviceType === 'E_SERBISYO' ? serviceDescription : undefined,
      eSerbisyoSubCategory: serviceType === 'E_SERBISYO' ? eSerbisyoSubCategory : undefined,
      rateType: serviceType === 'E_SERBISYO' ? rateType : undefined,
      duration: serviceType === 'E_SERBISYO' ? duration : undefined,
      isAdvanceBooking: isAdvance,
      isPriority: serviceType === 'HABAL' ? isPriority : false
    });
    
    setServiceType(null);
    setIsPriority(false);
    setDestination('');
    setPabiliItems('');
    setServiceDescription('');
    setDestCoords(null);
    setSelectedProfessional(null);
    setRateType('HOURLY');
    setDuration(1);
  };

  const handleTopUpSuccess = (method: PaymentMethod) => {
    topUpBalance(user.id, 'USER', paymentAmount);
    setIsPaymentOpen(false);
    setTopUpInput('');
    setPaymentAmount(0);
  };

  const initiateTopUp = () => {
    const amount = parseFloat(topUpInput);
    if (amount >= 50) {
      setPaymentAmount(amount);
      setIsPaymentOpen(true);
    }
  };

  const serviceConfig = {
    CAR: { label: 'Car Ride', icon: <Car size={24} />, color: 'bg-orange-600', desc: 'Starting ₱40' },
    HABAL: { label: 'Habal', icon: <Bike size={24} />, color: 'bg-orange-500', desc: 'Starting ₱10' },
    PABILI: { label: 'Pabili', icon: <ShoppingBag size={24} />, color: 'bg-orange-700', desc: '₱150 Fix' },
    E_SERBISYO: { label: 'E-Serbisyo', icon: <Wrench size={24} />, color: 'bg-indigo-600', desc: 'Expert Help' },
    RENTAL: { label: 'Car Rental', icon: <Key size={24} />, color: 'bg-slate-900', desc: 'From ₱1500' },
    STAY: { label: 'Stays', icon: <Home size={24} />, color: 'bg-orange-800', desc: 'AirBNB' },
  };

  const subCategories = [
    { name: 'Home Cleaners', icon: <Sparkles size={16} /> },
    { name: 'Masseurs', icon: <HeartPulse size={16} /> },
    { name: 'Manicurist', icon: <Hand size={16} /> },
    { name: 'On-Call babysitter', icon: <Baby size={16} /> },
    { name: 'Caregiver', icon: <Stethoscope size={16} /> },
    { name: 'Kasambahay', icon: <User size={16} /> },
    { name: 'Security Guards', icon: <Shield size={16} /> },
    { name: 'Tutors', icon: <GraduationCap size={16} /> },
    { name: 'Catering Services', icon: <Utensils size={16} /> },
    { name: 'Plumbers', icon: <Droplets size={16} /> },
    { name: 'Electricians', icon: <Zap size={16} /> },
    { name: 'Aircon Cleaners', icon: <Snowflake size={16} /> },
    { name: 'Mechanics', icon: <Wrench size={16} /> },
    { name: 'On-Call Drivers', icon: <UserCheck size={16} /> },
    { name: 'Carpenters', icon: <Hammer size={16} /> },
    { name: 'Painters', icon: <Paintbrush size={16} /> },
  ];

  const rateTypes: {id: RateType, label: string, icon: any}[] = [
    { id: 'HOURLY', label: 'Hourly', icon: <Timer size={14} /> },
    { id: 'DAILY', label: 'Daily', icon: <CalendarDays size={14} /> },
    { id: 'WEEKLY', label: 'Weekly', icon: <CalendarDays size={14} /> },
    { id: 'SEMI_MONTHLY', label: '15-Days', icon: <CalendarDays size={14} /> },
    { id: 'MONTHLY', label: 'Monthly', icon: <CalendarDays size={14} /> },
    { id: 'PAKYAW', label: 'Pakyaw', icon: <Briefcase size={14} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden shadow-2xl text-black">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-white border-b sticky top-0 z-50">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-black font-black uppercase tracking-tight">Wallet Balance</p>
            <p className="text-sm font-black text-orange-600">₱{user.balance.toFixed(2)}</p>
          </div>
          <button onClick={() => setActiveTab('ACCOUNT')} className="w-10 h-10 rounded-full border-2 border-orange-50 overflow-hidden">
            <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto pb-32">
        {activeTab === 'HOME' && (
          <>
            <RealtimeMap 
              className="w-full h-80" 
              userCoords={userCoords} 
              activeRide={activeRide} 
            />
            
            <div className={`p-4 relative z-10 -mt-12`}>
              {!activeRide ? (
                <div className="space-y-4">
                  {!serviceType ? (
                    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-black text-slate-900">Mabuhay, {user.name.split(' ')[0]}!</h2>
                          <p className="text-xs text-black font-bold">Anong serbisyo ang kailangan?</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.entries(serviceConfig) as [ServiceType, any][]).map(([key, cfg]) => (
                          <button key={key} onClick={() => setServiceType(key as ServiceType)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 border-slate-50 hover:border-orange-100 transition-all text-center">
                            <div className={`${cfg.color} text-white p-3 rounded-xl shadow-lg`}>{cfg.icon}</div>
                            <h3 className="font-black text-black text-[10px] uppercase truncate">{cfg.label}</h3>
                            <p className="text-[8px] font-bold text-slate-400">{cfg.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-6">
                        <button onClick={() => { setServiceType(null); setIsPriority(false); setSelectedProfessional(null); }}><ArrowLeft size={20} className="text-black" /></button>
                        <h2 className="font-black text-black uppercase">{serviceConfig[serviceType].label}</h2>
                        <button onClick={() => { setServiceType(null); setIsPriority(false); setSelectedProfessional(null); }} className="p-2 text-orange-600 font-black"><X size={20} /></button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <Navigation size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDetecting ? 'animate-pulse text-orange-400' : 'text-orange-600'}`} />
                          <input 
                            type="text" 
                            value={origin} 
                            onChange={e => setOrigin(e.target.value)} 
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none text-sm" 
                            placeholder={serviceType === 'PABILI' ? 'Store Location' : (serviceType === 'E_SERBISYO' ? 'Service Location' : 'Pickup point')} 
                          />
                          <button 
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600"
                          >
                            {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
                          </button>
                        </div>
                        
                        <div className="relative group">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                          <input 
                            type="text" 
                            value={destination} 
                            onChange={e => setDestination(e.target.value)} 
                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black focus:border-orange-600 outline-none text-sm" 
                            placeholder={serviceType === 'PABILI' ? 'Deliver to where?' : (serviceType === 'E_SERBISYO' ? 'Target area/Home' : 'Search destination...')} 
                          />
                          {isSearchingDest && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Loader2 size={16} className="animate-spin text-orange-600" />
                            </div>
                          )}

                          {destSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              {destSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => selectSuggestion(suggestion)}
                                  className="w-full text-left p-4 hover:bg-orange-50 border-b last:border-0 border-slate-50 transition-colors flex gap-3"
                                >
                                  <MapPin size={16} className="text-orange-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-black text-black leading-tight mb-1">{suggestion.display_name.split(',')[0]}</p>
                                    <p className="text-[9px] font-bold text-slate-400 truncate">{suggestion.display_name.split(',').slice(1).join(',')}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {serviceType === 'E_SERBISYO' && (
                          <div className="animate-in slide-in-from-top-2 space-y-4">
                             <div>
                               <div className="flex items-center gap-2 mb-3 ml-1">
                                 <LayoutGrid size={14} className="text-indigo-600" />
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Category</p>
                               </div>
                               <div className="grid grid-cols-3 gap-2 overflow-x-auto max-h-40 p-1">
                                  {subCategories.map((sub) => (
                                    <button 
                                      key={sub.name}
                                      onClick={() => {
                                        setESerbisyoSubCategory(sub.name);
                                        setSelectedProfessional(null);
                                      }}
                                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${eSerbisyoSubCategory === sub.name ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-black' : 'border-slate-50 text-slate-400 font-bold'}`}
                                    >
                                       {sub.icon}
                                       <span className="text-[8px] uppercase text-center leading-tight">{sub.name}</span>
                                    </button>
                                  ))}
                               </div>
                             </div>

                             <div>
                                <div className="flex items-center gap-2 mb-3 ml-1">
                                  <Users size={14} className="text-indigo-600" />
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available Professionals</p>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {availableProfessionals.length > 0 ? availableProfessionals.map((pro) => (
                                    <button 
                                      key={pro.id}
                                      onClick={() => setSelectedProfessional(pro)}
                                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${selectedProfessional?.id === pro.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-white'}`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <img src={pro.avatar} className="w-10 h-10 rounded-xl object-cover" />
                                          <div>
                                             <p className="text-[11px] font-black text-black flex items-center gap-1">
                                              {pro.name} <Verified size={10} className="text-blue-500 fill-blue-500" />
                                             </p>
                                             <div className="flex items-center gap-1">
                                               <Star size={8} fill="#f59e0b" className="text-amber-500" />
                                               <span className="text-[8px] font-black text-slate-400">{pro.rating} • 100+ Jobs</span>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-[10px] font-black text-indigo-600">₱{pro.serviceRate?.toLocaleString()}</p>
                                          <p className="text-[7px] font-bold text-slate-400 uppercase">Base Rate</p>
                                       </div>
                                    </button>
                                  )) : (
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                      <p className="text-[9px] font-black text-slate-400 uppercase">No professionals nearby yet</p>
                                    </div>
                                  )}
                                </div>
                             </div>

                             {selectedProfessional && (
                               <div className="p-4 bg-slate-50 rounded-3xl border-2 border-indigo-100 space-y-4 animate-in zoom-in-95">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Coins size={14} className="text-indigo-600" />
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Pricing Model</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                     {rateTypes.map((rt) => (
                                       <button 
                                        key={rt.id}
                                        onClick={() => setRateType(rt.id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${rateType === rt.id ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                                       >
                                          {rt.icon}
                                          <span className="text-[8px] font-black uppercase">{rt.label}</span>
                                       </button>
                                     ))}
                                  </div>

                                  {rateType !== 'PAKYAW' && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                                       <p className="text-[9px] font-black uppercase text-slate-400">Duration ({rateType.toLowerCase()})</p>
                                       <div className="flex items-center gap-3">
                                          <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">-</button>
                                          <span className="text-sm font-black w-6 text-center">{duration}</span>
                                          <button onClick={() => setDuration(duration + 1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">+</button>
                                       </div>
                                    </div>
                                  )}
                               </div>
                             )}

                             <div>
                               <div className="flex items-center gap-2 mb-2 ml-1">
                                 <FileText size={14} className="text-indigo-600" />
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Job Requirements</p>
                               </div>
                               <textarea 
                                  value={serviceDescription}
                                  onChange={e => setServiceDescription(e.target.value)}
                                  placeholder={`Describe what you need the ${eSerbisyoSubCategory} to do...`}
                                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs min-h-[80px] resize-none"
                               />
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex flex-col gap-3 p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-black">
                         <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Estimated Distance</p>
                            <p className="text-sm font-black text-black">{distance.toFixed(1)} km</p>
                         </div>
                         <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <p className="text-[10px] font-black text-black uppercase">Payment Method</p>
                            <div className="flex gap-1">
                               <button 
                                onClick={() => setPaymentMethod('CASH')}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 transition-all ${paymentMethod === 'CASH' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-200'}`}
                               >
                                  <Banknote size={12} /> Cash
                               </button>
                               <button 
                                onClick={() => setPaymentMethod('GCASH')}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 transition-all ${paymentMethod === 'GCASH' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}
                               >
                                  <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black ${paymentMethod === 'GCASH' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>G</div> GCash
                               </button>
                            </div>
                         </div>
                         <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <p className="text-[10px] font-black text-black uppercase">Booking Total</p>
                            <p className="text-xl font-black text-orange-600">₱{calculatedFare.toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 px-1">
                        <AlertCircle size={14} className="text-slate-400" />
                        <p className="text-[9px] font-bold text-slate-500 italic">
                          {paymentMethod === 'CASH' ? 'Mangyaring ihanda ang eksaktong bayad.' : 'Deductible from SakayPH Wallet balance.'}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleBook(false)} 
                        className={`mt-6 w-full py-4 rounded-2xl font-black text-white shadow-xl ${serviceConfig[serviceType].color}`}
                      >
                        Confirm {selectedProfessional ? `${selectedProfessional.name} for ${eSerbisyoSubCategory}` : serviceConfig[serviceType].label}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-orange-600/20">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600">{activeRide.status.replace('_', ' ')}</span>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Amount Due</p>
                       <p className="text-lg font-black text-black">₱{activeRide.fare.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-orange-600 overflow-hidden border">
                      {activeRide.driverId ? (
                         <img src={drivers.find(d => d.id === activeRide.driverId)?.avatar} className="w-full h-full object-cover" />
                      ) : <User size={32} />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{activeRide.driverName || 'Finding Partner...'}</h3>
                      <p className="text-xs text-black font-bold">
                        {activeRide.eSerbisyoSubCategory || activeRide.serviceType} 
                        {activeRide.rateType && ` • ${activeRide.rateType.replace('_', ' ')}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 mb-6 ${activeRide.paymentMethod === 'CASH' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                     {activeRide.paymentMethod === 'CASH' ? <Banknote size={18} /> : <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">G</div>}
                     <div>
                        <p className="text-[10px] font-black uppercase leading-tight">Paid via {activeRide.paymentMethod}</p>
                        <p className="text-[9px] font-bold opacity-70">
                          {activeRide.paymentMethod === 'CASH' ? 'Prepare cash for physical collection.' : 'Automatically deducted from wallet upon completion.'}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Location</p>
                     <p className="text-xs font-black text-black flex items-center gap-2"><MapPin size={14} className="text-orange-600"/> {activeRide.destination}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'HISTORY' && (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-tight px-2">Ride Archive</h2>
            {rides.filter(r => r.userId === user.id).length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 mx-2">
                 <History size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No trip history yet</p>
              </div>
            ) : rides.filter(r => r.userId === user.id).map(ride => (
              <div key={ride.id} className="bg-white border rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${ride.serviceType === 'PABILI' ? 'bg-orange-700' : (ride.serviceType === 'E_SERBISYO' ? 'bg-indigo-600' : 'bg-orange-600')} text-white`}>
                        {ride.eSerbisyoSubCategory || ride.serviceType}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(ride.timestamp).toLocaleString()}</p>
                    </div>
                    {ride.driverName && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                         <User size={12} className="text-orange-600" />
                         <p className="text-[10px] font-black uppercase tracking-tight">Partner: {ride.driverName}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-black">₱{ride.fare.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1">
                      {ride.paymentMethod === 'GCASH' ? <div className="w-3 h-3 bg-blue-600 text-white rounded-full flex items-center justify-center text-[7px] font-black">G</div> : <Banknote size={10} className="text-green-600" />}
                      <p className={`text-[8px] font-black uppercase ${ride.paymentMethod === 'CASH' ? 'text-green-600' : 'text-blue-600'}`}>{ride.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <Navigation size={12} className="text-orange-600" />
                       <p className="text-[10px] font-black text-black truncate">{ride.origin}</p>
                    </div>
                    {ride.originCoords && (
                       <p className="text-[7px] font-bold text-slate-400 ml-5 uppercase tracking-tighter">Loc: {ride.originCoords[0].toFixed(5)}, {ride.originCoords[1].toFixed(5)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <MapPin size={12} className="text-orange-600" />
                       <p className="text-[10px] font-black text-black truncate">{ride.destination}</p>
                    </div>
                    {ride.destinationCoords && (
                       <p className="text-[7px] font-bold text-slate-400 ml-5 uppercase tracking-tighter">Loc: {ride.destinationCoords[0].toFixed(5)}, {ride.destinationCoords[1].toFixed(5)}</p>
                    )}
                  </div>
                </div>

                {ride.serviceType === 'E_SERBISYO' && ride.rateType && (
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black uppercase text-slate-500 border border-slate-100">
                       Mode: {ride.rateType.replace('_', ' ')}
                     </span>
                     {ride.duration && ride.rateType !== 'PAKYAW' && (
                       <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black uppercase text-slate-500 border border-slate-100">
                         Qty: {ride.duration}
                       </span>
                     )}
                  </div>
                )}

                {ride.serviceDescription && (
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                     <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Service Requested:</p>
                     <p className="text-[10px] font-bold text-indigo-900 line-clamp-2">{ride.serviceDescription}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1">
                   {ride.tip && ride.tip > 0 ? (
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                        <Coins size={12} className="text-amber-600" />
                        <p className="text-[9px] font-black text-amber-700 uppercase">Tip: ₱{ride.tip}</p>
                     </div>
                   ) : <div />}
                   <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">ID: {ride.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'WALLET' && (
          <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="bg-slate-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600 rounded-full blur-[80px] opacity-40"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">SakayPH Wallet</p>
                        <h2 className="text-4xl font-black text-white">₱{user.balance.toFixed(2)}</h2>
                     </div>
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <Wallet size={24} className="text-orange-500" />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="relative">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">Top-up via GCash</p>
                        <input 
                          type="number" 
                          value={topUpInput}
                          onChange={e => setTopUpInput(e.target.value)}
                          placeholder="Min. ₱50" 
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white outline-none focus:bg-white/10 transition-all text-xl" 
                        />
                     </div>
                     <button 
                        onClick={initiateTopUp}
                        disabled={!topUpInput || parseFloat(topUpInput) < 50}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                     >
                        Secure GCash Top-up <ArrowUpRight size={16}/>
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
               <div className="w-10 h-10 bg-[#0055ff] rounded-xl shadow-sm flex items-center justify-center text-white shrink-0 font-black">G</div>
               <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">GCash Verified Gateway</p>
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed italic">Direct top-ups via GCash are 100% secure. Funds are credited instantly to your SakayPH wallet for booking payments.</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'ACCOUNT' && (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl mb-4 overflow-hidden">
                 <img src={user.avatar} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-black text-black">{user.name}</h3>
              <p className="text-xs font-black text-black uppercase tracking-widest">{user.email}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm text-red-600 hover:bg-orange-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-orange-100 rounded-xl"><LogOut size={20} /></div>
                 <span className="font-black uppercase text-xs">Logout Session</span>
              </div>
              <ChevronRight size={18} className="text-black" />
            </button>
          </div>
        )}
      </div>

      {/* Nav Bar */}
      <div className="bg-white border-t p-4 flex justify-around items-center sticky bottom-0 z-[100] pb-8">
        <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center ${activeTab === 'HOME' ? 'text-orange-600' : 'text-black'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'HOME' ? 'bg-orange-50' : ''}`}><Navigation size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex flex-col items-center ${activeTab === 'HISTORY' ? 'text-orange-600' : 'text-black'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'HISTORY' ? 'bg-orange-50' : ''}`}><History size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Rides</span>
        </button>
        <button onClick={() => setActiveTab('WALLET')} className={`flex flex-col items-center ${activeTab === 'WALLET' ? 'text-orange-600' : 'text-black'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'WALLET' ? 'bg-orange-50' : ''}`}><Wallet size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Wallet</span>
        </button>
        <button onClick={() => setActiveTab('ACCOUNT')} className={`flex flex-col items-center ${activeTab === 'ACCOUNT' ? 'text-orange-600' : 'text-black'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'ACCOUNT' ? 'bg-orange-50' : ''}`}><User size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Account</span>
        </button>
      </div>

      <PaymentGateway 
        amount={paymentAmount}
        isOpen={isPaymentOpen}
        onCancel={() => setIsPaymentOpen(false)}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  );
};
