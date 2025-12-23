
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ride, RideStatus, UserProfile, DriverProfile, Role, ServiceType, AccountStatus, DriverDocuments, PaymentMethodType } from './types';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: UserProfile | DriverProfile | null;
  users: UserProfile[];
  drivers: DriverProfile[];
  rides: Ride[];
  login: (identifier: string, role: Role) => boolean;
  signup: (data: any) => void;
  logout: () => void;
  addRide: (ride: Omit<Ride, 'id' | 'timestamp' | 'status'>) => void;
  updateRideStatus: (rideId: string, status: RideStatus, driverId?: string) => void;
  updateAccountStatus: (id: string, role: Role, status: AccountStatus) => void;
  deleteAccount: (id: string, role: Role) => void;
  updateDriverProfile: (id: string, updates: Partial<DriverProfile>) => void;
  transferBalance: (senderId: string, receiverId: string, amount: number) => boolean;
  topUpBalance: (id: string, role: Role, amount: number) => void;
  addTip: (rideId: string, amount: number) => boolean;
  onlineDrivers: (DriverProfile & { x: number; y: number })[];
  totalCommissions: number;
  // Test Mode helpers
  quickSwitch: (role: Role) => void;
  resetSystem: () => void;
  spawnDrivers: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Juan Dela Cruz',
    email: 'user@test.ph',
    phone: '09123456789',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    rating: 4.8,
    balance: 1500.50,
    status: 'APPROVED',
    joinDate: Date.now() - 100000000,
  }
];

