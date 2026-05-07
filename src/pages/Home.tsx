
import { Search, Globe, ShieldCheck, Zap, ArrowRight, TrendingUp, Heart, Scale, Car } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { МOCK_CARS, MOCK_TRENDS } from '../data/mockData';
import { useState } from 'react';
import { CustomsCalculator } from '../components/CustomsCalculator';
import { useApp } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';

const Hero = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/catalog?search=${search}`);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent blur-3xl" />
      <div className="max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Найдите авто своей <span className="text-primary">мечты</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl">
          Прямой доступ к лучшим предложениям из Китая, Европы и Южной Кореи. Без посредников и переплат.
        </p>
        
        <div className="bg-dark-card border border-white/10 p-4 rounded-2xl yellow-glow flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Марка, модель или регион..."
              className="w-full bg-dark-input border-none rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-xl font-bold transition-all whitespace-nowrap"
          >
            Найти
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          {['Китай', 'Европа', 'Южная Корея'].map((cat) => (
            <Link 
              key={cat} 
              to={`/catalog?origin=${cat}`}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdvantageCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-6 bg-dark-card border border-white/5 rounded-2xl hover:border-primary/50 transition-all group">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const TrendSummary = () => {
  const { trends } = useApp();
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary" />
          <h2 className="text-2xl font-bold">Тренды недели</h2>
        </div>
        <Link to="/news" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
          Вся аналитика <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {trends.slice(0, 5).map((trend, i) => (
          <div key={i} className="bg-dark-card p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-gray-500 text-xs mb-1">#{i+1} Место</span>
            <span className="font-bold text-xs truncate w-full">{trend.марка}</span>
            <span className="text-[10px] text-gray-400 truncate w-full">{trend.модель}</span>
            <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${trend.динамика === 'рост' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {trend.динамика === 'рост' ? '↑' : '↓'} {trend.количествоЗапросов}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CarCard = ({ car }: { car: any }) => {
  const { toggleFavorite, favorites, toggleCompare, compareList } = useApp();
  const isFav = favorites.includes(car.id);
  const isCompare = compareList.includes(car.id);

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(car.id); }}
          className={`p-2 rounded-full backdrop-blur-md transition-all ${
            isCompare ? 'bg-primary text-black' : 'bg-black/50 text-white hover:bg-white/20'
          }`}
          title="Сравнить"
        >
          <Scale size={16} />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(car.id); }}
          className={`p-2 rounded-full backdrop-blur-md transition-all ${
            isFav ? 'bg-primary text-black' : 'bg-black/50 text-white hover:bg-white/20'
          }`}
        >
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <Link to={`/catalog/${car.id}`} className="block bg-dark-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={car.изображения[0]} alt={car.марка} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {car.теги.map((tag: string) => (
              <span key={tag} className="bg-primary text-black text-[10px] font-bold px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg leading-tight">{car.марка} {car.модель}</h3>
              <p className="text-gray-500 text-sm">{car.год} г. • {car.коробка} • {car.город}</p>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div className="text-xl font-bold text-primary">{car.цена.toLocaleString()} ₽</div>
            <div className="text-xs text-gray-400">Прямой ввоз</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export const Home = () => {
  const { isLoggedIn, allCars } = useApp();

  return (
    <div className="animate-in fade-in duration-700 space-y-32">
      <Helmet>
        <title>LSAuto | Прямой импорт авто из Китая, Европы и Кореи</title>
        <meta name="description" content="Маркетплейс нового поколения для заказа авто из-за границы. Прямые поставщики, калькулятор пошлин, гарантия безопасности." />
      </Helmet>
      
      <div>
        <Hero />
        {!isLoggedIn && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-white/5 pt-20">
            {[
              { val: '500+', lab: 'Проверенных поставщиков' },
              { val: '0 ₽', lab: 'Комиссия сервиса' },
              { val: '14 дней', lab: 'Средний срок доставки' },
              { val: '24/7', lab: 'Поддержка и аналитика' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-primary mb-2">{s.val}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.lab}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomsCalculator />

      {!isLoggedIn && (
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Как мы работаем</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Четыре простых шага к вашему новому автомобилю без переплат посредникам</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Поиск и выбор', desc: 'Найдите авто в каталоге или оставьте запрос на подбор.' },
              { step: '02', title: 'Прямая связь', desc: 'Обсуждайте детали напрямую с верифицированным поставщиком.' },
              { step: '03', title: 'Договор и оплата', desc: 'Прозрачные условия и юридическая чистота каждой сделки.' },
              { step: '04', title: 'Получение авто', desc: 'Доставка в ваш город с полным пакетом документов и ЭПТС.' },
            ].map((step, i) => (
              <div key={i} className="bg-dark-card border border-white/5 p-8 rounded-[2rem] hover:border-primary/20 transition-all group">
                <div className="text-5xl font-black text-white/5 mb-6 group-hover:text-primary/10 transition-colors">{step.step}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <TrendSummary />

      {!isLoggedIn && (
        <section className="bg-primary rounded-[3rem] p-12 md:p-20 text-black overflow-hidden relative">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-none uppercase tracking-tighter max-w-2xl">Готовы найти свой идеальный автомобиль?</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-all">Присоединиться</Link>
              <Link to="/about" className="border-2 border-black px-10 py-5 rounded-2xl font-black uppercase text-sm hover:bg-black hover:text-white transition-all">Узнать больше</Link>
            </div>
          </div>
          <Car className="absolute -right-20 -bottom-10 w-96 h-96 opacity-10 -rotate-12" />
        </section>
      )}

      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Горячие предложения</h2>
          <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            Все автомобили <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allCars.slice(0, 4).map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <section className="py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Почему LSAuto?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Мы создали экосистему, в которой покупка авто из-за границы становится прозрачной, безопасной и выгодной.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AdvantageCard 
            icon={Globe}
            title="Прямой доступ"
            desc="Никаких лишних звеньев. Общайтесь напрямую с проверенными поставщиками со всего мира."
          />
          <AdvantageCard 
            icon={ShieldCheck}
            title="Безопасность"
            desc="Многоступенчатая проверка каждого поставщика и юридическое сопровождение сделки."
          />
          <AdvantageCard 
            icon={Zap}
            title="Скорость"
            desc="Автоматизированная аналитика и поиск позволяют найти лучшие варианты за считанные минуты."
          />
        </div>
        <div className="mt-16 text-center">
          <Link to="/suppliers" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            Смотреть всех поставщиков
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};
