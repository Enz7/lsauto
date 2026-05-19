
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_SUPPLIERS } from '../data/mockData';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, MapPin, ShieldCheck, MessageCircle, Info, TrendingUp, Gauge, Calendar, Car, Scale, Heart, X, CheckCircle2, ZoomIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveChatId, toggleCompare, compareList, toggleFavorite, favorites, allCars, createDeal } = useApp();
  const [showPhone, setShowPhone] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('');
  const [tdDone, setTdDone] = useState(false);

  const isFav = id ? favorites.includes(id) : false;
  const isCompare = id ? compareList.includes(id) : false;
  const car = allCars.find(c => c.id === id);
  const supplier = MOCK_SUPPLIERS.find(s => s.id === car?.поставщикId);

  if (!car) return (
    <div className="text-center py-20 animate-in fade-in duration-500">
      <div className="bg-dark-card border border-white/5 p-12 rounded-[3rem] inline-block">
        <h1 className="text-2xl font-bold mb-4">Автомобиль не найден</h1>
        <Link to="/catalog" className="text-primary hover:underline font-bold">Вернуться в каталог</Link>
      </div>
    </div>
  );

  const handleWrite = () => {
    if (car?.поставщикId) {
      setActiveChatId(car.поставщикId);
      navigate('/messages');
    }
  };

  // Use real images from car object if available
  const images = car.изображения && car.изображения.length > 0 
    ? car.изображения 
    : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'];

  const otherCityPrice = car.цена + 150000;

  return (
    <>
      <Helmet>
        <title>{`${car.марка} ${car.модель} ${car.год} — LSAUTO`}</title>
        <meta name="description" content={`${car.марка} ${car.модель} ${car.год} г., ${car.цена.toLocaleString('ru')} ₽. Доставка из ${car.страна}. ${car.описание?.slice(0, 100) || ''}`} />
      </Helmet>
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
          <ChevronLeft size={20} /> Назад в каталог
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => id && toggleCompare(id)}
            className={`p-3 rounded-2xl border transition-all ${isCompare ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Scale size={20} />
          </button>
          <button 
            onClick={() => id && toggleFavorite(id)}
            className={`p-3 rounded-2xl border transition-all ${isFav ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div 
              onClick={() => setIsZoomed(true)}
              className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-dark-card cursor-zoom-in group relative"
            >
              <img src={images[activeImg]} alt={car.марка} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500 group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <ZoomIn size={48} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            
            {isZoomed && (
              <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-in fade-in duration-300">
                <button onClick={() => setIsZoomed(false)} className="absolute top-10 right-10 text-white hover:text-primary transition-colors"><X size={40} /></button>
                <img src={images[activeImg]} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" />
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-card p-5 md:p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold">{car.марка} {car.модель}</h1>
                <p className="text-gray-400 mt-2">{car.год} год • {car.коробка} • {car.топливо}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{car.цена.toLocaleString()} ₽</div>
                <div className="text-sm text-gray-500">Цена с учетом доставки</div>
              </div>
            </div>

            {/* Comparison Module */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Сравнение цен в РФ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <div className="text-xs text-primary font-bold uppercase">Цена через LSAuto</div>
                  <div className="text-xl font-bold">{car.цена.toLocaleString()} ₽</div>
                  <div className="text-[10px] text-primary/70">Прямой импорт, без наценок салонов</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-gray-500 font-bold uppercase">В наличии в автосалонах</div>
                  <div className="text-xl font-bold text-gray-400">{otherCityPrice.toLocaleString()} ₽</div>
                  <div className="text-[10px] text-gray-500">Средняя цена в РФ (Авто.ру/Авито)</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Характеристики</h3>
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {[
                  { icon: Gauge, label: 'Пробег', val: `${car.пробег} км` },
                  { icon: MapPin, label: 'Локация', val: car.город },
                  { icon: Calendar, label: 'Год', val: car.год },
                  { icon: Car, label: 'КПП', val: car.коробка },
                  { icon: Info, label: 'Топливо', val: car.топливо },
                  { icon: ShieldCheck, label: 'Статус', val: 'В наличии' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl text-center">
                    <item.icon size={20} className="mx-auto mb-2 text-primary" />
                    <div className="text-[10px] text-gray-500 uppercase">{item.label}</div>
                    <div className="text-sm font-bold">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Описание</h3>
              <p className="text-gray-400 leading-relaxed">{car.описание}</p>
            </div>
          </div>
        </div>

        {/* Right: Supplier Card & Actions */}
        <div className="space-y-6">
          <div className="bg-dark-card p-6 rounded-3xl border border-white/5 sticky top-24">
            <h3 className="font-bold text-lg mb-6">Продавец</h3>
            <div className="flex items-center gap-4 mb-6">
              <img src={supplier?.фотографии?.[0] ?? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800'} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h4 className="font-bold">{supplier?.название}</h4>
                <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold mt-1">
                  <ShieldCheck size={14} /> ПРОВЕРЕН
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Город:</span>
                <span className="font-medium">{supplier?.город}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Опыт:</span>
                <span className="font-medium">{supplier?.опыт}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Рейтинг:</span>
                <span className="font-medium">⭐ {supplier?.рейтинг}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => car && createDeal(car.марка + ' ' + car.модель)}
                className="w-full bg-primary hover:bg-primary-hover text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary/20 uppercase text-xs tracking-widest"
              >
                Забронировать авто
              </button>
              <button
                onClick={() => setTestDriveOpen(true)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Calendar size={18} /> Записаться на тест-драйв
              </button>
              <button 
                onClick={handleWrite}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle size={20} /> Чат LSAuto
              </button>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://t.me/lsauto" target="_blank" className="bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/20 font-bold py-3 rounded-2xl text-center text-xs transition-all">Telegram</a>
                <a href="https://wa.me/79990000000" target="_blank" className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 font-bold py-3 rounded-2xl text-center text-xs transition-all">WhatsApp</a>
              </div>
              <button 
                onClick={() => setShowPhone(true)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold py-4 rounded-2xl transition-all"
              >
                {showPhone ? supplier?.контакты : 'Показать телефон'}
              </button>
              
              {/* Mobile Fixed CTA */}
              <div className="lg:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex gap-3 z-[50] animate-in slide-in-from-bottom duration-500">
                <button 
                  onClick={() => setShowPhone(true)}
                  className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl text-sm"
                >
                  {showPhone ? supplier?.контакты : 'Позвонить'}
                </button>
                <button 
                  onClick={handleWrite}
                  className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl text-sm shadow-lg shadow-primary/20"
                >
                  Написать
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 mt-6 text-center leading-relaxed">
              Нажимая кнопку «Написать», вы соглашаетесь с условиями сервиса и политикой конфиденциальности.
            </p>
          </div>
        </div>
      </div>
      {/* Test Drive Modal */}
      {testDriveOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-dark-card border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black">Тест-драйв</h2>
                <p className="text-gray-400 text-sm mt-1">{car.марка} {car.модель} {car.год}</p>
              </div>
              <button onClick={() => { setTestDriveOpen(false); setTdDone(false); }} className="text-gray-500 hover:text-white transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            {tdDone ? (
              <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
                <CheckCircle2 size={56} className="text-green-500 mx-auto" />
                <h3 className="text-xl font-black">Запись подтверждена!</h3>
                <p className="text-gray-400 text-sm">Ждём вас <strong className="text-white">{tdDate}</strong> в <strong className="text-white">{tdTime}</strong>.<br />Поставщик свяжется с вами по номеру <strong className="text-white">{tdPhone}</strong>.</p>
                <button
                  onClick={() => { setTestDriveOpen(false); setTdDone(false); setTdName(''); setTdPhone(''); setTdDate(''); setTdTime(''); }}
                  className="mt-4 bg-primary text-black font-black px-8 py-3 rounded-2xl"
                >
                  Отлично!
                </button>
              </div>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); setTdDone(true); }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ваше имя</label>
                  <input
                    type="text"
                    value={tdName}
                    onChange={e => setTdName(e.target.value)}
                    placeholder="Иван Иванов"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Телефон</label>
                  <input
                    type="tel"
                    value={tdPhone}
                    onChange={e => setTdPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Дата</label>
                    <input
                      type="date"
                      value={tdDate}
                      onChange={e => setTdDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      required
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Время</label>
                    <select
                      value={tdTime}
                      onChange={e => setTdTime(e.target.value)}
                      required
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">—</option>
                      {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 uppercase text-sm tracking-widest mt-2"
                >
                  <Calendar size={18} /> Записаться
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};
