import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Car, Deal, UserRequest, Post, AppNotification, User, Trend, Pagination } from '@/types';
import { carService, requestService, favoriteService, dealService, postService, authService } from '../services/apiService';

interface Review { id: string; supplierId: string; user: string; text: string; rating: number; date: string; }
interface ChatMessage { sender: string; text: string; time: string; isOwn: boolean; }
interface Chat { id: string; name: string; lastMsg: string; time: string; online: boolean; history: ChatMessage[]; }

interface AppContextType {
  favorites: string[];
  compareList: string[];
  pendingCars: Car[];
  allCars: Car[];
  carsLoading: boolean;
  carsPagination: Pagination;
  trends: Trend[];
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
  setPendingCars: React.Dispatch<React.SetStateAction<Car[]>>;
  setCurrentUser: (user: User | null) => void;
  addCar: (car: Partial<Car>) => Promise<void>;
  approveCar: (id: string) => void;
  rejectCar: (id: string) => void;
  deleteRequest: (id: string) => void;
  createDeal: (carName: string) => Promise<void>;
  verifyUser: (userId: string, status: boolean) => void;
  setVerified: (val: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearFavorites: () => void;
  clearCompare: () => void;
  addPost: (post: Partial<Post>) => Promise<void>;
  updatePost: (id: number, data: Partial<Post>) => void;
  deletePost: (id: number) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  updateCar: (id: string, data: Partial<Car>) => void;
  addReview: (review: Partial<Review>) => void;
  submitRequest: (data: any) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  markNotificationsRead: () => void;
  login: (role: string, data?: any) => void;
  logout: () => Promise<void>;
  notify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const safeGet = <T,>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => safeGet('lsauto_favs', []));
  const [compareList, setCompareList] = useState<string[]>(() => safeGet('lsauto_compare', []));
  const [pendingCars, setPendingCars] = useState<Car[]>([]);
  const [apiCars, setApiCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [carsPagination, setCarsPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem('lsauto_verified') === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('lsauto_auth') === 'true');
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('lsauto_role'));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'info' | 'error' }>>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(() => safeGet('lsauto_requests', []));
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(() => safeGet('lsauto_notifs', []));
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>(() => safeGet('lsauto_reviews', []));
  const [deals, setDeals] = useState<Deal[]>(() => safeGet('lsauto_deals', []));
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('lsauto_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [trends, setTrends] = useState<Trend[]>([
    { brand: 'Geely', model: 'Monjaro', requestCount: 452, dynamics: 'рост' },
    { brand: 'Zeekr', model: '001', requestCount: 385, dynamics: 'рост' },
  ]);
  const [chats, setChats] = useState<Chat[]>([
    { id: 's1', name: 'China Auto Export', lastMsg: '', time: '', online: true, history: [] },
  ]);

  useEffect(() => {
    localStorage.setItem('lsauto_favs', JSON.stringify(favorites));
    localStorage.setItem('lsauto_compare', JSON.stringify(compareList));
    localStorage.setItem('lsauto_requests', JSON.stringify(userRequests));
    localStorage.setItem('lsauto_notifs', JSON.stringify(appNotifications));
    localStorage.setItem('lsauto_reviews', JSON.stringify(reviews));
    localStorage.setItem('lsauto_deals', JSON.stringify(deals));
    localStorage.setItem('lsauto_verified', String(isVerified));
    if (currentUser) localStorage.setItem('lsauto_current_user', JSON.stringify(currentUser));
  }, [favorites, compareList, userRequests, appNotifications, reviews, deals, isVerified, currentUser]);

  // Load cars from API on mount (independent of auth)
  useEffect(() => {
    setCarsLoading(true);
    carService.getAll({ limit: 20, page: 1 })
      .then(res => {
        setApiCars(res.data);
        setCarsPagination(res.pagination);
      })
      .catch(() => {})
      .finally(() => setCarsLoading(false));
  }, []);

  // Load posts on mount
  useEffect(() => {
    postService.getAll({ limit: 50 })
      .then(res => {
        const dbPosts = Array.isArray(res) ? res : res.data;
        setPosts(dbPosts.map((p: any) => ({
          id: p.id, supplierId: String(p.supplier_id), supplierName: p.supplier_name,
          type: p.type, title: p.title, text: p.text, image: p.image ?? '',
          likes: p.likes, date: new Date(p.created_at).toLocaleDateString('ru'),
        })));
      })
      .catch(() => {});
  }, []);

  // Load user-specific data when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    authService.me()
      .then(user => setCurrentUser({
        id: String(user.id), name: user.name, email: user.email,
        role: user.role, isVerified: user.is_verified, level: user.level,
        city: user.city, description: user.description, phone: user.phone,
      }))
      .catch(() => {});

    requestService.getAll({ limit: 100 })
      .then(res => {
        const reqs = Array.isArray(res) ? res : res.data;
        setUserRequests(reqs.map((r: any) => ({
          id: String(r.id), brand: r.brand, model: r.model,
          budget: Number(r.budget), comment: r.comment ?? '',
          date: new Date(r.created_at).toLocaleDateString('ru'),
          status: r.status, year: r.year_range, city: r.city,
        })));
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
          escrowStatus: (d.escrow_status ?? 'none') as Deal['escrowStatus'],
          escrowAmount: Number(d.escrow_amount ?? 0),
          date: new Date(d.created_at).toLocaleDateString('ru'),
        }));
        if (mapped.length > 0) setDeals(mapped);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setAppNotifications(prev => [{ id, text: message, time: 'Только что', read: false }, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const verifyUser = (id: string, status: boolean) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: status } : u));
    notify('Статус верификации обновлен');
  };

  const createDeal = async (carName: string) => {
    const tempId = `ord-${Math.floor(Math.random() * 10000)}`;
    const optimistic: Deal = {
      id: tempId, carName, status: 'выкуплено',
      escrowStatus: 'none', escrowAmount: 0,
      date: new Date().toLocaleDateString(),
    };
    setDeals(prev => [optimistic, ...prev]);
    try {
      await dealService.create(carName);
      notify('Авто забронировано!');
    } catch {
      setDeals(prev => prev.filter(d => d.id !== tempId));
      notify('Не удалось забронировать', 'error');
    }
  };

  const addCar = async (carData: Partial<Car>) => {
    try {
      await carService.create(carData);
      notify('Объявление отправлено на проверку. Обычно проверяем в течение 2 часов.', 'info');
    } catch {
      notify('Не удалось создать объявление', 'error');
    }
  };

  const approveCar = (id: string) => {
    setApiCars(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' as const } : c));
    notify('Объявление одобрено');
  };

  const rejectCar = (id: string) => {
    setApiCars(prev => prev.filter(c => c.id !== id));
    notify('Объявление отклонено', 'info');
  };

  const deleteRequest = (id: string) => {
    setUserRequests(prev => prev.filter(r => r.id !== id));
    notify('Запрос удален', 'info');
  };

  const likePost = async (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    try {
      await postService.like(id);
    } catch {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p));
      notify('Не удалось поставить лайк', 'error');
    }
  };

  const updatePost = (id: number, data: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePost = async (id: number) => {
    const backup = posts.find(p => p.id === id);
    setPosts(prev => prev.filter(p => p.id !== id));
    try {
      await postService.delete(id);
    } catch {
      if (backup) setPosts(prev => [backup, ...prev]);
      notify('Не удалось удалить пост', 'error');
    }
  };

  const updateCar = (id: string, data: Partial<Car>) => {
    setApiCars(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const addPost = async (postData: Partial<Post>) => {
    const tempId = Date.now();
    const optimistic = { ...postData, id: tempId, likes: 0, date: 'Только что' } as Post;
    setPosts(prev => [optimistic, ...prev]);
    try {
      const created = await postService.create({
        supplierName: postData.supplierName, type: postData.type,
        title: postData.title!, text: postData.text!, image: postData.image,
      });
      setPosts(prev => prev.map(p => p.id === tempId ? {
        ...p, id: created.id,
        date: new Date(created.created_at).toLocaleDateString('ru'),
      } : p));
    } catch {
      setPosts(prev => prev.filter(p => p.id !== tempId));
      notify('Не удалось создать пост', 'error');
    }
  };

  const addReview = (rev: Partial<Review>) => {
    const newRev = { ...rev, id: Date.now().toString(), date: 'Сегодня' } as Review;
    setReviews(prev => [newRev, ...prev]);
    notify('Отзыв опубликован!');
  };

  const submitRequest = async (data: any) => {
    const tempId = Date.now().toString();
    const optimistic: UserRequest = { ...data, id: tempId, date: 'Сегодня', status: 'new' };
    setUserRequests(prev => [optimistic, ...prev]);
    setTrends(prev => {
      const exists = prev.find(t => t.brand === data.brand && t.model === data.model);
      if (exists) return prev.map(t => t.brand === data.brand && t.model === data.model ? { ...t, requestCount: t.requestCount + 1 } : t);
      return [...prev, { brand: data.brand, model: data.model, requestCount: 1, dynamics: 'рост' as const }];
    });
    try {
      await requestService.create(data);
      notify('Заявка принята!');
    } catch {
      setUserRequests(prev => prev.filter(r => r.id !== tempId));
      notify('Не удалось отправить заявку', 'error');
    }
  };

  const sendMessage = (chatId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c, lastMsg: text, time: 'Только что',
          history: [...c.history, {
            sender: 'Вы', text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
          }],
        };
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
      const user: User = {
        id: String(data.id ?? ''), name: data.name ?? '',
        email: data.email ?? '', role,
        isVerified: data.is_verified ?? false, level: data.level ?? 1,
      };
      setCurrentUser(user);
    }
    notify('Добро пожаловать!');
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('lsauto_auth');
    localStorage.removeItem('lsauto_role');
    localStorage.removeItem('lsauto_current_user');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    window.location.href = '/';
  };

  const allCars = apiCars;

  return (
    <AppContext.Provider value={{
      favorites, compareList, pendingCars, allCars, carsLoading, carsPagination,
      trends, chats, posts, reviews, deals, userRequests, appNotifications,
      systemUsers, currentUser, isVerified, isLoggedIn, userRole, activeChatId,
      setPendingCars, setCurrentUser,
      addCar, updateCar, approveCar, rejectCar, deleteRequest, createDeal,
      verifyUser, addPost, updatePost, deletePost, likePost, addReview,
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
      login, logout, notify,
    }}>
      {children}
      <div className="fixed bottom-24 right-8 z-[200] space-y-3 pointer-events-none text-right">
        {toasts.map(n => (
          <div key={n.id} className={`inline-flex px-6 py-4 rounded-2xl shadow-2xl border items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto ${
            n.type === 'success' ? 'bg-green-500 border-green-400 text-white' :
            n.type === 'error' ? 'bg-red-500 border-red-400 text-white' :
            'bg-primary border-primary-hover text-black font-bold'
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