const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'd1',
    name: 'Ricardo Dalisay',
    email: 'driver@test.ph',
    phone: '09998887777',
    avatar: 'https://i.pravatar.cc/150?u=d1',
    rating: 4.9,
    balance: 850.00,
    vehicleModel: 'Honda Click 125i',
    plateNumber: 'ABC 1234',
    isOnline: true,
    totalEarnings: 12500.00,
    vehicleType: 'HABAL',
    status: 'APPROVED',
    joinDate: Date.now() - 300000000,
  },
  {
    id: 'pro1',
    name: 'Master Ben',
    email: 'ben@pro.ph',
    phone: '09112223333',
    avatar: 'https://i.pravatar.cc/150?u=pro1',
    rating: 4.95,
    balance: 2000,
    vehicleModel: 'Professional Tools',
    plateNumber: 'PRC-12345',
    isOnline: true,
    totalEarnings: 45000,
    vehicleType: 'E_SERBISYO',
    eSerbisyoCategory: 'Electricians',
    serviceRate: 450,
    status: 'APPROVED',
    joinDate: Date.now() - 500000000,
  },
  {
    id: 'pro2',
    name: 'Nanay Rosa',
    email: 'rosa@clean.ph',
    phone: '09445556666',
    avatar: 'https://i.pravatar.cc/150?u=pro2',
    rating: 4.88,
    balance: 1500,
    vehicleModel: 'Cleaning Supplies',
    plateNumber: 'CLEAN-01',
    isOnline: true,
    totalEarnings: 22000,
    vehicleType: 'E_SERBISYO',
    eSerbisyoCategory: 'Home Cleaners',
    serviceRate: 350,
    status: 'APPROVED',
    joinDate: Date.now() - 400000000,
  },
  {
    id: 'pro3',
    name: 'Ate Linda',
    email: 'linda@nails.ph',
    phone: '09778889999',
    avatar: 'https://i.pravatar.cc/150?u=pro3',
    rating: 4.92,
    balance: 1000,
    vehicleModel: 'Nail Art Kit',
    plateNumber: 'NAILS-01',
    isOnline: true,
    totalEarnings: 15000,
    vehicleType: 'E_SERBISYO',
    eSerbisyoCategory: 'Manicurist',
    serviceRate: 200,
    status: 'APPROVED',
    joinDate: Date.now() - 350000000,
  },
  {
    id: 'pro4',
    name: 'Teacher Clara',
    email: 'clara@tutor.ph',
    phone: '09887776666',
    avatar: 'https://i.pravatar.cc/150?u=pro4',
    rating: 5.0,
    balance: 3000,
    vehicleModel: 'Educational Kits',
    plateNumber: 'TUTOR-01',
    isOnline: true,
    totalEarnings: 30000,
    vehicleType: 'E_SERBISYO',
    eSerbisyoCategory: 'Tutors',
    serviceRate: 500,
    status: 'APPROVED',
    joinDate: Date.now() - 600000000,
  },
  {
    id: 'pro5',
    name: 'Chef Gardo',
    email: 'gardo@cooks.ph',
    phone: '09121212121',
    avatar: 'https://i.pravatar.cc/150?u=pro5',
    rating: 4.85,
    balance: 5000,
    vehicleModel: 'Mobile Kitchen',
    plateNumber: 'CATER-01',
    isOnline: true,
    totalEarnings: 150000,
    vehicleType: 'E_SERBISYO',
    eSerbisyoCategory: 'Catering Services',
    serviceRate: 2500,
    status: 'APPROVED',
    joinDate: Date.now() - 800000000,
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('USER');
  const [currentUser, setCurrentUser] = useState<UserProfile | DriverProfile | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [drivers, setDrivers] = useState<DriverProfile[]>(INITIAL_DRIVERS);
  const [totalCommissions, setTotalCommissions] = useState(15420.50);

  const [driverPositions, setDriverPositions] = useState<{ [id: string]: { x: number, y: number } }>({
    'd1': { x: 124.64, y: 8.47 },
    'pro1': { x: 124.65, y: 8.48 },
    'pro2': { x: 124.63, y: 8.46 },
    'pro3': { x: 124.66, y: 8.49 },
    'pro4': { x: 124.67, y: 8.50 },
    'pro5': { x: 124.68, y: 8.51 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (!next[id]) return;
          const activeRide = rides.find(r => r.driverId === id && [RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS].includes(r.status));
          if (activeRide && activeRide.originCoords && activeRide.destinationCoords) {
            const target = activeRide.status === RideStatus.IN_PROGRESS ? activeRide.destinationCoords : activeRide.originCoords;
            const step = 0.0002;
            const dx = target[1] - next[id].x;
            const dy = target[0] - next[id].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > step) {
              next[id] = { x: next[id].x + (dx / dist) * step, y: next[id].y + (dy / dist) * step };
            }
          } else {
            next[id] = { x: next[id].x + (Math.random() - 0.5) * 0.0001, y: next[id].y + (Math.random() - 0.5) * 0.0001 };
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rides]);

  const login = (identifier: string, loginRole: Role) => {
    if (loginRole === 'ADMIN') {
      if (identifier === 'admin@test.ph' || identifier === 'admin') {
        setCurrentUser({ id: 'admin', name: 'System Admin', email: 'admin@test.ph', avatar: 'https://ui-avatars.com/api/?name=Admin&background=ea580c&color=fff', balance: 0, rating: 5, status: 'APPROVED', joinDate: Date.now(), phone: '' });
        setRole('ADMIN');
        return true;
      }
      return false;
    }
    const list = (loginRole === 'DRIVER' || loginRole === 'OWNER') ? drivers : users;
    const found = list.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier);
    if (found) {
      setCurrentUser(found);
      setRole(loginRole);
      return true;
    }
    return false;
  };

  const quickSwitch = (targetRole: Role) => {
    if (targetRole === 'ADMIN') login('admin', 'ADMIN');
    else if (targetRole === 'USER') login('user@test.ph', 'USER');
    else if (targetRole === 'DRIVER') login('driver@test.ph', 'DRIVER');
  };

  const resetSystem = () => {
    setRides([]);
    setUsers(INITIAL_USERS);
    setDrivers(INITIAL_DRIVERS);
    setTotalCommissions(15420.50);
    setDriverPositions({ 'd1': { x: 124.64, y: 8.47 }, 'pro1': { x: 124.65, y: 8.48 }, 'pro2': { x: 124.63, y: 8.46 }, 'pro3': { x: 124.66, y: 8.49 }, 'pro4': { x: 124.67, y: 8.50 }, 'pro5': { x: 124.68, y: 8.51 } });
    if (currentUser) {
       const fresh = (role === 'USER' ? INITIAL_USERS : INITIAL_DRIVERS).find(u => u.id === currentUser.id);
       if (fresh) setCurrentUser(fresh);
    }
  };

  const spawnDrivers = (count: number) => {
    const newDrivers: DriverProfile[] = [];
    const newPositions: { [id: string]: { x: number, y: number } } = {};
    
    for (let i = 0; i < count; i++) {
      const id = `mock-d-${Math.random().toString(36).substr(2, 5)}`;
      newDrivers.push({
        id,
        name: `Driver ${i + 1}`,
        email: `driver${i}@sakay.ph`,
        phone: `09${Math.floor(Math.random() * 900000000 + 100000000)}`,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        rating: 4.5 + Math.random() * 0.5,
        balance: 500,
        vehicleModel: 'Mock Sedan',
        plateNumber: `ABC ${Math.floor(Math.random() * 9000 + 1000)}`,
        isOnline: true,
        totalEarnings: 0,
        vehicleType: 'CAR',
        status: 'APPROVED',
        joinDate: Date.now(),
      });
      newPositions[id] = { 
        x: 124.64 + (Math.random() - 0.5) * 0.02, 
        y: 8.47 + (Math.random() - 0.5) * 0.02 
      };
    }
    
    setDrivers(prev => [...prev, ...newDrivers]);
    setDriverPositions(prev => ({ ...prev, ...newPositions }));
  };

  const signup = (data: any) => {
    const id = `u-${Math.random().toString(36).substr(2, 5)}`;
    if (data.role === 'USER') {
      const newUser: UserProfile = { id, name: data.name, email: data.email, phone: data.phone, avatar: data.photo || `https://i.pravatar.cc/150?u=${id}`, rating: 5.0, balance: 0, status: 'APPROVED', joinDate: Date.now() };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setRole('USER');
    } else {
      const newDriver: DriverProfile = { id, name: data.name, email: data.email, phone: data.phone, avatar: data.photo || `https://i.pravatar.cc/150?u=${id}`, rating: 0, balance: 0, status: 'PENDING', joinDate: Date.now(), vehicleModel: data.vehicleModel || 'TBD', plateNumber: data.plateNumber || 'TBD', isOnline: false, totalEarnings: 0, vehicleType: data.vehicleType || 'CAR' };
      setDrivers(prev => [...prev, newDriver]);
      setCurrentUser(newDriver);
      setRole(data.role);
    }
  };

  const logout = () => setCurrentUser(null);

  const addRide = (newRide: Omit<Ride, 'id' | 'timestamp' | 'status'>) => {
    const originCoords: [number, number] = newRide.originCoords || [8.47 + (Math.random() - 0.5) * 0.04, 124.64 + (Math.random() - 0.5) * 0.04];
    const destinationCoords: [number, number] = newRide.destinationCoords || [8.47 + (Math.random() - 0.5) * 0.04, 124.64 + (Math.random() - 0.5) * 0.04];
    const ride: Ride = { ...newRide, id: `ride-${Math.random().toString(36).substr(2, 9)}`, timestamp: Date.now(), status: RideStatus.PENDING, originCoords, destinationCoords };
    setRides(prev => [ride, ...prev]);
  };

  const updateRideStatus = (rideId: string, status: RideStatus, driverId?: string) => {
    setRides(prev => {
      const ride = prev.find(r => r.id === rideId);
      if (!ride) return prev;
      
      return prev.map(r => {
        if (r.id === rideId) {
          const currentDriverId = driverId || r.driverId;
          if (status === RideStatus.COMPLETED && currentDriverId) {
            const commission = r.fare * 0.10;
            
            // If GCash, deduct from User Balance
            if (r.paymentMethod === 'GCASH') {
              setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === r.userId) return { ...u, balance: Math.max(0, u.balance - r.fare) };
                return u;
              }));
            }

            setDrivers(prevDrivers => prevDrivers.map(d => {
              if (d.id === currentDriverId) {
                return { ...d, balance: d.balance - commission, totalEarnings: d.totalEarnings + r.fare };
              }
              return d;
            }));
            setTotalCommissions(prevTotal => prevTotal + commission);
          }
          const drv = drivers.find(d => d.id === currentDriverId);
          return { ...r, status, driverId: currentDriverId, driverName: drv ? drv.name : r.driverName };
        }
        return r;
      });
    });
  };

  const updateAccountStatus = (id: string, accountRole: Role, status: AccountStatus) => {
    if (accountRole === 'DRIVER' || accountRole === 'OWNER') setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    else setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const updateDriverProfile = (id: string, updates: Partial<DriverProfile>) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const deleteAccount = (id: string, accountRole: Role) => {
    if (accountRole === 'DRIVER' || accountRole === 'OWNER') setDrivers(prev => prev.filter(d => d.id !== id));
    else setUsers(prev => prev.filter(u => u.id !== id));
  };

  const transferBalance = (senderId: string, receiverId: string, amount: number) => {
    let success = false;
    setDrivers(prev => {
      const sender = prev.find(d => d.id === senderId);
      const receiver = prev.find(d => d.id === receiverId);
      if (sender && receiver && sender.balance >= amount) {
        success = true;
        return prev.map(d => {
          if (d.id === senderId) return { ...d, balance: d.balance - amount };
          if (d.id === receiverId) return { ...d, balance: d.balance + amount };
          return d;
        });
      }
      return prev;
    });
    return success;
  };

  const topUpBalance = (id: string, targetRole: Role, amount: number) => {
    if (targetRole === 'USER') setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: u.balance + amount } : u));
    else setDrivers(prev => prev.map(d => d.id === id ? { ...d, balance: d.balance + amount } : d));
    
    // Update current user if it's the one topped up
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
    }
  };

  const addTip = (rideId: string, amount: number) => {
    const ride = rides.find(r => r.id === rideId);
    if (!ride || !ride.driverId || amount <= 0) return false;
    const user = users.find(u => u.id === ride.userId);
    if (!user || user.balance < amount) return false;
    setUsers(prev => prev.map(u => u.id === ride.userId ? { ...u, balance: u.balance - amount } : u));
    setDrivers(prev => prev.map(d => d.id === ride.driverId ? { ...d, balance: d.balance + amount, totalEarnings: d.totalEarnings + amount } : d));
    setRides(prev => prev.map(r => r.id === rideId ? { ...r, tip: (r.tip || 0) + amount } : r));
    return true;
  };

  const onlineDrivers = drivers
    .filter(d => d.isOnline && d.status === 'APPROVED')
    .map(d => ({ ...d, ...driverPositions[d.id] || { x: 124.64, y: 8.47 } }));

  return (
    <AppContext.Provider value={{ role, setRole, currentUser, users, drivers, rides, login, signup, logout, addRide, updateRideStatus, updateAccountStatus, deleteAccount, updateDriverProfile, transferBalance, topUpBalance, addTip, onlineDrivers, totalCommissions, quickSwitch, resetSystem, spawnDrivers }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
