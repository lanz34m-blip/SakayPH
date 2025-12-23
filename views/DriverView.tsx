
import React, { useState } from 'react';
import { useApp } from '../store';
import { Logo } from '../components/Logo';
import { RealtimeMap } from '../components/RealtimeMap';
import { 
  DollarSign, Star, MapPin, User, ChevronRight, Bell, ShoppingBag, 
  Wallet, TrendingUp, Power, LayoutGrid, LogOut, Navigation, 
  ListTodo, CheckCircle2, ExternalLink, ArrowRight, Flag,
  Bike, Car, Zap, Banknote, AlertTriangle, Wrench, FileText, Timer, CalendarDays, Briefcase
} from 'lucide-react';
import { RideStatus, ServiceType, DriverProfile } from '../types';

export const DriverView: React.FC = () => {
  const { currentUser: driver, rides, drivers, updateRideStatus, logout } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'STATUS' | 'WALLET' | 'ACCOUNT'>('STATUS');

  if (!driver || !('vehicleModel' in driver)) return null;

  const pendingRides = rides.filter(r => r.status === RideStatus.PENDING);
  const activeRide = rides.find(r => r.driverId === driver.id && r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED);

  const openInExternalMaps = () => {
    if (!activeRide) return;
    const target = activeRide.status === RideStatus.IN_PROGRESS ? activeRide.destination : activeRide.origin;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden shadow-2xl border-x text-black">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img src={driver.avatar} className="object-cover" alt="Driver" />
          </div>
          <div>
            <p className="text-xs font-black">{driver.name}</p>
            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">{driver.vehicleType} Partner</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-white hover:text-orange-400 transition-colors"><LogOut size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'STATUS' && (
          <>
            {!activeRide && (
              <div className="px-4 pt-4">
                <div className={`p-4 rounded-3xl border transition-all flex items-center justify-between ${isOnline ? 'bg-white border-orange-100 shadow-lg' : 'bg-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOnline ? 'bg-orange-500 text-white' : 'bg-slate-300 text-black'}`}><Power size={24} /></div>
                    <div>
                      <h3 className="font-black text-black text-sm uppercase">Mission Status</h3>
                      <p className="text-[10px] font-black text-black uppercase tracking-tighter">{isOnline ? 'Scanning for Jobs' : 'Resting/Offline'}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOnline(!isOnline)} className={`relative w-14 h-8 rounded-full ${isOnline ? 'bg-orange-500' : 'bg-slate-300'}`}><div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-6' : ''}`} /></button>
                </div>
              </div>
            )}

            {activeRide ? (
              <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-5">
                <div className={`p-5 text-white flex items-center gap-4 shadow-xl z-30 ${activeRide.status === RideStatus.IN_PROGRESS ? 'bg-orange-600' : 'bg-blue-600'}`}>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Navigation className="text-white animate-pulse" size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-white/70 tracking-widest">Job Location</p>
                    <h3 className="text-sm font-black uppercase truncate leading-tight mt-0.5">
                      {activeRide.status === RideStatus.IN_PROGRESS ? `Destination: ${activeRide.destination}` : `Pickup: ${activeRide.origin}`}
                    </h3>
                  </div>
                </div>

                <div className="relative h-[30vh] w-full shrink-0">
                  <RealtimeMap 
                    className="h-full w-full" 
                    activeRide={activeRide}
                    isDriverView={true}
                  />
                  <div className="absolute top-4 right-4 z-20">
                     <button onClick={openInExternalMaps} className="bg-slate-900 text-white p-4 rounded-[20px] shadow-2xl border border-white/10 flex items-center gap-2 active:scale-95 transition-transform"><ExternalLink size={20} /></button>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 bg-white -mt-6 rounded-t-[48px] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] overflow-y-auto">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-ping ${activeRide.status === RideStatus.IN_PROGRESS ? 'bg-orange-600' : 'bg-blue-600'}`} />
                            <span className="text-[11px] font-black uppercase text-slate-900 tracking-widest">{activeRide.status.replace('_', ' ')}</span>
                          </div>
                          {activeRide.serviceType === 'E_SERBISYO' && (
                            <div className="flex gap-2">
                               <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[8px] font-black uppercase">
                                 {activeRide.eSerbisyoSubCategory || 'Pro Service'}
                               </span>
                               {activeRide.rateType && (
                                 <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[8px] font-black uppercase border border-slate-200">
                                   {activeRide.rateType.replace('_', ' ')} x {activeRide.duration}
                                 </span>
                               )}
                            </div>
                          )}
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Mission Earnings</p>
                          <p className="text-3xl font-black text-slate-900">₱{activeRide.fare.toFixed(2)}</p>
                       </div>
                    </div>

                    {activeRide.serviceDescription && (
                       <div className="p-5 bg-indigo-50 rounded-[32px] border border-indigo-100 animate-in slide-in-from-top-4">
                          <div className="flex items-center gap-2 mb-2">
                             <FileText size={16} className="text-indigo-600" />
                             <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Work Details:</p>
                          </div>
                          <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">"{activeRide.serviceDescription}"</p>
                       </div>
                    )}

                    <div className={`p-5 rounded-3xl border flex items-center gap-4 ${activeRide.paymentMethod === 'CASH' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                        {activeRide.paymentMethod === 'CASH' ? <Banknote size={24} className="text-green-600 shrink-0" /> : <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0">G</div>}
                         <div>
                            <p className={`text-[10px] font-black uppercase tracking-tight ${activeRide.paymentMethod === 'CASH' ? 'text-green-900' : 'text-blue-900'}`}>Payment: {activeRide.paymentMethod}</p>
                            <p className={`text-[9px] font-bold ${activeRide.paymentMethod === 'CASH' ? 'text-green-800' : 'text-blue-800'} leading-tight`}>
                              {activeRide.paymentMethod === 'CASH' ? `Siningilin ang ₱${activeRide.fare.toLocaleString()} sa pasahero.` : 'System will automatically credit earnings upon completion.'}
                            </p>
                         </div>
                    </div>

                    <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[32px] border border-slate-100">
                       <div className="w-16 h-16 rounded-[20px] overflow-hidden border-2 border-white shadow-lg">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeRide.userName)}&background=ea580c&color=fff&bold=true`} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Customer Contact</p>
                          <p className="text-xl font-black text-slate-900">{activeRide.userName}</p>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                       {activeRide.status === RideStatus.ACCEPTED && (
                         <button onClick={() => updateRideStatus(activeRide.id, RideStatus.ARRIVED)} className="flex-1 py-5 bg-slate-900 text-white rounded-[28px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">I've Arrived at Site</button>
                       )}
                       {activeRide.status === RideStatus.ARRIVED && (
                         <button onClick={() => updateRideStatus(activeRide.id, RideStatus.IN_PROGRESS)} className="flex-1 py-5 bg-blue-600 text-white rounded-[28px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Work Started</button>
                       )}
                       {activeRide.status === RideStatus.IN_PROGRESS && (
                         <button onClick={() => updateRideStatus(activeRide.id, RideStatus.COMPLETED)} className={`flex-1 py-5 text-white rounded-[28px] font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all ${activeRide.paymentMethod === 'CASH' ? 'bg-green-600 shadow-green-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}>
                           {activeRide.paymentMethod === 'CASH' ? <><Banknote size={18}/> Job Done & Collect Cash</> : <><CheckCircle2 size={18}/> Job Done & End Session</>}
                         </button>
                       )}
                    </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Earnings Today</p>
                    <p className="text-2xl font-black text-orange-600">₱{driver.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Fleet Rating</p>
                    <div className="flex items-center justify-center gap-1.5 text-slate-900">
                      <p className="text-2xl font-black">{driver.rating}</p>
                      <Star size={20} fill="#ea580c" className="text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                   <p className="text-[11px] font-black uppercase text-slate-900 tracking-tighter">Nearby Opportunities ({pendingRides.length})</p>
                </div>

                {pendingRides.map(ride => (
                  <div 
                    key={ride.id} 
                    className="rounded-[40px] p-6 border bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className={`p-3 rounded-2xl ${ride.serviceType === 'E_SERBISYO' ? 'bg-indigo-50 text-indigo-600' : (ride.paymentMethod === 'GCASH' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')}`}>
                            {ride.serviceType === 'E_SERBISYO' ? <Wrench size={22}/> : (ride.paymentMethod === 'GCASH' ? <div className="w-5 h-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">G</div> : <Banknote size={22}/>)}
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              {ride.eSerbisyoSubCategory || ride.serviceType} 
                              {ride.rateType && ` • ${ride.rateType.replace('_', ' ')}`}
                            </p>
                            <p className="text-base font-black text-slate-900">{ride.userName}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-orange-600">₱{ride.fare.toLocaleString()}</p>
                        <p className={`text-[7px] font-black uppercase tracking-widest ${ride.paymentMethod === 'GCASH' ? 'text-blue-600' : 'text-green-600'}`}>{ride.paymentMethod}</p>
                      </div>
                    </div>
                    
                    {ride.serviceDescription && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquiry:</p>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-2 italic">"{ride.serviceDescription}"</p>
                      </div>
                    )}

                    <div className="space-y-4 p-5 rounded-[28px] border bg-slate-50/50 border-slate-50 mt-4">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-slate-900" />
                          <p className="text-[11px] font-black text-slate-600 truncate">{ride.origin}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-orange-600" />
                          <p className="text-[11px] font-black text-slate-900 truncate">{ride.destination}</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => updateRideStatus(ride.id, RideStatus.ACCEPTED, driver.id)} 
                      className="w-full mt-5 py-5 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 hover:bg-orange-600"
                    >
                      Accept & Professional Mission
                    </button>
                  </div>
                ))}

                {pendingRides.length === 0 && (
                  <div className="text-center py-24 px-8">
                     <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><Navigation size={40} className="text-slate-300 animate-pulse" /></div>
                     <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Searching for GCash/Cash missions...</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white border-t p-4 flex justify-around items-center sticky bottom-0 z-50 pb-8">
        <button onClick={() => setActiveTab('STATUS')} className={`flex flex-col items-center ${activeTab === 'STATUS' ? 'text-orange-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'STATUS' ? 'bg-orange-50' : ''}`}><LayoutGrid size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Missions</span>
        </button>
        <button onClick={() => setActiveTab('WALLET')} className={`flex flex-col items-center ${activeTab === 'WALLET' ? 'text-orange-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'WALLET' ? 'bg-orange-50' : ''}`}><Wallet size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Earnings</span>
        </button>
        <button onClick={() => setActiveTab('ACCOUNT')} className={`flex flex-col items-center ${activeTab === 'ACCOUNT' ? 'text-orange-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'ACCOUNT' ? 'bg-orange-50' : ''}`}><User size={22} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
};
