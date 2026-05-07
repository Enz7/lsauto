
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { МOCK_CARS, MOCK_REQUESTS } from '../data/mockData';
import { LayoutDashboard, Car, MessageCircle, TrendingUp, Users, Plus, Star, ArrowUpRight, X, Image as ImageIcon, Loader2, Video, Award } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { carService } from '../services/apiService';

export const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoggedIn, notify, addCar, addedCars, isVerified, setAddedCars, setActiveChatId, addPost, setVerified, userRequests } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const initialForm = { 
    brand: '', model: '', price: '', year: '', origin: 'Китай', 
    mileage: '', transmission: 'Автомат', fuel: 'Бензин', 
    city: 'Москва', description: '', image: '' 
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [postData, setPostData] = useState({ title: '', text: '', type: 'new' });

  if (!isLoggedIn || userRole !== 'Поставщик') {
    return <Navigate to="/login" replace />;
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    addPost({
      id: Date.now(),
      supplier: 'China Auto Export',
      type: postData.type,
      title: postData.title,
      text: postData.text,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      likes: 0,
      comments: 0,
      date: 'Только что'
    });
    setIsPostModalOpen(false);
    notify('Пост опубликован в ленте!', 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await carService.uploadImage(file);
      setFormData({ ...formData, image: url });
      notify('Фото загружено', 'success');
    } catch (err) {
      notify('Ошибка загрузки', 'info');
    } finally { setUploading(false); }
  };

  const handleRemove = (id: string) => {
    setAddedCars((prev: any) => prev.filter((c: any) => c.id !== id));
    notify('Объявление снято', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCar = {
      id: `custom-${Date.now()}`,
      марка: formData.brand,
      модель: formData.model,
      год: Number(formData.year),
      цена: Number(formData.price),
      страна: formData.origin as any,
      коробка: formData.transmission,
      топливо: formData.fuel,
      пробег: Number(formData.mileage),
      описание: formData.description || 'Без описания',
      город: formData.city,
      поставщикId: 's1',
      изображения: [formData.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
      тренд: false,
      теги: ['Новинка']
    };
    await addCar(newCar);
    setIsAddModalOpen(false);
    setFormData(initialForm);
    notify('Автомобиль опубликован!', 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Add Car Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Добавить автомобиль</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all"><X /></button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Марка</label>
                  <input type="text" placeholder="Напр: Geely" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Модель</label>
                  <input type="text" placeholder="Напр: Monjaro" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Цена (₽)</label>
                  <input type="number" placeholder="3500000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Год</label>
                  <input type="number" placeholder="2024" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Пробег (км)</label>
                  <input type="number" placeholder="0" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Город</label>
                  <input type="text" placeholder="Москва" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Страна</label>
                  <select value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary">
                    <option>Китай</option>
                    <option>Европа</option>
                    <option>Южная Корея</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">КПП</label>
                  <select value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary">
                    <option>Автомат</option>
                    <option>Механика</option>
                    <option>Робот</option>
                    <option>Редуктор</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Топливо</label>
                  <select value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary">
                    <option>Бензин</option>
                    <option>Дизель</option>
                    <option>Электро</option>
                    <option>Гибрид</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Описание</label>
                <textarea rows={3} placeholder="Расскажите об автомобиле..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>

              <div className="pt-2">
                <label className="block w-full border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-6 transition-all cursor-pointer text-center relative overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" />
                      <span className="text-xs text-gray-500">Загрузка...</span>
                    </div>
                  ) : formData.image ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={formData.image} className="h-32 w-auto rounded-lg mb-2 shadow-2xl" />
                      <span className="text-xs text-green-500 font-bold uppercase">Фото загружено</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="text-gray-600" size={32} />
                      <span className="text-xs text-gray-500">Нажмите, чтобы загрузить фото авто</span>
                    </div>
                  )}
                </label>
              </div>

              <button disabled={uploading} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl mt-4 disabled:opacity-50 shadow-xl shadow-primary/20 transition-all">
                Опубликовать объявление
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            {isVerified ? (
              <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20 uppercase">Верифицирован</span>
            ) : (
              <button 
                onClick={() => setIsVerifyModalOpen(true)}
                className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-500/20 uppercase animate-pulse hover:bg-yellow-500 hover:text-black transition-all"
              >
                Нужна проверка
              </button>
            )}
          </div>
          <p className="text-gray-400 mt-1">Добро пожаловать, China Auto Export</p>
        </div>

        {/* Verification Modal */}
        {isVerifyModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsVerifyModalOpen(false)} />
            <div className="relative bg-dark-card border border-white/10 w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Центр верификации</h2>
                <button onClick={() => setIsVerifyModalOpen(false)}><X /></button>
              </div>
              <div className="space-y-6 text-sm text-gray-400">
                <p>Для получения статуса «Проверенный поставщик» и доступа к торгам, загрузите следующие документы:</p>
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                    <span>Паспорт РФ (Главная + Прописка)</span>
                    <button className="text-primary font-bold">Выбрать</button>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                    <span>Свидетельство ИНН / ОГРНИП</span>
                    <button className="text-primary font-bold">Выбрать</button>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                    <span>Видео-селфи с паспортом</span>
                    <button className="text-primary font-bold">Записать</button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setVerified(true);
                    setIsVerifyModalOpen(false);
                    notify('Документы отправлены на модерацию', 'success');
                  }}
                  className="w-full bg-primary text-black font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all"
                >
                  Отправить всё на проверку
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Video size={20} /> Создать пост
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/10"
          >
            <Plus size={20} /> Добавить автомобиль
          </button>
        </div>
      </div>

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsPostModalOpen(false)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Создать пост в ленту</h2>
              <button onClick={() => setIsPostModalOpen(false)}><X /></button>
            </div>
            <form className="space-y-4" onSubmit={handleCreatePost}>
              <input type="text" placeholder="Заголовок поста" value={postData.title} onChange={e => setPostData({...postData, title: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary" required />
              <textarea rows={4} placeholder="Текст поста..." value={postData.text} onChange={e => setPostData({...postData, text: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary resize-none" required />
              <select value={postData.type} onChange={e => setPostData({...postData, type: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary">
                <option value="new">Новое авто</option>
                <option value="video">Видеообзор</option>
                <option value="delivery">Доставка</option>
                <option value="pickup">Выдача</option>
              </select>
              <button className="w-full bg-primary text-black font-bold py-4 rounded-2xl mt-4">Опубликовать в ленте</button>
            </form>
          </div>
        </div>
      )}

      {/* Level Progress & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-card border border-white/5 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Ваш прогресс</div>
              <div className="text-xl font-bold">Уровень 5: <span className="text-indigo-400 uppercase italic">Platinum</span></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">До Level 6 (Diamond)</span>
              <div className="font-bold text-primary">450 / 500 баллов</div>
            </div>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full w-[90%] shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-in slide-in-from-left duration-1000" />
          </div>
          <p className="text-[10px] text-gray-500 italic">На следующем уровне: комиссия 1.5% вместо 2% и приоритет в ленте выдач.</p>
        </div>
        
        <div className="bg-primary rounded-[2.5rem] p-8 text-black flex flex-col justify-between group overflow-hidden relative">
          <Award className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Тарифный план</div>
            <div className="text-2xl font-black uppercase tracking-tighter mt-1">LSAuto Unlimited</div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-bold">Доступен до: 12.06.2024</div>
            <button className="mt-2 text-xs font-black underline underline-offset-4 decoration-2">Продлить доступ</button>
          </div>
        </div>
      </div>

      {/* Stats & Mini Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Мои авто', val: addedCars.length + 3, icon: Car, color: 'text-blue-500' },
            { label: 'Просмотры', val: '1,240', icon: Users, color: 'text-primary' },
            { label: 'Сделки', val: '45', icon: TrendingUp, color: 'text-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-3xl space-y-2">
              <div className="flex justify-between items-start">
                <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] text-green-500 font-bold">+12%</span>
              </div>
              <div className="text-2xl font-black">{stat.val}</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
              {/* Mini SVG Chart */}
              <div className="pt-4 h-12 flex items-end gap-1">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-sm group-hover:bg-primary/20 transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-dark-card border border-white/5 p-6 rounded-3xl flex flex-col justify-center items-center text-center space-y-2">
           <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 mb-2">
             <Star size={32} fill="currentColor" />
           </div>
           <div className="text-3xl font-black">4.9</div>
           <div className="text-xs text-gray-500 font-bold uppercase">Рейтинг</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Горячие запросы клиентов
            </h3>
            <Link to="/messages" className="text-xs text-primary hover:underline">Открыть чат</Link>
          </div>
          <div className="space-y-4">
            {MOCK_REQUESTS.concat(MOCK_REQUESTS).map((req, i) => (
              <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                    <Car size={24} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-bold">{req.марка} {req.модель}</h4>
                      <span className="text-xs text-primary font-bold">{req.бюджет.toLocaleString()} ₽</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{req.комментарий}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-gray-600 uppercase font-bold">
                      <span>Год: {req.год}</span>
                      <span>Дата: {req.дата}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveChatId('u1'); navigate('/messages'); }}
                  className="w-full md:w-auto bg-white/5 hover:bg-primary hover:text-black px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  Ответить <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Cars */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard size={20} className="text-primary" />
            Мои объявления
          </h3>
          <div className="space-y-4">
            {addedCars.map(car => (
              <div key={car.id} className="bg-dark-card border border-white/10 p-4 rounded-2xl flex gap-4 animate-in slide-in-from-right duration-300">
                <img src={car.изображения[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h5 className="font-bold text-sm leading-none mb-1">{car.марка} {car.модель}</h5>
                    <span className="text-[10px] text-gray-500">{car.цена.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[10px] text-primary hover:underline" onClick={() => notify('Редактирование скоро будет доступно', 'info')}>Редактировать</button>
                    <button className="text-[10px] text-red-500 hover:underline" onClick={() => handleRemove(car.id)}>Снять</button>
                  </div>
                </div>
              </div>
            ))}
            {МOCK_CARS.slice(0, 3).map(car => (
              <div key={car.id} className="bg-dark-card border border-white/5 p-4 rounded-2xl flex gap-4 opacity-60">
                <img src={car.изображения[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h5 className="font-bold text-sm leading-none mb-1">{car.марка} {car.модель}</h5>
                    <span className="text-[10px] text-gray-500">{car.цена.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-600">
                    Пример объявления
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/catalog" className="block text-center p-4 border border-dashed border-white/10 rounded-2xl text-gray-500 text-sm hover:border-primary/50 hover:text-primary transition-all">
            Смотреть все в каталоге
          </Link>
        </div>
      </div>
    </div>
  );
};
