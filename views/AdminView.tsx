
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Logo } from '../components/Logo';
import { RealtimeMap } from '../components/RealtimeMap';
import { 
  Users, Car, Map, BarChart3, Search, 
  ShieldCheck, Download, Activity,
  CheckCircle2, Clock, Wallet, Trash2, Ban, X, 
  Bike, Home, History, Calendar, MapPin, Navigation, Eye, FileCheck, Info, User, Check, AlertCircle, ExternalLink, ShieldAlert,
  Star, ArrowUpRight, ListTodo, TrendingUp, CreditCard, Landmark, ArrowDownRight, Wrench, Briefcase
} from 'lucide-react';
import { AccountStatus, Role, UserProfile, DriverProfile, RideStatus } from '../types';

type AdminTab = 'DASHBOARD' | 'MAP' | 'USERS' | 'DRIVERS' | 'FINANCE';

export const AdminView: React.FC = () => {
  const { rides, totalCommissions, users, drivers, updateAccountStatus, deleteAccount, logout } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | 'ALL'>('ALL');
  
  // Modals State
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<UserProfile | null>(null);
  const [verifyingPartner, setVerifyingPartner] = useState<DriverProfile | null>(null);

  const filteredPartners = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.phone.includes(searchQuery) ||
                           d.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, filterStatus]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.phone.includes(searchQuery);
      const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  const userRides = useMemo(() => {
    if (!selectedUserForHistory) return [];
    return rides.filter(r => r.userId === selectedUserForHistory.id);
  }, [rides, selectedUserForHistory]);

  const renderVerificationModal = () => {
    if (!verifyingPartner) return null;

    return (
      <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden shadow-inner border-2 border-white">
                <img src={verifyingPartner.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight">Review Application</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase rounded tracking-widest">{verifyingPartner.vehicleType}</span>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{verifyingPartner.name}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setVerifyingPartner(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-black">
              <X size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verification ID/Selfie</p>
                  <span className="text-[8px] font-black text-green-600 uppercase">Live Capture Verified</span>
                </div>
                <div className="aspect-[3/4] rounded-3xl bg-slate-100 overflow-hidden border-2 border-slate-100 shadow-sm relative group">
                  <img src={verifyingPartner.avatar} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" alt="Selfie" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="p-3 bg-white rounded-full text-black shadow-xl"><ExternalLink size={20}/></button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 border-b pb-1">Personal Profile</p>
                  <div className="space-y-4">
                    <DetailItem label="Full Legal Name" value={verifyingPartner.name} />
                    <DetailItem label="Mobile Number" value={verifyingPartner.phone} />
                    <DetailItem label="Email Address" value={verifyingPartner.email || 'None Provided'} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 border-b pb-1">Asset Information</p>
                  <div className="space-y-4">
                    <DetailItem label="Model / Listing Title" value={verifyingPartner.vehicleModel} />
                    <DetailItem label="Plate / Registration No." value={verifyingPartner.plateNumber} />
                    <DetailItem label="Submission Date" value={new Date(verifyingPartner.joinDate).toLocaleString()} />
                  </div>
                </div>
                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex gap-3">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">
                    Identity verified via biometrics. Documentation matches national database standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="p-8 bg-slate-50 border-t flex gap-4">
            <button 
              onClick={() => {
                updateAccountStatus(verifyingPartner.id, 'DRIVER', 'SUSPENDED');
                setVerifyingPartner(null);
              }} 
              className="flex-1 py-4 border-2 border-slate-200 bg-white text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-50 hover:border-orange-100 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert size={18} /> Reject & Suspend
            </button>
            <button 
              onClick={() => {
                updateAccountStatus(verifyingPartner.id, 'DRIVER', 'APPROVED');
                setVerifyingPartner(null);
              }} 
              className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Approve Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryModal = () => {
    if (!selectedUserForHistory) return null;

    return (
      <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={selectedUserForHistory.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white" alt="" />
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">{selectedUserForHistory.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Booking History Archive</p>
              </div>
            </div>
            <button onClick={() => setSelectedUserForHistory(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-black">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {userRides.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <Calendar className="mx-auto text-slate-200" size={64} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No transaction history found</p>
              </div>
            ) : (
              userRides.map(ride => (
                <div key={ride.id} className="p-5 rounded-[24px] border border-slate-100 bg-slate-50/50 flex flex-col gap-4 hover:border-orange-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-600 text-white text-[9px] font-black uppercase rounded-lg tracking-wider">
                        {ride.serviceType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(ride.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-black text-black">₱{ride.fare.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Pickup</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 truncate">
                        <Navigation size={10} className="text-orange-500" /> {ride.origin}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Drop-off</p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 truncate">
                        <MapPin size={10} className="text-orange-600" /> {ride.destination}
                      </div>
                    </div>
                  </div>
                  {ride.serviceType === 'PABILI' && ride.pabiliItems && (
                    <div className="mt-2 p-3 bg-white rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                         <ListTodo size={12} className="text-orange-600" />
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pabili Checklist:</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 whitespace-pre-wrap leading-relaxed">{ride.pabiliItems}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-8 bg-slate-50 border-t flex justify-end">
             <button onClick={() => setSelectedUserForHistory(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Close History</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 w-full overflow-hidden relative text-black">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 flex flex-col shrink-0">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-center gap-2 mb-10 bg-white p-4 rounded-3xl shadow-xl shadow-black/20">
            <Logo size="sm" vertical />
          </div>
          <nav className="space-y-2 flex-1">
            <NavItem icon={<BarChart3 size={20} />} label="Overview" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
            <NavItem icon={<Map size={20} />} label="Fleet Tracking" active={activeTab === 'MAP'} onClick={() => setActiveTab('MAP')} />
            <NavItem icon={<Users size={20} />} label="User Base" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
            <NavItem icon={<Car size={20} />} label="Partner Fleet" active={activeTab === 'DRIVERS'} onClick={() => setActiveTab('DRIVERS')} />
            <NavItem icon={<Wallet size={20} />} label="Finance Hub" active={activeTab === 'FINANCE'} onClick={() => setActiveTab('FINANCE')} />
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-800">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-orange-600 transition-all font-black uppercase text-[10px] tracking-widest group">
              <X size={18} className="group-hover:rotate-90 transition-transform" />
              <span>Logout System</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl w-[450px] border border-slate-100 shadow-inner">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder={`Search across ${activeTab.toLowerCase()} records...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none text-sm w-full focus:outline-none text-black font-bold placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-5">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Super Admin Role</p>
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1 justify-end">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" /> Live Ops Active
                </p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-black/20"><ShieldCheck size={28}/></div>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
           {activeTab === 'DASHBOARD' && (
             <div className="space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-4 gap-8">
                   <StatCard title="Total Passengers" value={users.length.toLocaleString()} trend="+4.2%" icon={<Users className="text-blue-600" />} />
                   <StatCard title="Verified Partners" value={drivers.filter(d => d.status === 'APPROVED').length.toLocaleString()} trend="+12%" icon={<Car className="text-orange-600" />} />
                   <StatCard title="Platform Revenue" value={`₱${totalCommissions.toLocaleString()}`} trend="+24.8%" icon={<Wallet className="text-green-600" />} />
                   <StatCard title="Live Ride Requests" value={rides.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length.toString()} trend="REALTIME" icon={<Activity className="text-orange-500" />} />
                </div>

                <div className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
                   <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><Clock size={24}/></div>
                        Verification Queue
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Awaiting Identity and Asset Verification</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-5 py-2 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-full border border-orange-100 animate-pulse">
                        {drivers.filter(d => d.status === 'PENDING').length} Action Required
                      </span>
                    </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {drivers.filter(d => d.status === 'PENDING').map(d => (
                        <div key={d.id} className="p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100 flex flex-col gap-6 hover:border-orange-200 hover:bg-white transition-all group relative overflow-hidden">
                           <div className="flex items-center gap-5">
                              <div className="w-20 h-20 rounded-[32px] overflow-hidden shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-500">
                                <img src={d.avatar} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-lg font-black text-black truncate">{d.name}</p>
                                 <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-slate-200 text-black text-[8px] font-black uppercase rounded tracking-widest">{d.vehicleType}</span>
                                  <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded tracking-widest">New Applicant</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <button onClick={() => setVerifyingPartner(d)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                                <FileCheck size={16} /> Review Docs
                              </button>
                           </div>
                        </div>
                      ))}
                      {drivers.filter(d => d.status === 'PENDING').length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[56px] border-2 border-dashed border-slate-200">
                           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-green-500 shadow-xl border-2 border-green-50"><CheckCircle2 size={48}/></div>
                           <div className="text-center">
                             <p className="text-lg font-black text-black uppercase tracking-tight">System Optimized</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All registration applications have been processed.</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'DRIVERS' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Partner Fleet</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Manage drivers and property owners</p>
                  </div>
                  <div className="flex gap-3">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-6 py-3 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase bg-white outline-none focus:border-orange-600 transition-all">
                      <option value="ALL">All Partners</option>
                      <option value="APPROVED">Active Only</option>
                      <option value="PENDING">Pending Approval</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <button className="p-3 bg-slate-900 text-white rounded-2xl"><Download size={20}/></button>
                  </div>
                </div>
                <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/30">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Partner Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Service Profile</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Fleet Performance</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Safety Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPartners.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 flex items-center gap-4">
                            <img src={p.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" />
                            <div>
                              <p className="text-sm font-black text-black">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.phone}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              {p.vehicleType === 'STAY' ? <Home size={14} className="text-orange-600"/> : <Car size={14} className="text-orange-600"/>}
                              <p className="text-xs font-black uppercase text-slate-600">{p.vehicleType}</p>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{p.vehicleModel}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-black text-orange-600">₱{p.totalEarnings.toLocaleString()}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star size={10} className="fill-orange-400 text-orange-400" />
                              <span className="text-[9px] font-black text-slate-400">{p.rating} Rating</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              p.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 
                              p.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                              'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-center gap-3">
                              {p.status === 'PENDING' ? (
                                <button onClick={() => setVerifyingPartner(p)} className="p-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-900/20 hover:scale-110 transition-all">
                                  <FileCheck size={18}/>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateAccountStatus(p.id, 'DRIVER', p.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} 
                                  className={`p-3 rounded-xl transition-all shadow-md ${p.status === 'APPROVED' ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                >
                                  {p.status === 'APPROVED' ? <Ban size={18}/> : <CheckCircle2 size={18}/>}
                                </button>
                              )}
                              <button onClick={() => deleteAccount(p.id, 'DRIVER')} className="p-3 bg-slate-50 text-slate-300 hover:text-orange-600 rounded-xl transition-colors">
                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {activeTab === 'USERS' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-5">
                <div>
                  <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Passenger Base</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Active users and travel history</p>
                </div>
                <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/30">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">User Profile</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Wallet Credits</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Activity Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">History Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 flex items-center gap-4">
                            <img src={u.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" />
                            <div>
                              <p className="text-sm font-black text-black">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{u.phone}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <Wallet size={14} className="text-orange-600" />
                              <p className="text-xs font-black text-orange-600">₱{u.balance.toLocaleString()}</p>
                            </div>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Joined {new Date(u.joinDate).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              u.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => setSelectedUserForHistory(u)} className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                              <History size={18}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {activeTab === 'FINANCE' && (
             <div className="space-y-10 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Finance Hub</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Platform earnings and transaction auditing</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                    <Download size={18}/> Export Reports
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8">
                   <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 rounded-full blur-[80px] opacity-30 -mr-16 -mt-16" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Commission Surplus</p>
                      <h4 className="text-5xl font-black mb-4 relative z-10">₱{totalCommissions.toLocaleString()}</h4>
                      <div className="flex items-center gap-2 text-green-400 relative z-10">
                        <TrendingUp size={16}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">+18.5% Growth</span>
                      </div>
                   </div>
                   <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Processed GCash</p>
                        <h4 className="text-4xl font-black text-black">₱{(totalCommissions * 4.5).toLocaleString()}</h4>
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Landmark size={20}/></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Secured through GCash Enterprise API</p>
                      </div>
                   </div>
                   <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Partner Payouts</p>
                        <h4 className="text-4xl font-black text-orange-600">₱{(totalCommissions * 0.2).toLocaleString()}</h4>
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><CreditCard size={20}/></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Batch processing scheduled every Friday</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                  <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">Recent System Transactions</h3>
                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">View All Activity <ArrowUpRight size={14}/></button>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b">
                      <tr>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Tx ID</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Participant</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Service Mission</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Amount</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Fee (10%)</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rides.filter(r => r.status === RideStatus.COMPLETED).slice(0, 10).map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-5 font-mono text-[9px] text-slate-400">#{r.id.slice(-8).toUpperCase()}</td>
                          <td className="px-10 py-5">
                            <p className="text-[11px] font-black text-black">{r.userName}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Partner: {r.driverName}</p>
                          </td>
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-2">
                               <span className="px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase rounded">{r.serviceType}</span>
                               <p className="text-[10px] font-bold text-slate-600">{new Date(r.timestamp).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="px-10 py-5 font-black text-[11px]">₱{r.fare.toLocaleString()}</td>
                          <td className="px-10 py-5 font-black text-[11px] text-green-600">+₱{(r.fare * 0.1).toFixed(2)}</td>
                          <td className="px-10 py-5">
                            <span className="flex items-center gap-1.5 text-green-600 text-[9px] font-black uppercase">
                              <Check size={12}/> Settled
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {activeTab === 'MAP' && (
             <div className="h-full bg-white rounded-[56px] border-4 border-white overflow-hidden shadow-2xl relative">
                <RealtimeMap className="w-full h-full" />
                <div className="absolute top-10 left-10 z-10 bg-white/95 backdrop-blur-md p-10 rounded-[48px] shadow-2xl border border-white max-w-xs">
                   <h3 className="text-lg font-black uppercase tracking-tight text-black mb-6 flex items-center gap-3">
                     <div className="w-3 h-3 bg-orange-600 rounded-full animate-ping"/> 
                     Fleet Monitor
                   </h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Units</span>
                        <span className="text-2xl font-black text-black">{drivers.filter(d => d.isOnline).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">On-Trip Units</span>
                        <span className="text-2xl font-black text-orange-600">{rides.filter(r => r.status === 'IN_PROGRESS').length}</span>
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-orange-600" />
                           <span className="text-[9px] font-black uppercase text-slate-400">Habal-Habal (Bike)</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-600" />
                           <span className="text-[9px] font-black uppercase text-slate-400">Partner Cars</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-indigo-600" />
                           <span className="text-[9px] font-black uppercase text-slate-400">E-Serbisyo Pros</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </main>
      </div>

      {renderHistoryModal()}
      {renderVerificationModal()}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${active ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/50 scale-105 z-10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    <div className="flex items-center gap-4">
      <div className={`${active ? 'text-white' : 'text-slate-500'}`}>{icon}</div>
      <span>{label}</span>
    </div>
  </button>
);

const StatCard: React.FC<{ title: string, value: string, trend: string, icon: React.ReactNode }> = ({ title, value, trend, icon }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-start justify-between hover:scale-105 transition-transform">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</p>
      <h4 className="text-3xl font-black text-black mb-2">{value}</h4>
      <div className="flex items-center gap-1.5">
        <ArrowUpRight size={14} className={trend === 'REALTIME' ? 'text-orange-500' : 'text-green-500'} />
        <span className={`text-[9px] font-black uppercase tracking-tighter ${trend === 'REALTIME' ? 'text-orange-500' : 'text-green-500'}`}>{trend} progress</span>
      </div>
    </div>
    <div className="p-4 bg-slate-50 rounded-2xl shadow-inner">{icon}</div>
  </div>
);

const DetailItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    <p className="text-[11px] font-black text-black leading-tight break-all">{value}</p>
  </div>
);
