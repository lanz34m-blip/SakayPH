
import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { Logo } from '../components/Logo';
import { 
  User, Mail, Lock, Phone, ArrowRight, Car, 
  Home, ShieldCheck, Key, BadgeCheck, X, Bike, Eye, EyeOff, Camera, RefreshCw, Check, Wrench
} from 'lucide-react';
import { Role, ServiceType } from '../types';

export const AuthView: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('USER');
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // Photo Capture States
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Registration specific fields
  const [vehicleType, setVehicleType] = useState<ServiceType>('CAR');
  const [ownerType, setOwnerType] = useState<ServiceType>('RENTAL');
  const [eSerbisyoCategory, setESerbisyoCategory] = useState('Home Cleaners');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const [error, setError] = useState('');

  const subCategories = [
    'Home Cleaners', 'Masseurs', 'Manicurist', 'On-Call babysitter', 
    'Caregiver', 'Kasambahay', 'Security Guards', 'Tutors', 
    'Catering Services', 'Plumbers', 'Electricians', 'Aircon Cleaners', 
    'Mechanics', 'On-Call Drivers', 'Carpenters', 'Painters'
  ];

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera. Please allow permissions.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(identifier, role);
      if (!success) setError('Account not found for this role.');
    } else {
      if (role === 'ADMIN') {
        setError('Admin accounts cannot be registered manually.');
        return;
      }
      if (!phone || !name || !password) return setError('Please fill all required fields.');
      if (!capturedPhoto) return setError('Please take a selfie to verify your identity.');
      
      signup({
        role,
        name,
        email,
        phone,
        password,
        photo: capturedPhoto,
        vehicleType: role === 'DRIVER' ? vehicleType : (role === 'OWNER' ? ownerType : undefined),
        vehicleModel,
        plateNumber,
        eSerbisyoCategory: ownerType === 'E_SERBISYO' ? eSerbisyoCategory : undefined,
      });
    }
  };

  const roles = [
    { id: 'USER', label: 'User', icon: <User size={18} /> },
    { id: 'DRIVER', label: 'Driver', icon: <Bike size={18} /> },
    { id: 'OWNER', label: 'Owner', icon: <Home size={18} /> },
    { id: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={18} /> },
  ];

  const filteredRoles = isLogin ? roles : roles.filter(r => r.id !== 'ADMIN');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-orange-600 rounded-b-[60px] -z-10"></div>
      
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-white p-6 rounded-[40px] shadow-2xl inline-block mb-4">
          <Logo size="md" vertical />
        </div>
        <p className="text-black font-black text-sm uppercase tracking-widest mt-2">Ang inyong maaasahang biyahe.</p>
      </div>

      <div className="w-full bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'bg-orange-600 text-white shadow-lg' : 'text-black'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsLogin(false);
              setRole('USER');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'bg-orange-600 text-white shadow-lg' : 'text-black'}`}
          >
            Register
          </button>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase text-black tracking-widest mb-3 ml-1">Select Role</p>
          <div className="grid grid-cols-4 gap-2">
            {filteredRoles.map(r => (
              <button 
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as Role)}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${role === r.id ? 'border-orange-600 bg-orange-50 text-orange-600 font-black' : 'border-slate-100 text-black font-bold'}`}
              >
                {r.icon}
                <span className="text-[8px] font-black uppercase">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isLogin ? (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input 
                type="text" 
                placeholder="Mobile Number or Email" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none"
              />
            </div>
          ) : (
            <>
              {/* Profile Photo Step */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <p className="text-[10px] font-black uppercase text-black tracking-widest self-start ml-1">Selfie Verification</p>
                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-orange-600 flex items-center justify-center overflow-hidden">
                  {capturedPhoto ? (
                    <img src={capturedPhoto} className="w-full h-full object-cover" alt="Captured" />
                  ) : (
                    <Camera className="text-orange-600" size={32} />
                  )}
                  {isCameraOpen && (
                    <div className="absolute inset-0 bg-black z-20">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
                    </div>
                  )}
                </div>
                
                {!isCameraOpen && !capturedPhoto && (
                  <button type="button" onClick={startCamera} className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-1">
                    <Camera size={14} /> Open Camera
                  </button>
                )}
                
                {isCameraOpen && (
                  <button type="button" onClick={takePhoto} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1">
                    <Check size={14} /> Capture
                  </button>
                )}
                
                {capturedPhoto && !isCameraOpen && (
                  <button type="button" onClick={startCamera} className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-1">
                    <RefreshCw size={14} /> Retake Photo
                  </button>
                )}
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                <input 
                  type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                <input 
                  type="tel" placeholder="Mobile Number (09...)" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                <input 
                  type="email" placeholder="Email Address (Optional)" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none"
                />
              </div>
            </>
          )}
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
            <input 
              type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black placeholder:text-slate-500 focus:border-orange-600 outline-none"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {!isLogin && (role === 'DRIVER' || role === 'OWNER') && (
            <div className="pt-4 border-t space-y-4 animate-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black uppercase text-black tracking-widest ml-1">Registration Details</p>
              
              {role === 'DRIVER' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setVehicleType('CAR')} className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase ${vehicleType === 'CAR' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-slate-50 text-black'}`}>4-Wheels</button>
                  <button type="button" onClick={() => setVehicleType('HABAL')} className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase ${vehicleType === 'HABAL' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-slate-50 text-black'}`}>Habal-Habal</button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  <button type="button" onClick={() => setOwnerType('RENTAL')} className={`py-3 px-1 rounded-xl border-2 text-[8px] font-black uppercase ${ownerType === 'RENTAL' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-slate-50 text-black'}`}>Car Rental</button>
                  <button type="button" onClick={() => setOwnerType('STAY')} className={`py-3 px-1 rounded-xl border-2 text-[8px] font-black uppercase ${ownerType === 'STAY' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-slate-50 text-black'}`}>Stays Host</button>
                  <button type="button" onClick={() => setOwnerType('E_SERBISYO')} className={`py-3 px-1 rounded-xl border-2 text-[8px] font-black uppercase ${ownerType === 'E_SERBISYO' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-slate-50 text-black'}`}>E-Serbisyo</button>
                </div>
              )}

              {ownerType === 'E_SERBISYO' && role === 'OWNER' ? (
                <select 
                  value={eSerbisyoCategory} 
                  onChange={e => setESerbisyoCategory(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black focus:border-orange-600 outline-none text-xs"
                >
                  {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : (
                <input 
                  type="text" placeholder={role === 'DRIVER' ? "Vehicle Model" : "Asset Name (e.g. My Condo)"} value={vehicleModel} onChange={e => setVehicleModel(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black focus:border-orange-600 outline-none"
                />
              )}
              
              <input 
                type="text" placeholder={ownerType === 'E_SERBISYO' ? "Certification ID (Optional)" : "Plate No. / Registration ID"} value={plateNumber} onChange={e => setPlateNumber(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-black focus:border-orange-600 outline-none"
              />
            </div>
          )}

          {error && <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={20} />
          </button>
        </form>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 text-center text-black text-[10px] font-black uppercase tracking-widest px-8">
        Sa pag-sign up, sumasang-ayon ka sa aming Terms of Service at Privacy Policy.
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
