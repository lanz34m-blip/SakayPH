
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  Terminal, Shield, User, Bike, Home, 
  Plus, Zap, ChevronUp, ChevronDown, X, 
  Coins, RotateCcw, Play, Loader2, Sparkles, MapPin, 
  Settings, Database, Activity, Wrench, Key, Car
} from 'lucide-react';
import { Role, RideStatus, ServiceType } from '../types';

export const TestModeOverlay: React.FC = () => {
  const { 
    quickSwitch, currentUser, role, addRide, 
    resetSystem, spawnDrivers, rides, updateRideStatus,
    topUpBalance, drivers
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const roles: { id: Role, label: string, icon: any }[] = [
    { id: 'ADMIN', label: 'Admin', icon: <Shield size={14}/> },
    { id: 'USER', label: 'User', icon: <User size={14}/> },
    { id: 'DRIVER', label: 'Driver', icon: <Bike size={14}/> },
    { id: 'OWNER', label: 'Owner', icon: <Home size={14}/> },
  ];

  const injectRide = (type: ServiceType) => {
    if (role !== 'USER' || !currentUser) {
      addLog('ERR: Switch to USER to generate ride');
      return;
    }

    const payload: any = {
      userId: currentUser.id,
      userName: currentUser.name,
      origin: 'Divisoria Plaza, CDO',
      destination: 'Centrio Ayala Mall',
      fare: type === 'CAR' ? 85 : (type === 'E_SERBISYO' ? 350 : (type === 'RENTAL' ? 2500 : 1500)),
      serviceType: type,
      paymentMethod: 'CASH',
    };

    if (type === 'E_SERBISYO') {
      payload.eSerbisyoSubCategory = 'Home Cleaners';
      payload.serviceDescription = 'Deep cleaning for a 2-bedroom condo unit.';
      payload.rateType = 'HOURLY';
      payload.duration = 4;
    }

    if (type === 'RENTAL') {
      payload.rentalVehicle = 'Toyota Vios 2023';
      payload.rentalDays = 2;
    }

    addRide(payload);
    addLog(`MOCK_RIDE: ${type} trip injected`);
  };

  const handleWealthMode = () => {
    if (currentUser) {
      topUpBalance(currentUser.id, role === 'USER' ? 'USER' : 'DRIVER', 10000);
      addLog('WEALTH_MODE: Credits +₱10k');
    }
  };

  const handleSpawn = () => {
    spawnDrivers(5);
    addLog('FLEET_SYNC: 5 units deployed');
  };

  const handleReset = () => {
    resetSystem();
    addLog('SYS_RESET: Storage cleared');
  };

  const runSimulation = async () => {
    const pendingRide = rides.find(r => r.status === RideStatus.PENDING);
    if (!pendingRide) {
      addLog('SIM_ERR: No pending rides found');
      return;
    }

    setIsSimulating(true);
    addLog('SIM_START: Processing happy path...');
    
    // Find a matching driver or owner
    const d = drivers.find(dr => dr.status === 'APPROVED' && dr.isOnline && dr.vehicleType === pendingRide.serviceType);
    const driverId = d ? d.id : (drivers[0]?.id || 'd1');

    try {
      await new Promise(r => setTimeout(r, 1000));
      updateRideStatus(pendingRide.id, RideStatus.ACCEPTED, driverId);
      addLog('SIM: Partner accepted');
      
      await new Promise(r => setTimeout(r, 1500));
      updateRideStatus(pendingRide.id, RideStatus.ARRIVED);
      addLog('SIM: Partner arrived');
      
      await new Promise(r => setTimeout(r, 1500));
      updateRideStatus(pendingRide.id, RideStatus.IN_PROGRESS);
      addLog('SIM: Work in progress');
      
      await new Promise(r => setTimeout(r, 2000));
      updateRideStatus(pendingRide.id, RideStatus.COMPLETED);
      addLog('SIM_END: Mission success');
    } catch (e) {
      addLog('SIM_ERR: Simulation interrupted');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-3 pointer-events-none">
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 w-80 animate-in slide-in-from-bottom-5 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-600/20 rounded-xl flex items-center justify-center">
                   <Zap size={18} className="text-orange-500 fill-orange-500" />
                </div>
                <div>
                   <h4 className="text-[11px] font-black uppercase text-white tracking-widest leading-none">SakayPH Console</h4>
                   <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Developer Sandbox v5.0</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
             </button>
          </div>

          <div className="space-y-6">
             {/* Role Switcher */}
             <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                   <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Environment Switch</p>
                   <Database size={10} className="text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {roles.map(r => (
                     <button 
                       key={r.id}
                       onClick={() => quickSwitch(r.id)}
                       className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[9px] font-black uppercase border-2 transition-all active:scale-95 ${role === r.id ? 'border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'}`}
                     >
                        {r.icon} {r.label}
                     </button>
                   ))}
                </div>
             </div>

             {/* Macros */}
             <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                   <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Simulation Macros</p>
                   <Activity size={10} className="text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton 
                    icon={<Sparkles size={14}/>} 
                    label="Wealth Mode" 
                    onClick={handleWealthMode}
                    subLabel="+₱10,000"
                  />
                  {/* Fixed: Added Car icon from lucide-react */}
                  <ActionButton 
                    icon={<Car size={14}/>} 
                    label="Mock Car" 
                    onClick={() => injectRide('CAR')}
                    subLabel="Transport"
                  />
                  <ActionButton 
                    icon={<Wrench size={14}/>} 
                    label="Mock Pro" 
                    onClick={() => injectRide('E_SERBISYO')}
                    subLabel="Service"
                  />
                  <button 
                    disabled={isSimulating}
                    onClick={runSimulation}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-900/40 active:scale-95 transition-all group disabled:opacity-50"
                  >
                    {isSimulating ? <Loader2 size={16} className="animate-spin mb-1"/> : <Play size={16} className="mb-1 group-hover:scale-110 transition-transform"/>}
                    <span className="text-[9px] font-black uppercase leading-none">Auto Path</span>
                    <span className="text-[7px] font-bold opacity-70 uppercase mt-0.5 tracking-tighter">Fast Cycle</span>
                  </button>
                </div>
             </div>

             {/* Logs Panel */}
             <div className="bg-black/50 rounded-2xl p-3 border border-white/5 font-mono">
                <div className="flex items-center gap-2 mb-2 px-1">
                   <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"/>
                   <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Dev Live Feed</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-hidden">
                   {logs.length > 0 ? logs.map((log, i) => (
                     <div key={i} className="text-[8px] text-slate-300 truncate">
                        {log}
                     </div>
                   )) : <p className="text-[8px] text-slate-700 italic">No activity recorded...</p>}
                </div>
             </div>
             
             {/* Destructive */}
             <button 
                onClick={handleReset}
                className="w-full py-3 bg-red-950/30 border border-red-900/50 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-900 hover:text-white transition-all shadow-xl"
             >
                <RotateCcw size={12}/> Global Wipe
             </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all active:scale-90 relative ${isOpen ? 'bg-orange-600 rotate-180' : 'bg-slate-900 hover:bg-orange-600'}`}
      >
        {isOpen ? <ChevronDown className="text-white" size={24} /> : <Zap className="text-orange-500" size={24} />}
        {!isOpen && rides.some(r => r.status === RideStatus.PENDING) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900 animate-bounce">
            !
          </div>
        )}
      </button>
    </div>
  );
};

const ActionButton: React.FC<{ icon: any, label: string, onClick: () => void, subLabel: string }> = ({ icon, label, onClick, subLabel }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-100 active:scale-95 transition-all group"
  >
    <div className="text-orange-600 mb-1 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[9px] font-black uppercase leading-none text-center">{label}</span>
    <span className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">{subLabel}</span>
  </button>
);
