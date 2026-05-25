
import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Car as CarIcon, TrendingUp, Plus, X, Image as ImageIcon, Loader2, Video, Pencil, Trash2, Upload, Film } from 'lucide-react';
import type { Car } from '@/types';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { carService } from '../services/apiService';

type CarForm = {
  brand: string; model: string; price: string; year: string; origin: string;
  mileage: string; transmission: string; fuel: string; city: string;
  description: string; images: string[];
};

type PostForm = { title: string; text: string; type: string; image: string; };

const EMPTY_CAR: CarForm = {
  brand: '', model: '', price: '', year: '', origin: 'Китай',
  mileage: '', transmission: 'Автомат', fuel: 'Бензин',
  city: 'Москва', description: '', images: [],
};

const EMPTY_POST: PostForm = { title: '', text: '', type: 'photo', image: '' };

export const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoggedIn, notify, addCar, updateCar, addedCars, removeCar,
    isVerified, setActiveChatId, addPost, updatePost, deletePost, setVerified,
    userRequests, posts, currentUser } = useApp();

  // Car modal
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editCarId, setEditCarId] = useState<string | null>(null);
  const [carForm, setCarForm] = useState<CarForm>(EMPTY_CAR);
  const [uploadingCar, setUploadingCar] = useState(false);
  const carFileRef = useRef<HTMLInputElement>(null);

  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [postForm, setPostForm] = useState<PostForm>(EMPTY_POST);
  const [uploadingPost, setUploadingPost] = useState(false);
  const postFileRef = useRef<HTMLInputElement>(null);

  // View post
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);

  // Verify modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  if (!isLoggedIn || userRole !== 'Поставщик') return <Navigate to="/login" replace />;

  // ── Car helpers ──────────────────────────────────────────
  const openAddCar = () => { setEditCarId(null); setCarForm(EMPTY_CAR); setCarModalOpen(true); };

  const openEditCar = (car: Car) => {
    setEditCarId(car.id);
    setCarForm({
      brand: car.brand, model: car.model, price: String(car.price),
      year: String(car.year), origin: car.origin, mileage: String(car.mileage),
      transmission: car.transmission, fuel: car.fuel, city: car.city,
      description: car.description, images: car.images ?? [],
    });
    setCarModalOpen(true);
  };

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCar(true);
    try {
      const url = await carService.uploadImage(file);
      setCarForm(p => ({ ...p, images: [...p.images, url] }));
      notify('Фото добавлено', 'success');
    } catch {
      // fallback: use object URL for demo
      const url = URL.createObjectURL(file);
      setCarForm(p => ({ ...p, images: [...p.images, url] }));
      notify('Фото добавлено (локально)', 'success');
    } finally { setUploadingCar(false); }
    if (carFileRef.current) carFileRef.current.value = '';
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const carData: Partial<Car> = {
      brand: carForm.brand,
      model: carForm.model,
      year: Number(carForm.year),
      price: Number(carForm.price),
      origin: carForm.origin as Car['origin'],
      transmission: carForm.transmission,
      fuel: carForm.fuel,
      mileage: Number(carForm.mileage),
      description: carForm.description || 'Без описания',
      city: carForm.city,
      images: carForm.images.length > 0
        ? carForm.images
        : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    };
    if (editCarId) {
      updateCar(editCarId, carData);
      notify('Объявление обновлено', 'success');
    } else {
      await addCar(carData);
    }
    setCarModalOpen(false);
    setCarForm(EMPTY_CAR);
    setEditCarId(null);
  };

  const handleRemoveCar = async (id: string) => {
    await removeCar(id);
  };

  // ── Post helpers ─────────────────────────────────────────
  const openAddPost = () => { setEditPostId(null); setPostForm(EMPTY_POST); setPostModalOpen(true); };

  const openEditPost = (post: typeof posts[0]) => {
    setEditPostId(post.id);
    setPostForm({ title: post.title, text: post.text, type: post.type, image: post.image });
    setPostModalOpen(true);
  };

  const handlePostMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPost(true);
    const isVideo = file.type.startsWith('video/');
    try {
      const url = isVideo ? URL.createObjectURL(file) : await carService.uploadImage(file);
      setPostForm(p => ({ ...p, image: url, type: isVideo ? 'video' : 'photo' }));
      notify(isVideo ? 'Видео прикреплено' : 'Фото добавлено', 'success');
    } catch {
      const url = URL.createObjectURL(file);
      setPostForm(p => ({ ...p, image: url, type: isVideo ? 'video' : 'photo' }));
      notify('Медиа добавлено (локально)', 'success');
    } finally { setUploadingPost(false); }
    if (postFileRef.current) postFileRef.current.value = '';
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPostId !== null) {
      updatePost(editPostId, {
        title: postForm.title, text: postForm.text,
        type: postForm.type,
        image: postForm.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      });
      notify('Публикация обновлена', 'success');
    } else {
      addPost({
        type: postForm.type, title: postForm.title, text: postForm.text,
        image: postForm.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      });
      notify('Пост опубликован в ленте!', 'success');
    }
    setPostModalOpen(false);
    setPostForm(EMPTY_POST);
    setEditPostId(null);
  };

  const myPosts = posts.filter(p => p.supplierId === currentUser?.id);

  const inputCls = 'w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary text-sm';

  return (
    <>
      <Helmet>
        <title>Кабинет поставщика — LSAUTO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">

      {/* ── Car Modal ─────────────────────────────────────── */}
      {carModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setCarModalOpen(false)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editCarId ? 'Редактировать авто' : 'Добавить автомобиль'}</h2>
              <button onClick={() => setCarModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
            </div>
            <form className="space-y-5" onSubmit={handleCarSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input className={inputCls} placeholder="Марка" value={carForm.brand} onChange={e => setCarForm(p => ({...p, brand: e.target.value}))} required />
                <input className={inputCls} placeholder="Модель" value={carForm.model} onChange={e => setCarForm(p => ({...p, model: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input className={inputCls} type="number" placeholder="Цена (₽)" value={carForm.price} onChange={e => setCarForm(p => ({...p, price: e.target.value}))} required />
                <input className={inputCls} type="number" placeholder="Год" value={carForm.year} onChange={e => setCarForm(p => ({...p, year: e.target.value}))} required />
                <input className={inputCls} type="number" placeholder="Пробег (км)" value={carForm.mileage} onChange={e => setCarForm(p => ({...p, mileage: e.target.value}))} required />
                <input className={inputCls} placeholder="Город" value={carForm.city} onChange={e => setCarForm(p => ({...p, city: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <select className={inputCls} value={carForm.origin} onChange={e => setCarForm(p => ({...p, origin: e.target.value}))}>
                  <option>Китай</option><option>Европа</option><option>Южная Корея</option>
                </select>
                <select className={inputCls} value={carForm.transmission} onChange={e => setCarForm(p => ({...p, transmission: e.target.value}))}>
                  <option>Автомат</option><option>Механика</option><option>Робот</option><option>Редуктор</option>
                </select>
                <select className={inputCls} value={carForm.fuel} onChange={e => setCarForm(p => ({...p, fuel: e.target.value}))}>
                  <option>Бензин</option><option>Дизель</option><option>Электро</option><option>Гибрид</option>
                </select>
              </div>
              <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Описание..." value={carForm.description} onChange={e => setCarForm(p => ({...p, description: e.target.value}))} />

              {/* Photo upload */}
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Фотографии ({carForm.images.length}/8)</div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {carForm.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCarForm(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={18} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  {carForm.images.length < 8 && (
                    <label className="aspect-square border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <input ref={carFileRef} type="file" className="hidden" accept="image/*" onChange={handleCarImageUpload} disabled={uploadingCar} />
                      {uploadingCar ? <Loader2 className="animate-spin text-primary" size={20} /> : <><Upload size={20} className="text-gray-600 group-hover:text-primary transition-colors" /><span className="text-[10px] text-gray-600 mt-1">Добавить</span></>}
                    </label>
                  )}
                </div>
              </div>

              <button disabled={uploadingCar} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl disabled:opacity-50 transition-all">
                {editCarId ? 'Сохранить изменения' : 'Опубликовать'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Post Modal ─────────────────────────────────────── */}
      {postModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPostModalOpen(false)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editPostId !== null ? 'Редактировать пост' : 'Создать пост'}</h2>
              <button onClick={() => setPostModalOpen(false)}><X /></button>
            </div>
            <form className="space-y-4" onSubmit={handlePostSubmit}>
              <input className={inputCls} placeholder="Заголовок" value={postForm.title} onChange={e => setPostForm(p => ({...p, title: e.target.value}))} required />
              <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Текст публикации..." value={postForm.text} onChange={e => setPostForm(p => ({...p, text: e.target.value}))} required />

              {/* Media upload */}
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Фото или видео</div>
                {postForm.image ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group">
                    {postForm.type === 'video'
                      ? <video src={postForm.image} className="w-full h-full object-cover" controls />
                      : <img src={postForm.image} className="w-full h-full object-cover" />
                    }
                    <button
                      type="button"
                      onClick={() => setPostForm(p => ({...p, image: '', type: 'photo'}))}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-all"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-[10px] font-bold px-2 py-1 rounded-full uppercase text-primary">
                      {postForm.type === 'video' ? '🎬 Видео' : '📷 Фото'}
                    </div>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-8 transition-all cursor-pointer text-center group">
                    <input ref={postFileRef} type="file" className="hidden" accept="image/*,video/*" onChange={handlePostMediaUpload} disabled={uploadingPost} />
                    {uploadingPost
                      ? <Loader2 className="animate-spin text-primary mx-auto" size={28} />
                      : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-4 text-gray-600 group-hover:text-primary transition-colors">
                            <ImageIcon size={28} /><Film size={28} />
                          </div>
                          <div className="text-sm text-gray-500">Нажмите, чтобы загрузить фото или видео</div>
                          <div className="text-xs text-gray-700">JPG, PNG, MP4, MOV · до 50 МБ</div>
                        </div>
                      )
                    }
                  </label>
                )}
              </div>

              <button className="w-full bg-primary text-black font-bold py-4 rounded-2xl hover:bg-primary-hover transition-all">
                {editPostId !== null ? 'Сохранить изменения' : 'Опубликовать'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Verify Modal ────────────────────────────────────── */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsVerifyModalOpen(false)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Центр верификации</h2>
              <button onClick={() => setIsVerifyModalOpen(false)}><X /></button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center text-sm">
                <span>Паспорт и ИНН</span>
                <button className="text-primary font-bold">Загрузить</button>
              </div>
              <button onClick={() => { setVerified(true); setIsVerifyModalOpen(false); notify('Документы приняты', 'success'); }} className="w-full bg-primary text-black font-bold py-4 rounded-2xl">
                Отправить на проверку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Post Modal ──────────────────────────────────── */}
      {selectedPost && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-white/10 text-white p-2 rounded-full transition-all"><X size={20} /></button>
            {selectedPost.image && (
              selectedPost.type === 'video'
                ? <video src={selectedPost.image} className="w-full aspect-video object-cover" controls />
                : <img src={selectedPost.image} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">{selectedPost.type}</span>
                <span className="text-xs text-gray-500">{selectedPost.date}</span>
              </div>
              <h2 className="text-xl font-bold">{selectedPost.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{selectedPost.text}</p>
              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-sm text-gray-500">
                <span>❤️ {selectedPost.likes} лайков</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            {isVerified
              ? <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20 uppercase">Верифицирован</span>
              : <button onClick={() => setIsVerifyModalOpen(true)} className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-500/20 uppercase animate-pulse">Нужна проверка</button>
            }
          </div>
          <p className="text-gray-400 mt-1">Добро пожаловать, {currentUser?.name || 'Поставщик'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={openAddPost} className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Video size={20} /> Создать пост
          </button>
          <button onClick={openAddCar} className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-black font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10">
            <Plus size={20} /> Добавить авто
          </button>
        </div>
      </div>

      {/* ── Горячие запросы ─────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp size={20} className="text-primary" />Горячие запросы ({userRequests.length})</h3>
        <div className="space-y-4">
          {userRequests.length === 0 ? (
            <div className="bg-dark-card border border-white/5 rounded-3xl p-8 text-center text-gray-500 text-sm">Запросов пока нет</div>
          ) : userRequests.map((req, i) => (
            <div key={i} className="bg-dark-card border border-white/10 p-6 rounded-3xl flex justify-between items-center hover:border-primary/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><CarIcon size={24} /></div>
                <div><h4 className="font-bold">{req.brand} {req.model}</h4><p className="text-xs text-gray-500">Бюджет: {req.budget.toLocaleString()} ₽</p></div>
              </div>
              <button onClick={() => { setActiveChatId('u1'); navigate('/messages'); }} className="bg-white/5 hover:bg-primary hover:text-black px-6 py-2.5 rounded-xl text-xs font-bold transition-all">Ответить</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Мои объявления ──────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard size={20} className="text-primary" />Мои объявления ({addedCars.length})</h3>
        {addedCars.length === 0 ? (
          <div className="bg-dark-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
            <CarIcon size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Объявлений пока нет — нажмите «Добавить авто»</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addedCars.map(car => (
              <div key={car.id} className="bg-dark-card border border-white/10 rounded-3xl overflow-hidden hover:border-primary/20 transition-all group">
                <Link to={`/catalog/${car.id}`} className="block">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={car.images?.[0] ?? 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {(car.images?.length ?? 0) > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        +{(car.images?.length ?? 1) - 1} фото
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full ${car.status === 'approved' ? 'bg-green-500 text-white' : car.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                      {car.status === 'approved' ? 'Опубликовано' : car.status === 'rejected' ? 'Отклонено' : 'На проверке'}
                    </div>
                  </div>
                  <div className="p-5 space-y-1">
                    <h5 className="font-bold">{car.brand} {car.model}</h5>
                    <p className="text-primary font-bold text-sm">{Number(car.price).toLocaleString()} ₽</p>
                    <p className="text-xs text-gray-500">{car.year} • {car.city}</p>
                  </div>
                </Link>
                <div className="px-5 pb-5 flex items-center gap-3">
                  <button
                    onClick={() => openEditCar(car)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                  >
                    <Pencil size={13} /> Редактировать
                  </button>
                  <span className="text-white/10">|</span>
                  <button
                    onClick={() => handleRemoveCar(car.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500/70 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} /> Снять
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Мои публикации ──────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Video size={20} className="text-primary" />Мои публикации ({myPosts.length})</h3>
        {myPosts.length === 0 ? (
          <div className="bg-dark-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
            <Video size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Публикаций пока нет — нажмите «Создать пост»</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.map(post => (
              <div key={post.id} className="bg-dark-card border border-white/10 rounded-3xl overflow-hidden hover:border-primary/40 transition-all group">
                <div onClick={() => setSelectedPost(post)} className="cursor-pointer">
                  {post.image && (
                    <div className="overflow-hidden aspect-video relative">
                      {post.type === 'video'
                        ? <video src={post.image} className="w-full h-full object-cover" />
                        : <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      }
                      {post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Film size={32} className="text-white drop-shadow-xl" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-sm line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{post.text}</p>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-gray-500">
                      <span>{post.date}</span>
                      <span>❤️ {post.likes}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 flex items-center gap-3 border-t border-white/5 pt-3">
                  <button
                    onClick={() => openEditPost(post)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                  >
                    <Pencil size={13} /> Редактировать
                  </button>
                  <span className="text-white/10">|</span>
                  <button
                    onClick={() => { deletePost(post.id); notify('Публикация удалена', 'info'); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500/70 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} /> Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
