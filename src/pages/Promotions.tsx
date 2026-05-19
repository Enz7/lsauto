
import { useState } from 'react';
import { Tag, Clock, Star, Zap, Gift, CreditCard, Car, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Promo {
  id: string;
  title: string;
  desc: string;
  supplier: string;
  supplierId: string;
  category: 'скидка' | 'рассрочка' | 'подарок' | 'тест-драйв';
  discount?: string;
  badge?: string;
  until: string;
  image: string;
  hot?: boolean;
}

const PROMOS: Promo[] = [
  {
    id: 'p1',
    title: 'Скидка 150 000 ₽ на Geely Monjaro',
    desc: 'При покупке Geely Monjaro до конца месяца — скидка 150 000 ₽ от прайса. Ограниченное количество автомобилей.',
    supplier: 'China Auto Export',
    supplierId: 's1',
    category: 'скидка',
    discount: '−150 000 ₽',
    badge: 'Горячее',
    until: '31 мая 2026',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
    hot: true,
  },
  {
    id: 'p2',
    title: 'Рассрочка 0% на 12 месяцев',
    desc: 'Любой автомобиль из каталога China Auto Export — в рассрочку под 0% на год. Первый взнос от 20%.',
    supplier: 'China Auto Export',
    supplierId: 's1',
    category: 'рассрочка',
    discount: '0%',
    badge: 'Рассрочка',
    until: '30 июня 2026',
    image: 'https://images.unsplash.com/photo-1706118490518-8091816f1c43?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p3',
    title: 'Коврики + тонировка в подарок',
    desc: 'При покупке любого BMW — комплект ковриков и тонировка стёкол в подарок. Установка в Санкт-Петербурге.',
    supplier: 'Euro Car Import',
    supplierId: 's2',
    category: 'подарок',
    badge: 'Подарок',
    until: '15 июня 2026',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p4',
    title: 'Тест-драйв Hyundai Palisade бесплатно',
    desc: 'Запишитесь на бесплатный тест-драйв Hyundai Palisade 2024 во Владивостоке. Маршрут 2 часа, трасса и город.',
    supplier: 'Korea Prime Motors',
    supplierId: 's3',
    category: 'тест-драйв',
    badge: 'Тест-драйв',
    until: '20 июня 2026',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p5',
    title: 'Скидка 5% при Trade-in',
    desc: 'Сдайте свой автомобиль в зачёт и получите скидку 5% на любое авто из нашего каталога. Действует на весь модельный ряд.',
    supplier: 'China Auto Export',
    supplierId: 's1',
    category: 'скидка',
    discount: '−5%',
    until: '30 июня 2026',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p6',
    title: 'Бесплатная доставка по России',
    desc: 'При заказе через LSAuto — доставка вашего авто из Владивостока или Москвы в любой город России бесплатно.',
    supplier: 'Korea Prime Motors',
    supplierId: 's3',
    category: 'подарок',
    badge: 'Доставка',
    until: '31 мая 2026',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800',
    hot: true,
  },
];

const CATEGORY_ICONS = {
  'скидка': Tag,
  'рассрочка': CreditCard,
  'подарок': Gift,
  'тест-драйв': Car,
};

const CATEGORY_LABELS = {
  'скидка': 'Скидки',
  'рассрочка': 'Рассрочка',
  'подарок': 'Подарки',
  'тест-драйв': 'Тест-драйв',
};

export const Promotions = () => {
  const [filter, setFilter] = useState<string>('все');

  const categories = ['все', 'скидка', 'рассрочка', 'подарок', 'тест-драйв'] as const;
  const filtered = filter === 'все' ? PROMOS : PROMOS.filter(p => p.category === filter);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
          <Zap size={14} /> Акции и спецпредложения
        </div>
        <h1 className="text-4xl md:text-5xl font-black">Выгодные предложения</h1>
        <p className="text-gray-400 text-lg">Эксклюзивные скидки, подарки и специальные условия от проверенных поставщиков</p>
      </div>

      {/* Hot banner */}
      <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-[2rem] p-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20">
          <img src={PROMOS[0].image} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase">
            <Zap size={14} fill="currentColor" /> Горячее предложение
          </div>
          <h2 className="text-3xl font-black">{PROMOS[0].title}</h2>
          <p className="text-gray-300 text-sm">{PROMOS[0].desc}</p>
          <div className="flex items-center gap-4 mt-4">
            <Link
              to={`/suppliers/${PROMOS[0].supplierId}`}
              className="bg-primary text-black font-black px-6 py-3 rounded-2xl text-sm hover:bg-primary-hover transition-all flex items-center gap-2"
            >
              Узнать подробнее <ChevronRight size={16} />
            </Link>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock size={14} /> до {PROMOS[0].until}
            </div>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => {
          const Icon = cat === 'все' ? Star : CATEGORY_ICONS[cat];
          const label = cat === 'все' ? 'Все акции' : CATEGORY_LABELS[cat];
          const count = cat === 'все' ? PROMOS.length : PROMOS.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                filter === cat ? 'bg-primary text-black' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={15} /> {label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${filter === cat ? 'bg-black/20' : 'bg-white/10'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Promo grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(promo => {
          const Icon = CATEGORY_ICONS[promo.category];
          return (
            <div
              key={promo.id}
              className={`bg-dark-card border rounded-3xl overflow-hidden flex flex-col group transition-all hover:scale-[1.01] ${
                promo.hot ? 'border-primary/30' : 'border-white/5'
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {promo.hot && (
                    <span className="flex items-center gap-1 bg-primary text-black text-[10px] font-black px-3 py-1.5 rounded-full">
                      <Zap size={10} fill="currentColor" /> Горячее
                    </span>
                  )}
                  {promo.badge && (
                    <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/20">
                      {promo.badge}
                    </span>
                  )}
                </div>
                {promo.discount && (
                  <div className="absolute bottom-4 right-4 bg-primary text-black font-black text-lg px-4 py-2 rounded-2xl shadow-xl">
                    {promo.discount}
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="font-black text-base leading-snug group-hover:text-primary transition-colors">{promo.title}</h3>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3">{promo.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold">{promo.supplier}</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={11} /> до {promo.until}
                  </span>
                </div>
                <Link
                  to={`/suppliers/${promo.supplierId}`}
                  className="block w-full text-center bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-bold py-3 rounded-2xl text-sm transition-all"
                >
                  Перейти к поставщику
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-dark-card border border-white/5 rounded-3xl">
          <Tag size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold">Нет акций в этой категории</h3>
          <p className="text-gray-500 mt-2">Загляните позже — поставщики регулярно обновляют предложения</p>
        </div>
      )}
    </div>
  );
};
