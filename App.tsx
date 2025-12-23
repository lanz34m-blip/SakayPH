
import React from 'react';
import { AppProvider, useApp } from './store';
import { UserView } from './views/UserView';
import { DriverView } from './views/DriverView';
import { AdminView } from './views/AdminView';
import { OwnerView } from './views/OwnerView';
import { AuthView } from './views/AuthView';
import { TestModeOverlay } from './components/TestModeOverlay';
import { Clock, LogOut } from 'lucide-react';

const PendingApprovalView: React.FC<{ name: string, onLogout: () => void }> = ({ name, onLogout }) => (
  <div className="h-screen bg-white flex flex-col items-center justify-center p-8 text-center text-black">
    <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-600/20 mb-8 animate-pulse">
      <Clock size={48} className="text-white" />
    </div>
    <h1 className="text-3xl font-black mb-4">Hello, {name}!</h1>
    <p className="text-black font-black max-w-xs mx-auto text-sm leading-relaxed mb-12 uppercase">
      Your SakayPH account is currently <span className="text-orange-600 font-black">under review</span>. We will notify you once approved.
    </p>
    <button onClick={onLogout} className="flex items-center gap-2 text-xs font-black uppercase text-black hover:text-orange-600 transition-colors bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
      <LogOut size={16} /> Logout & Exit
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { role, currentUser, logout } = useApp();

  return (
    <div className="min-h-screen bg-orange-600 flex flex-col relative">
      {!currentUser ? (
        <AuthView />
      ) : (role !== 'ADMIN' && currentUser.status === 'PENDING') ? (
        <PendingApprovalView name={currentUser.name} onLogout={logout} />
      ) : (
        <>
          {role === 'USER' && <UserView />}
          {role === 'DRIVER' && <DriverView />}
          {role === 'OWNER' && <OwnerView />}
          {role === 'ADMIN' && <AdminView />}
        </>
      )}
      
      {/* Test Mode Console Overlay */}
      <TestModeOverlay />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;