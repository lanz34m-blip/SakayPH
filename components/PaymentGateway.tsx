
import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CreditCard, Phone, Smartphone, 
  ArrowRight, CheckCircle2, Loader2, AlertCircle,
  Lock, ChevronRight
} from 'lucide-react';

export type PaymentMethod = 'GCASH';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (method: PaymentMethod) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onCancel, isOpen }) => {
  const [step, setStep] = useState<'SELECT' | 'DETAILS' | 'PROCESSING' | 'OTP' | 'SUCCESS'>('SELECT');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setError('');
      setPhone('');
      setOtp('');
    }
  }, [isOpen]);

  const handleSelectMethod = (m: PaymentMethod) => {
    setMethod(m);
    setStep('DETAILS');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('OTP');
    }, 2000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(method!);
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-end justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden h-[85vh] md:h-auto md:max-h-[90vh]">
        
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">GCash Secure Portal</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} className="text-green-500" /> SakayPH Verified Transaction
            </p>
          </div>
          <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full text-slate-900 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 'SELECT' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top-up Amount</p>
                <h4 className="text-4xl font-black text-orange-600">₱{amount.toLocaleString()}</h4>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Secure Provider</p>
                <button onClick={() => handleSelectMethod('GCASH')} className="w-full flex items-center gap-4 p-5 rounded-3xl border-2 border-slate-100 bg-white hover:border-blue-600 hover:bg-blue-50 transition-all text-left group">
                  <div className="w-12 h-12 bg-[#0055ff] rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">G</div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">GCash Express</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Instant wallet funding</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>

              <div className="pt-6 flex flex-col items-center gap-2">
                 <div className="flex items-center gap-1.5 opacity-40">
                    <Lock size={12} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">GCASH PROTECTED GATEWAY</span>
                 </div>
              </div>
            </div>
          )}

          {step === 'DETAILS' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4 mb-4">
                 <button type="button" onClick={() => setStep('SELECT')} className="text-slate-400"><X size={20}/></button>
                 <h4 className="font-black text-black uppercase">GCASH Verification</h4>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-blue-600 rounded-[32px] text-white flex items-center gap-5 shadow-xl shadow-blue-200">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black">G</div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">Enter Mobile Number</p>
                    <p className="text-[9px] font-bold text-white/70">Linked to your GCash Account</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GCash Number</p>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">+63</span>
                     <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9XX XXX XXXX" 
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-black outline-none" 
                     />
                  </div>
                </div>
              </div>

              {error && <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-tighter"><AlertCircle size={14}/> {error}</div>}

              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200">
                Continue to OTP <ArrowRight size={16}/>
              </button>
            </form>
          )}

          {step === 'PROCESSING' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95">
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-blue-600" />
                 </div>
               </div>
               <div className="text-center">
                  <h4 className="text-lg font-black text-black uppercase tracking-tight">Verifying with GCash</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Please do not close this window...</p>
               </div>
            </div>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="space-y-8 animate-in slide-in-from-bottom-8">
               <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600"><Smartphone size={32}/></div>
                  <h4 className="text-xl font-black text-black uppercase tracking-tight">GCash Security Code</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent to +63 •••• ••• {phone.slice(-4)}</p>
               </div>

               <div className="space-y-2">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="ENTER 6-DIGIT OTP" 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-200 text-center rounded-3xl text-4xl font-black text-black focus:border-blue-600 focus:bg-white transition-all outline-none tracking-[0.5em]" 
                  />
                  <div className="flex justify-between items-center px-1">
                     <button type="button" className="text-[9px] font-black uppercase text-slate-400 hover:text-blue-600">Resend SMS</button>
                  </div>
               </div>

               <button disabled={otp.length < 4} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200">
                Confirm GCash Transaction
               </button>
            </form>
          )}

          {step === 'SUCCESS' && (
             <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30">
                   <CheckCircle2 size={56} />
                </div>
                <div className="text-center">
                   <h4 className="text-2xl font-black text-black uppercase tracking-tight">GCash Top-up Success</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref No: GC-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                   <p className="text-xs font-black text-slate-900">₱{amount.toLocaleString()} credited to your SakayPH wallet</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentOption: React.FC<{ icon: React.ReactNode, label: string, desc: string, onClick: () => void }> = ({ icon, label, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-3xl border border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 transition-all text-left group">
    <div className="group-hover:scale-110 transition-transform">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
    </div>
    <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-600 transition-colors" />
  </button>
);
