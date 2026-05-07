
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Автомобиль, Тренд } from '../types';
import { МOCK_CARS } from '../data/mockData';

interface UserRequest { id: string; brand: string; model: string; budget: number; comment: string; date: string; status: string; }
interface AppNotification { id: string; text: string; time: string; read: boolean; }
interface Message { sender: string; text: string; time: string; isOwn: boolean; }
interface Chat { id: string; name: string; lastMsg: string; time: string; online: boolean; history: Message[]; }
interface Post { id: number; supplier: string; type: string; title: string; text: string; image: string; likes: number; comments: number; date: string; }

interface AppContextType {
  favorites: string[];
  compareList: string[];
  addedCars: Автомобиль[];
  allCars: Автомобиль[];
  trends: Тренд[];
  chats: Chat[];
  posts: Post[];
  userRequests: UserRequest[];
  appNotifications: AppNotification[];
  isVerified: boolean;
  isLoggedIn: boolean;
  userRole: string | null;
  activeChatId: string | null;
  setAddedCars: React.Dispatch<React.SetStateAction<Автомобиль[]>>;
  addCar: (car: Partial<Автомобиль>) => Promise<void>;
  approveCar: (id: string) => void;
  rejectCar: (id: string) => void;
  setVerified: (val: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  addPost: (post: Post) => void;
  submitRequest: (data: any) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  markNotificationsRead: () => void;
  login: (role: string, credentials?: any) => Promise<void>;
  logout: () => void;
  notify: (message: string, type?: 'success' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('lsauto_favs') || '[]'));
  const [compareList, setCompareList] = useState<string[]>(() => JSON.parse(localStorage.getItem('lsauto_compare') || '[]'));
  const [addedCars, setAddedCars] = useState<Автомобиль[]>(() => JSON.parse(localStorage.getItem('lsauto_added_cars') || '[]'));
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem('lsauto_verified') === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('lsauto_auth') === 'true');
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('lsauto_role'));
  const [activeChatIdState, setActiveChatIdState] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [userRequests, setUserRequests] = useState<UserRequest[]>(() => JSON.parse(localStorage.getItem('lsauto_requests') || '[]'));
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(() => JSON.parse(localStorage.getItem('lsauto_app_notifs') || '[]'));

  const [trends, setTrends] = useState<Тренд[]>(() => JSON.parse(localStorage.getItem('lsauto_trends') || '[]'));
  const [chats, setChats] = useState<Chat[]>(() => JSON.parse(localStorage.getItem('lsauto_chats') || '[]'));
  const [posts, setPosts] = useState<Post[]>(() => JSON.parse(localStorage.getItem('lsauto_posts') || '[]'));

  useEffect(() => {
    localStorage.setItem('lsauto_favs', JSON.stringify(favorites));
    localStorage.setItem('lsauto_compare', JSON.stringify(compareList));
    localStorage.setItem('lsauto_added_cars', JSON.stringify(addedCars));
    localStorage.setItem('lsauto_requests', JSON.stringify(userRequests));
    localStorage.setItem('lsauto_app_notifs', JSON.stringify(appNotifications));
  }, [favorites, compareList, addedCars, userRequests, appNotifications]);

  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    const newNotif = { id: id.toString(), text: message, time: 'Только что', read: false };
    setAppNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const submitRequest = async (data: any) => {
    const newReq = { ...data, id: Date.now().toString(), date: 'Сегодня', status: 'new' };
    setUserRequests(prev => [newReq, ...prev]);
    
    // Update trends logic
    setTrends(prev => {
      const exists = prev.find(t => t.марка === data.brand && t.модель === data.model);
      if (exists) return prev.map(t => t.марка === data.brand && t.модель === data.model ? {...t, количествоЗапросов: t.количествоЗапросов + 1} : t);
      return [...prev, { марка: data.brand, модель: data.model, количествоЗапросов: 1, динамика: 'рост' }];
    });
  };

  const addCar = async (carData: Partial<Автомобиль>) => {
    const newCar = { ...carData, id: `car-${Date.now()}`, status: 'pending' } as any;
    setAddedCars(prev => [newCar, ...prev]);
    notify('Отправлено на модерацию', 'info');
  };

  const approveCar = (id: string) => {
    setAddedCars(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } as any : c));
    notify('Объявление одобрено', 'success');
  };

  const rejectCar = (id: string) => {
    setAddedCars(prev => prev.filter(c => c.id !== id));
    notify('Объявление отклонено', 'info');
  };

  const login = async (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('lsauto_auth', 'true');
    localStorage.setItem('lsauto_role', role);
    notify(`С возвращением, ${role}!`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('lsauto_auth');
    localStorage.removeItem('lsauto_role');
    setIsLoggedIn(false);
    setUserRole(null);
    notify('Вы вышли из системы', 'info');
  };

  const markNotificationsRead = () => {
    setAppNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const allCars = [...addedCars, ...МOCK_CARS];

  return (
    <AppContext.Provider value={{ 
      favorites, compareList, addedCars, allCars, trends, chats, posts, userRequests, appNotifications, isVerified, isLoggedIn, userRole, activeChatId: activeChatIdState,
      setAddedCars, addCar, approveCar, rejectCar, addPost: (p) => setPosts(prev => [p, ...prev]),
      setVerified: (v) => { setIsVerified(v); localStorage.setItem('lsauto_verified', 'true'); },
      setActiveChatId: setActiveChatIdState, toggleFavorite: (id) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]), 
      toggleCompare: (id) => setCompareList(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]),
      submitRequest, sendMessage: (id, text) => notify('Сообщение отправлено', 'success'),
      markNotificationsRead, login, logout, notify 
    }}>
      {children}
      <div className="fixed bottom-24 right-8 z-[200] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto ${
            n.type === 'success' ? 'bg-green-500 border-green-400 text-white' : 'bg-primary border-primary-hover text-black font-bold'
          }`}>
            {n.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
