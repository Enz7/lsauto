
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Автомобиль, Тренд } from '../types';
import { МOCK_CARS } from '../data/mockData';
import { carService, requestService, favoriteService, dealService, postService, authService } from '../services/apiService';

const isDev = (import.meta as any).env?.DEV ?? false;

interface User { id: string; name: string; email: string; role: string; is_verified: boolean; level: number; city?: string; description?: string; phone?: string; }
interface Deal { id: string; carName: string; status: 'выкуплено' | 'таможня' | 'в пути' | 'выдано'; date: string; }
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
  deals: Deal[];
  userRequests: UserRequest[];
  appNotifications: AppNotification[];
  systemUsers: User[];
  currentUser: User | null;
  isVerified: boolean;
  isLoggedIn: boolean;
  userRole: string | null;
  activeChatId: string | null;
  setAddedCars: React.Dispatch<React.SetStateAction<Автомобиль[]>>;
  setCurrentUser: (user: User | null) => void;
  addCar: (car: Partial<Автомобиль>) => Promise<void>;
  approveCar: (id: string) => void;
  rejectCar: (id: string) => void;
  deleteRequest: (id: string) => void;
  createDeal: (carName: string) => void;
  verifyUser: (userId: string, status: boolean) => void;
  setVerified: (val: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearFavorites: () => void;
  clearCompare: () => void;
  addPost: (post: Partial<Post>) => void;
  updatePost: (id: number, data: Partial<Post>) => void;
  deletePost: (id: number) => void;
  likePost: (id: number) => void;
  updateCar: (id: string, data: Partial<Автомобиль>) => void;
  addReview: (review: Partial<Review>) => void;
  submitRequest: (data: any) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  markNotificationsRead: () => void;
  login: (role: string, data?: any) => void;
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
  const [posts, setPosts] = useState<Post[]>(() => safeGet('lsauto_posts', '[]'));
  const [reviews, setReviews] = useState<Review[]>(() => safeGet('lsauto_reviews'));
  const [deals, setDeals] = useState<Deal[]>(() => safeGet('lsauto_deals', '[]'));
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('lsauto_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [trends, setTrends] = useState<Тренд[]>([
    { марка: 'Geely', модель: 'Monjaro', количествоЗапросов: 452, динамика: 'рост' },
    { марка: 'Zeekr', модель: '001', количествоЗапросов: 385, динамика: 'рост' },
  ]);
  const [chats, setChats] = useState<Chat[]>([
    { id: 's1', name: 'China Auto Export', lastMsg: '', time: '', online: true, history: [] },
  ]);

  useEffect(() => {
    localStorage.setItem('lsauto_favs', JSON.stringify(favorites));
    localStorage.setItem('lsauto_compare', JSON.stringify(compareList));
    localStorage.setItem('lsauto_added_cars', JSON.stringify(addedCars));
    localStorage.setItem('lsauto_requests', JSON.stringify(userRequests));
    localStorage.setItem('lsauto_notifs', JSON.stringify(appNotifications));
    localStorage.setItem('lsauto_posts', JSON.stringify(posts));
    localStorage.setItem('lsauto_reviews', JSON.stringify(reviews));
    localStorage.setItem('lsauto_deals', JSON.stringify(deals));
    localStorage.setItem('lsauto_verified', String(isVerified));
    if (currentUser) localStorage.setItem('lsauto_current_user', JSON.stringify(currentUser));
  }, [favorites, compareList, addedCars, userRequests, appNotifications, posts, reviews, deals, isVerified, currentUser]);

  useEffect(() => {
    if (!isLoggedIn) return;

    authService.me()
      .then(user => setCurrentUser({ id: String(user.id), name: user.name, email: user.email, role: user.role, is_verified: user.is_verified, level: user.level, city: user.city, description: user.description, phone: user.phone }))
      .catch(() => {});

    carService.getAll({ limit: 100 })
      .then(res => { if (res.data.length > 0) setAddedCars(res.data); })
      .catch(() => {});

    requestService.getAll({ limit: 100 })
      .then(res => {
        const reqs = Array.isArray(res) ? res : res.data;
        const mapped = reqs.map((r: any) => ({
          id: String(r.id), brand: r.brand, model: r.model,
          budget: Number(r.budget), comment: r.comment ?? '',
          date: new Date(r.created_at).toLocaleDateString('ru'),
          status: r.status, year: r.year_range, city: r.city,
        }));
        setUserRequests(mapped);
      })
      .catch(() => {});

    favoriteService.getAll()
      .then(carIds => { if (carIds.length > 0) setFavorites(carIds); })
      .catch(() => {});

    dealService.getAll({ limit: 100 })
      .then(res => {
        const dbDeals = Array.isArray(res) ? res : res.data;
        const mapped = dbDeals.map((d: any) => ({
          id: String(d.id), carName: d.car_name,
          status: d.status as Deal['status'],
          date: new Date(d.created_at).toLocaleDateString('ru'),
        }));
        if (mapped.length > 0) setDeals(mapped);
      })
      .catch(() => {});

    postService.getAll({ limit: 50 })
      .then(res => {
        const dbPosts = Array.isArray(res) ? res : res.data;
        const mapped = dbPosts.map((p: any) => ({
          id: p.id, supplierId: String(p.supplier_id), supplierName: p.supplier_name,
          type: p.type, title: p.title, text: p.text, image: p.image ?? '',
          likes: p.likes, comments: 0, date: new Date(p.created_at).toLocaleDateString('ru'),
        }));
        if (mapped.length > 0) setPosts(mapped);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setAppNotifications(prev => [{ id, text: message, time: 'Только что', read: false }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const verifyUser = (id: string, status: boolean) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: status } : u));
    notify('Статус верификации обновлен', 'success');
  };

  const createDeal = (carName: string) => {
    const newDeal: Deal = { id: `ord-${Math.floor(Math.random() * 10000)}`, carName, status: 'выкуплено', date: new Date().toLocaleDateString() };
    setDeals(prev => [newDeal, ...prev]);
    dealService.create(carName).catch(() => {});
    notify('Авто забронировано!', 'success');
  };

  const addCar = async (carData: Partial<Автомобиль>) => {
    const newCar = { ...carData, id: `car-${Date.now()}`, status: 'approved' } as any;
    setAddedCars(prev => [newCar, ...prev]);
    carService.create(carData).catch(() => {});
  };

  const approveCar = (id: string) => {
    setAddedCars(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } as any : c));
    notify('Объявление одобрено', 'success');
  };

  const rejectCar = (id: string) => {
    setAddedCars(prev => prev.filter(c => c.id !== id));
    notify('Объявление отклонено', 'info');
  };

  const deleteRequest = (id: string) => {
    setUserRequests(prev => prev.filter(r => r.id !== id));
    notify('Запрос удален', 'info');
  };

  const likePost = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    postService.like(id).catch(() => {});
    notify('Лайк сохранен', 'success');
  };

  const updatePost = (id: number, data: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    postService.delete(id).catch(() => {});
  };

  const updateCar = (id: string, data: Partial<Автомобиль>) => {
    setAddedCars(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const addPost = (postData: Partial<Post>) => {
    const newPost = { ...postData, id: Date.now(), likes: 0, comments: 0, date: 'Только что' } as Post;
    setPosts(prev => [newPost, ...prev]);
    postService.create({ supplierName: postData.supplierName, type: postData.type, title: postData.title!, text: postData.text!, image: postData.image }).catch(() => {});
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
      if (exists) return prev.map(t => t.марка === data.brand && t.модель === data.model ? { ...t, количествоЗапросов: t.количествоЗапросов + 1 } : t);
      return [...prev, { марка: data.brand, модель: data.model, количествоЗапросов: 1, динамика: 'рост' }];
    });
    requestService.create(data).catch(() => {});
    notify('Заявка принята!', 'success');
  };

  const sendMessage = (chatId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, lastMsg: text, time: 'Только что', history: [...c.history, { sender: 'Вы', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isOwn: true }] };
      }
      return c;
    }));
  };

  const login = (role: string, data?: any) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('lsauto_auth', 'true');
    localStorage.setItem('lsauto_role', role);
    if (data) {
      const user: User = { id: String(data.id ?? ''), name: data.name ?? '', email: data.email ?? '', role, is_verified: data.is_verified ?? false, level: data.level ?? 1 };
      setCurrentUser(user);
    }
    notify(`Добро пожаловать!`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('lsauto_auth');
    localStorage.removeItem('lsauto_role');
    localStorage.removeItem('lsauto_current_user');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    window.location.href = '/';
  };

  const allCars = isDev
    ? [...(addedCars || []), ...(МOCK_CARS || [])]
    : [...(addedCars || [])];

  return (
    <AppContext.Provider value={{
      favorites, compareList, addedCars, allCars, trends, chats, posts, reviews, deals, userRequests, appNotifications, systemUsers, currentUser, isVerified, isLoggedIn, userRole, activeChatId,
      setAddedCars, setCurrentUser, addCar, updateCar, approveCar, rejectCar, deleteRequest, createDeal, verifyUser, addPost, updatePost, deletePost, likePost, addReview,
      setVerified: (v) => setIsVerified(v), setActiveChatId,
      toggleFavorite: (id) => {
        const prev = favorites;
        const isAdding = !prev.includes(id);
        setFavorites(isAdding ? [...prev, id] : prev.filter(f => f !== id));
        const apiCall = isAdding ? favoriteService.add(id) : favoriteService.remove(id);
        apiCall.catch(() => setFavorites(prev));
      },
      toggleCompare: (id) => setCompareList(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]),
      clearFavorites: () => setFavorites([]),
      clearCompare: () => setCompareList([]),
      submitRequest, sendMessage,
      markNotificationsRead: () => setAppNotifications(prev => (prev || []).map(n => ({ ...n, read: true }))),
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
