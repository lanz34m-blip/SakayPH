
import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../store';
import { Logo } from '../components/Logo';
import { PaymentGateway, PaymentMethod } from '../components/PaymentGateway';
import { 
  Home, Car, Key, Tag, ImageIcon, Plus, Trash2, Camera,
  CheckCircle, X, Wallet, History, Star, Bell, ArrowUpRight,
  ArrowDownLeft, Settings, Info, LayoutGrid, ListChecks, Calendar, Clock,
  ArrowRightLeft, Search, User, Edit3, FileText, Landmark, ShieldCheck,
  Droplets, AlertCircle, CheckCircle2, Wrench, Briefcase, Coins
} from 'lucide-react';
import { RideStatus, DriverProfile, ServiceType, RateType } from '../types';

export const OwnerView: React.FC = () => {
  const { currentUser: owner, rides, drivers, updateDriverProfile, updateRideStatus, transferBalance, topUpBalance, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'BOOKINGS' | 'WALLET' | 'PROFILE'>('ASSETS');
  
  const driverOwner = owner as DriverProfile;

  const [editPrice, setEditPrice] = useState(
    driverOwner?.vehicleType === 'RENTAL' ? driverOwner?.rentalPrice?.toString() : 
    (driverOwner?.vehicleType === 'E_SERBISYO' ? driverOwner?.serviceRate?.toString() : driverOwner?.stayPrice?.toString()) || '0'
  );
  const [editCarWashFee, setEditCarWashFee] = useState(driverOwner?.carWashFee?.toString() || '0');
  const [editModel, setEditModel] = useState(driverOwner?.vehicleModel || '');
  const [editPlate, setEditPlate] = useState(driverOwner?.plateNumber || '');
  const [editCategory, setEditCategory] = useState(driverOwner?.eSerbisyoCategory || 'Home Cleaners');
  const [isEditingListing, setIsEditingListing] = useState(false);
  
  // Payment states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [topUpInput, setTopUpInput] = useState('');

  const subCategories = [
    'Home Cleaners', 'Masseurs', 'Manicurist', 'On-Call babysitter', 
    'Caregiver', 'Kasambahay', 'Security Guards', 'Tutors', 
    'Catering Services', 'Plumbers', 'Electricians', 'Aircon Cleaners', 
    'Mechanics', 'On-Call Drivers', 'Carpenters', 'Painters'
  ];

  const ownerRides = useMemo(() => {
    return rides.filter(r => r.driverId === owner?.id);
  }, [rides, owner]);

  const advanceBookings = ownerRides.filter(r => r.status === RideStatus.PENDING || r.status === RideStatus.ACCEPTED);

  if (!owner) return <div className="p-8 text-center text-black font-black">No Owner Profile Found</div>;

  const initiateTopUp = () => {
    const amount = parseFloat(topUpInput);
    if (amount >= 50) {
      setPaymentAmount(amount);
      setIsPaymentOpen(true);
    }
  };

  const handleTopUpSuccess = (method: PaymentMethod) => {
    topUpBalance(owner.id, 'OWNER', paymentAmount);
    setIsPaymentOpen(false);
    setTopUpInput('');
    setPaymentAmount(0);
  };

  const handleUpdateListing = () => {
    updateDriverProfile(owner.id, {
      vehicleModel: editModel,
      plateNumber: editPlate,
      rentalPrice: driverOwner.vehicleType === 'RENTAL' ? parseFloat(editPrice || '0') : driverOwner.rentalPrice,
      stayPrice: driverOwner.vehicleType === 'STAY' ? parseFloat(editPrice || '0') : driverOwner.stayPrice,
      serviceRate: driverOwner.vehicleType === 'E_SERBISYO' ? parseFloat(editPrice || '0') : driverOwner.serviceRate,
      carWashFee: driverOwner.vehicleType === 'RENTAL' ? parseFloat(editCarWashFee || '0') : 0,
      eSerbisyoCategory: driverOwner.vehicleType === 'E_SERBISYO' ? editCategory : undefined,
    });
    setIsEditingListing(false);
  };

  const getAssetIcon = () => {
    switch(driverOwner.vehicleType) {
      case 'RENTAL': return <Car size={24} />;
      case 'STAY': return <Home size={24} />;
      case 'E_SERBISYO': return <Wrench size={24} />;
      default: return <Key size={24} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden shadow-2xl border-x text-black font-bold">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500">
            <img src={owner.avatar} className="w-full h-full object-cover" alt="Owner" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">{owner.name}</p>
            <p className="text-[9px] text-orange-400 font-black uppercase tracking-widest">
              {driverOwner.vehicleType === 'E_SERBISYO' ? 'Pro Partner' : `${driverOwner.vehicleType} Partner`}
            </p>
          </div>
        </div>
        <button onClick={logout} className="p-2 hover:text-orange-400 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'ASSETS' && (
          <div className="p-6 space-y-6 animate-in slide-in-from-right-4 pb-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-black uppercase tracking-tighter">My Business Asset</h3>
              <button onClick={() => setIsEditingListing(!isEditingListing)} className={`p-3 rounded-2xl transition-all ${isEditingListing ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'}`}>
                {isEditingListing ? <CheckCircle size={24} /> : <Edit3 size={24} />}
              </button>
            </div>

            {isEditingListing ? (
              <div className="bg-white p-6 rounded-3xl border-2 border-orange-500 shadow-xl space-y-4 animate-in zoom-in-95">
                 {driverOwner.vehicleType === 'E_SERBISYO' ? (
                   <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Service Specialization</p>
                     <select 
                        value={editCategory} 
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl font-black text-black border-2 border-transparent focus:border-orange-500 outline-none text-sm"
                     >
                       {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                   </div>
                 ) : (
                   <input type="text" value={editModel} onChange={e => setEditModel(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-black border-2 border-transparent focus:border-orange-500 outline-none" placeholder="Asset Name" />
                 )}
                 
                 <input type="text" value={editPlate} onChange={e => setEditPlate(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-black border-2 border-transparent focus:border-orange-500 outline-none" placeholder={driverOwner.vehicleType === 'E_SERBISYO' ? "Certification ID" : "Plate Number"} />
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-400 ml-1">Base Price / Rate</p>
                      <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-black border-2 border-transparent focus:border-orange-500 outline-none" placeholder="Rate" />
                   </div>
                   {driverOwner.vehicleType === 'RENTAL' && (
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 ml-1">Car Wash Fee</p>
                        <input type="number" value={editCarWashFee} onChange={e => setEditCarWashFee(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-black border-2 border-transparent focus:border-orange-500 outline-none" placeholder="Wash Fee" />
                     </div>
                   )}
                 </div>
                 <button onClick={handleUpdateListing} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Update Profile</button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-orange-100 group-hover:text-orange-200 transition-colors">
                    {getAssetIcon()}
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Live Portfolio</p>
                  <h4 className="text-2xl font-black text-slate-900">
                    {driverOwner.vehicleType === 'E_SERBISYO' ? driverOwner.eSerbisyoCategory : driverOwner.vehicleModel}
                  </h4>
                  <div className="mt-6 flex items-end gap-2">
                    <p className="text-4xl font-black text-orange-600">₱{parseFloat(editPrice || '0').toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Base Rate</p>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Registration</p>
                        <p className="text-xs font-black text-slate-900">{driverOwner.plateNumber}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Service Type</p>
                        <p className="text-xs font-black text-orange-600">{driverOwner.vehicleType.replace('_', ' ')}</p>
                     </div>
                  </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3"><Star size={20} /></div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Fleet Rating</p>
                  <p className="text-2xl font-black text-slate-900">{owner.rating}</p>
               </div>
               <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl w-fit mb-3"><Briefcase size={20} /></div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Jobs</p>
                  <p className="text-2xl font-black text-slate-900">{ownerRides.filter(r => r.status === RideStatus.COMPLETED).length}</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'BOOKINGS' && (
          <div className="p-6 space-y-6 pb-24">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-black uppercase tracking-tighter">
                 {driverOwner.vehicleType === 'E_SERBISYO' ? 'Service Missions' : 'Reservations'}
               </h3>
               <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black">{advanceBookings.length}</span>
             </div>
             
             {owner.balance <= 0 && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[32px] flex gap-4 items-center animate-pulse">
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                  <p className="text-[10px] font-black text-red-700 uppercase leading-tight">
                    CRITICAL: Your wallet balance is empty. Deposit credits to continue accepting customer bookings.
                  </p>
                </div>
             )}

             <div className="space-y-4">
               {advanceBookings.length === 0 ? (
                 <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active requests</p>
                 </div>
               ) : advanceBookings.map(ride => {
                 const commission = ride.fare * 0.10;
                 const canAccept = owner.balance >= commission && owner.balance > 0;
                 return (
                   <div key={ride.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-5 group hover:border-orange-500 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ride.userName)}&background=ea580c&color=fff&bold=true`} className="w-full h-full object-cover" />
                           </div>
                           <div>
                             <p className="text-sm font-black text-black uppercase tracking-tight">{ride.userName}</p>
                             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                               <Clock size={10}/> {new Date(ride.timestamp).toLocaleDateString()}
                             </p>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-orange-600">₱{ride.fare.toLocaleString()}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Partner Cut: 10%</p>
                        </div>
                      </div>

                      {ride.serviceDescription && (
                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                           <p className="text-[8px] font-black text-orange-400 uppercase mb-1">Customer Notes:</p>
                           <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">"{ride.serviceDescription}"</p>
                        </div>
                      )}

                      {ride.status === RideStatus.PENDING ? (
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => updateRideStatus(ride.id, RideStatus.CANCELLED)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-colors">Reject</button>
                          <button 
                            disabled={!canAccept}
                            onClick={() => updateRideStatus(ride.id, RideStatus.ACCEPTED)} 
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${canAccept ? 'bg-orange-600 text-white shadow-orange-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                          >
                            {canAccept ? <><CheckCircle2 size={16}/> Approve</> : 'Low Balance'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                           <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 size={18}/>
                              <span className="text-[10px] font-black uppercase tracking-widest">Active Agreement</span>
                           </div>
                           <button onClick={() => updateRideStatus(ride.id, RideStatus.COMPLETED)} className="px-5 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95">Complete Job</button>
                        </div>
                      )}
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {activeTab === 'WALLET' && (
           <div className="p-6 space-y-8 pb-24">
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-10">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SakayPH Wallet</p>
                        <h2 className="text-4xl font-black">₱{owner.balance.toFixed(2)}</h2>
                     </div>
                     <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Wallet size={28} className="text-orange-500" />
                     </div>
                   </div>
                   
                   <div className="space-y-5">
                      <div className="relative">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1">Deposit via GCash</p>
                        <input 
                          type="number" 
                          value={topUpInput}
                          onChange={e => setTopUpInput(e.target.value)}
                          placeholder="Amount (Min 50)" 
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-[24px] font-black text-white outline-none focus:bg-white/10 transition-all text-2xl" 
                        />
                      </div>
                      <button 
                        onClick={initiateTopUp}
                        disabled={!topUpInput || parseFloat(topUpInput) < 50}
                        className="w-full py-5 bg-orange-600 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-orange-900/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                      >
                        Secure Deposit <ArrowUpRight size={18}/>
                      </button>
                   </div>
                 </div>
              </div>

              <div className="space-y-5">
                 <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest px-1">Financial Overview</h4>
                 <div className="p-6 bg-white rounded-[32px] border border-slate-100 flex gap-5 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 rounded-[18px] shadow-inner flex items-center justify-center text-orange-600 shrink-0">
                       <Coins size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Booking Commission</p>
                       <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">A 10% platform fee is automatically deducted from this wallet upon booking approval. This ensures continuous listing visibility.</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="p-8 space-y-10 animate-in slide-in-from-bottom-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                   <img src={owner.avatar} className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-orange-600 transition-colors">
                  <Camera size={18}/>
                </button>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mt-6">{owner.name}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Verified {driverOwner.ownerType} Owner</p>
            </div>

            <div className="space-y-4">
               <button className="w-full flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-4 text-slate-900">
                    <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><ShieldCheck size={20}/></div>
                    <span className="text-xs font-black uppercase tracking-widest">Compliance Docs</span>
                  </div>
                  <ArrowUpRight size={20} className="text-slate-300"/>
               </button>
               <button onClick={logout} className="w-full flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:bg-red-50 hover:border-red-100 transition-all group">
                  <div className="flex items-center gap-4 text-red-600">
                    <div className="p-2 bg-red-100 rounded-xl"><X size={20}/></div>
                    <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
                  </div>
                  <ArrowUpRight size={20} className="text-red-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-md border-t p-4 flex justify-around items-center sticky bottom-0 z-50 pb-8 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button onClick={() => setActiveTab('ASSETS')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ASSETS' ? 'text-orange-600' : 'text-slate-300'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'ASSETS' ? 'bg-orange-50 shadow-inner' : ''}`}>{getAssetIcon()}</div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Assets</span>
        </button>
        <button onClick={() => setActiveTab('BOOKINGS')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'BOOKINGS' ? 'text-orange-600' : 'text-slate-300'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'BOOKINGS' ? 'bg-orange-50 shadow-inner' : ''}`}><ListChecks size={24} /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Orders</span>
        </button>
        <button onClick={() => setActiveTab('WALLET')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'WALLET' ? 'text-orange-600' : 'text-slate-300'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'WALLET' ? 'bg-orange-50 shadow-inner' : ''}`}><Wallet size={24} /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Wallet</span>
        </button>
        <button onClick={() => setActiveTab('PROFILE')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'PROFILE' ? 'text-orange-600' : 'text-slate-300'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'PROFILE' ? 'bg-orange-50 shadow-inner' : ''}`}><User size={24} /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Profile</span>
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
