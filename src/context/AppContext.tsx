
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Автомобиль, Тренд } from '../types';
import { МOCK_CARS } from '../data/mockData';

interface UserRequest { id: string; brand: string; model: string; budget: number; comment: string; date: string; status: string; }
interface AppNotification { id: string; text: string; time: string; read: boolean; }
interface Message { sender: string; text: string; time: string; isOwn: boolean; }
interface Chat { id: string; name: string; lastMsg: string; time: string; online: boolean; history: Message[]; }
interface Post { id: number; supplierId: string; supplierName: string; type: string; title: string; text: string; image: string; likes: number; comments: number; date: string; }
interface Review { id: string; supplierId: string; user: string; text: string; rating: number; date: string; }

interface AppContextType {
  favorites: string[];
  compareList: string[];
  addedCars: Автомобиль[];
  allCars: Автомобиль[];
  trends: Тренд[];
  chats: Chat[];
  posts: Post[];
  reviews: Review[];
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
  addPost: (post: Partial<Post>) => void;
  addReview: (review: Partial<Review>) => void;
  submitRequest: (data: any) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  markNotificationsRead: () => void;
  login: (role: string) => void;
  logout: () => void;
  notify: (message: string, type?: 'success' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const safeGet = (key: string, fallback: string = '[]') => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : JSON.parse(fallback);
  } catch (e) { return JSON.parse(fallback); }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => safeGet('lsauto_favs'));
  const [compareList, setCompareList] = useState<string[]>(() => safeGet('lsauto_compare'));
  const [addedCars, setAddedCars] = useState<Автомобиль[]>(() => safeGet('lsauto_added_cars'));
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem('lsauto_verified') === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('lsauto_auth') === 'true');
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('lsauto_role'));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(() => safeGet('lsauto_requests'));
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(() => safeGet('lsauto_notifs'));
  const [posts, setPosts] = useState<Post[]>(() => safeGet('lsauto_posts', JSON.stringify([
    { id: 1, supplierId: 's1', supplierName: 'China Auto Export', type: 'pickup', title: 'Выдача Zeekr 001', text: 'Доставили за 18 дней в Казань.', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', likes: 42, comments: 5, date: '2 часа назад' },
  ])));
  const [reviews, setReviews] = useState<Review[]>(() => safeGet('lsauto_reviews'));

  const [trends, setTrends] = useState<Тренд[]>([
    { марка: 'Geely', модель: 'Monjaro', количествоЗапросов: 452, динамика: 'рост' },
    { марка: 'Zeekr', модель: '001', количествоЗапросов: 385, динамика: 'рост' },
    { марка: 'BMW', модель: 'X5', количествоЗапросов: 312, динамика: 'падение' },
  ]);

  const [chats, setChats] = useState<Chat[]>([
    { id: 's1', name: 'China Auto Export', lastMsg: 'Ожидаем поставку', time: '12:00', online: true, history: [] },
    { id: 'u1', name: 'Клиент Александр', lastMsg: 'Нужен подбор', time: '10:00', online: true, history: [] },
  ]);

  useEffect(() => {
    localStorage.setItem('lsauto_favs', JSON.stringify(favorites));
    localStorage.setItem('lsauto_compare', JSON.stringify(compareList));
    localStorage.setItem('lsauto_added_cars', JSON.stringify(addedCars));
    localStorage.setItem('lsauto_requests', JSON.stringify(userRequests));
    localStorage.setItem('lsauto_notifs', JSON.stringify(appNotifications));
    localStorage.setItem('lsauto_posts', JSON.stringify(posts));
    localStorage.setItem('lsauto_reviews', JSON.stringify(reviews));
    localStorage.setItem('lsauto_verified', String(isVerified));
  }, [favorites, compareList, addedCars, userRequests, appNotifications, posts, reviews, isVerified]);

  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setAppNotifications(prev => [{ id, text: message, time: 'Только что', read: false }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
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

  const addPost = (postData: Partial<Post>) => {
    const newPost = { ...postData, id: Date.now(), likes: 0, comments: 0, date: 'Только что' } as Post;
    setPosts(prev => [newPost, ...prev]);
  };

  const addReview = (rev: Partial<Review>) => {
    const newRev = { ...rev, id: Date.now().toString(), date: 'Сегодня' } as Review;
    setReviews(prev => [newRev, ...prev]);
    notify('Отзыв опубликован!', 'success');
  };

  const submitRequest = async (data: any) => {
    const newReq = { ...data, id: Date.now().toString(), date: 'Сегодня', status: 'new' };
    setUserRequests(prev => [newReq, ...prev]);
    setTrends(prev => {
      const exists = prev.find(t => t.марка === data.brand && t.модель === data.model);
      if (exists) return prev.map(t => t.марка === data.brand && t.модель === data.model ? {...t, количествоЗапросов: t.количествоЗапросов + 1} : t);
      return [...prev, { марка: data.brand, модель: data.model, количествоЗапросов: 1, динамика: 'рост' }];
    });
    notify('Заявка принята!', 'success');
  };

  const sendMessage = (chatId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c, lastMsg: text, time: 'Только что',
          history: [...c.history, { sender: 'Вы', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isOwn: true }]
        };
      }
      return c;
    }));
  };

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('lsauto_auth', 'true');
    localStorage.setItem('lsauto_role', role);
    notify(`Добро пожаловать, ${role}`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('lsauto_auth');
    localStorage.removeItem('lsauto_role');
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = '/';
  };

  const allCars = [...addedCars, ...МOCK_CARS];

  return (
    <AppContext.Provider value={{ 
      favorites, compareList, addedCars, allCars, trends, chats, posts, reviews, userRequests, appNotifications, isVerified, isLoggedIn, userRole, activeChatId,
      setAddedCars, addCar, approveCar, rejectCar, addPost, addReview,
      setVerified: (v) => setIsVerified(v), setActiveChatId, 
      toggleFavorite: (id) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]), 
      toggleCompare: (id) => setCompareList(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]),
      submitRequest, sendMessage,
      markNotificationsRead: () => setAppNotifications(prev => prev.map(n => ({ ...n, read: true }))),
      login, logout, notify 
    }}>
      {children}
      <div className="fixed bottom-24 right-8 z-[200] space-y-3 pointer-events-none text-right">
        {notifications.map(n => (
          <div key={n.id} className={`inline-flex px-6 py-4 rounded-2xl shadow-2xl border items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto ${
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
