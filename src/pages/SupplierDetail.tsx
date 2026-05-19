
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supplierService } from '../services/apiService';
import { MapPin, Star, MessageCircle, ShieldCheck, Briefcase, FileText, CheckCircle2, ChevronLeft, Heart, Play, Newspaper, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Поставщик } from '../types';

export const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveChatId, allCars, notify, reviews: contextReviews, posts } = useApp();
  const [supplier, setSupplier] = useState<Поставщик | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supplierService.getById(id)
      .then(data => setSupplier(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !supplier) {
    return <div className="text-center py-20 text-gray-500">Поставщик не найден</div>;
  }

  const handleWrite = () => {
    if (id) { setActiveChatId(id); navigate('/messages'); }
  };

  const supplierCars = allCars.filter(c => c.поставщикId === id);
  const supplierPosts = posts.filter(p => p.supplierId === id);
  const staticReviews = [
    { user: 'Дмитрий В.', text: 'Доставили быстрее чем обещали, состояние идеальное. Спасибо за честность!', date: '12.04.2024', rating: 5 },
    { user: 'Анна К.', text: 'Помогли с растаможкой и СБКТС. Профессионалы своего дела.', date: '05.04.2024', rating: 5 },
  ];
  const reviews = [...(contextReviews.filter((r: any) => r.supplierId === id)), ...staticReviews];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link to="/suppliers" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
        <ChevronLeft size={20} /> Назад к списку
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden p-8 text-center space-y-6">
            <div className="relative inline-block">
              <img src={supplier.фотографии[0]} className="w-32 h-32 rounded-3xl object-cover mx-auto ring-4 ring-primary/20" alt={supplier.название} />
              {supplier.документыСтатус === 'проверен' && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-dark-card">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{supplier.название}</h1>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-2">
                <MapPin size={16} /> {supplier.город || 'Не указан'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="text-xl font-bold text-primary">⭐ {supplier.рейтинг}</div>
                <div className="text-[10px] text-gray-500 uppercase">Рейтинг</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <div className="text-xl font-bold text-primary">{supplier.опыт}</div>
                <div className="text-[10px] text-gray-500 uppercase">Опыт</div>
              </div>
            </div>

            <button
              onClick={handleWrite}
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle size={20} /> Связаться
            </button>
          </div>

          <div className="bg-dark-card border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold">Верификация</h3>
            <div className="space-y-3">
              {[
                { label: 'Регистрация ИП/ООО', icon: FileText },
                { label: 'Паспортные данные', icon: ShieldCheck },
                { label: 'История сделок', icon: Briefcase },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-400">
                    <item.icon size={16} /> {item.label}
                  </div>
                  <CheckCircle2 size={16} className={supplier.документыСтатус === 'проверен' ? 'text-green-500' : 'text-gray-600'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">О поставщике</h2>
            <p className="text-gray-400 leading-relaxed">{supplier.описание || 'Поставщик автомобилей на платформе LSAuto.'}</p>
            {supplier.контакты && (
              <p className="text-sm text-gray-500">Контакты: <span className="text-white">{supplier.контакты}</span></p>
            )}
          </div>

          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Отзывы клиентов</h2>
              <button
                onClick={() => notify('Форма отзыва будет доступна после завершения сделки', 'info')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Оставить отзыв
              </button>
            </div>
            <div className="space-y-6">
              {reviews.map((rev, i) => (
                <div key={i} className="border-b border-white/5 pb-6 last:border-none last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-sm">{rev.user}</div>
                    <div className="flex text-primary">
                      {[...Array(rev.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 italic mb-2">"{rev.text}"</p>
                  <div className="text-[10px] text-gray-600 uppercase font-bold">{rev.date}</div>
                </div>
              ))}
            </div>
          </div>

          {supplierPosts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Newspaper className="text-primary" size={24} />
                  Публикации ({supplierPosts.length})
                </h2>
                <Link to="/feed" className="text-xs text-primary font-bold hover:underline">Все публикации</Link>
              </div>
              <div className="space-y-4">
                {supplierPosts.map(post => (
                  <div key={post.id} className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="flex gap-4 p-4">
                      <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                        {post.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={20} className="text-white" fill="white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{post.date}</p>
                        <h4 className="font-bold text-sm leading-tight line-clamp-2">{post.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{post.text}</p>
                        <div className="flex items-center gap-4 pt-1">
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Heart size={12} /> {post.likes}
                          </span>
                          <Link to="/feed" className="text-[10px] text-primary font-bold hover:underline ml-auto">Читать →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Автомобили в наличии ({supplierCars.length})</h2>
            {supplierCars.length === 0 ? (
              <p className="text-gray-500 text-sm">У этого поставщика пока нет добавленных автомобилей.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supplierCars.map(car => (
                  <Link key={car.id} to={`/catalog/${car.id}`} className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden group">
                    <div className="aspect-video overflow-hidden">
                      <img src={car.изображения[0]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={car.марка} />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold">{car.марка} {car.модель}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-primary font-bold">{car.цена.toLocaleString()} ₽</span>
                        <span className="text-xs text-gray-500">{car.год} г.</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
