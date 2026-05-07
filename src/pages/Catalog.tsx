
import { useState, useMemo, useEffect } from 'react';
import { Filter, ChevronDown, SlidersHorizontal, MapPin, Gauge, Heart, Scale } from 'lucide-react';
import { МOCK_CARS } from '../data/mockData';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';

const SupplierBadge = ({ level }: { level: number }) => {
  const getRank = (l: number) => {
    if (l >= 7) return { name: 'Diamond', color: 'bg-blue-500', icon: '💎' };
    if (l >= 5) return { name: 'Platinum', color: 'bg-indigo-400', icon: '🏆' };
    if (l >= 3) return { name: 'Gold', color: 'bg-yellow-500', icon: '⭐' };
    return { name: 'Verified', color: 'bg-green-500', icon: '✅' };
  };
  const rank = getRank(level);
  return (
    <div className={`${rank.color} text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg`}>
      <span>{rank.icon}</span>
      <span>{rank.name}</span>
    </div>
  );
};

const FilterSelect = ({ label, options, value, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-input border border-white/10 rounded-xl py-2.5 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
      >
        <option value="">Все</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
    </div>
  </div>
);

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const { toggleFavorite, favorites, toggleCompare, compareList, addedCars } = useApp();
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuel, setFuel] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [yearRange, setYearRange] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setOrigin(searchParams.get('origin') || '');
  }, [searchParams]);

  const allAvailableCars = useMemo(() => [
    ...addedCars.filter((c: any) => c.status === 'approved'), 
    ...МOCK_CARS
  ], [addedCars]);
  
  const brands = useMemo(() => Array.from(new Set(allAvailableCars.map(c => c.марка))), [allAvailableCars]);
  const models = useMemo(() => {
    if (!brand) return [];
    return Array.from(new Set(allAvailableCars.filter(c => c.марка === brand).map(c => c.модель)));
  }, [brand, allAvailableCars]);

  const origins = ['Китай', 'Европа', 'Южная Корея'];
  const transmissions = ['Автомат', 'Механика', 'Редуктор'];
  const fuels = ['Бензин', 'Дизель', 'Электро', 'Гибрид'];

  const filteredAndSortedCars = useMemo(() => {
    let result = allAvailableCars.filter(car => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        car.марка.toLowerCase().includes(searchLower) || 
        car.модель.toLowerCase().includes(searchLower) ||
        car.город.toLowerCase().includes(searchLower);
      
      return matchesSearch &&
             (!origin || car.страна === origin) &&
             (!brand || car.марка === brand) &&
             (!model || car.модель === model) &&
             (!transmission || car.коробка === transmission) &&
             (!fuel || car.топливо === fuel) &&
             (!priceRange.min || car.цена >= Number(priceRange.min)) &&
             (!priceRange.max || car.цена <= Number(priceRange.max)) &&
             (!yearRange.min || car.год >= Number(yearRange.min)) &&
             (!yearRange.max || car.год <= Number(yearRange.max));
    });

    if (sort === 'price-asc') result.sort((a, b) => a.цена - b.цена);
    if (sort === 'price-desc') result.sort((a, b) => b.цена - a.цена);
    if (sort === 'year') result.sort((a, b) => b.год - a.год);

    return result;
  }, [allAvailableCars, searchTerm, origin, brand, model, transmission, fuel, priceRange, sort]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <Helmet>
        <title>Каталог автомобилей | LSAuto — Заказ из Китая, Европы, Кореи</title>
        <meta name="description" content="Широкий выбор автомобилей в наличии и под заказ. Фильтры по марке, цене, стране и характеристикам." />
      </Helmet>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Каталог автомобилей</h1>
          <p className="text-gray-400">Найдено {filteredAndSortedCars.length} предложений</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Сортировка:</span>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-dark-card border border-white/10 px-4 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-primary"
          >
            <option value="popular">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="year">Новее по году</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-dark-card border border-white/5 p-6 rounded-2xl h-fit sticky top-24">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary" />
              Фильтры
            </h3>
          <button 
            onClick={() => {
              setOrigin(''); setBrand(''); setModel(''); setTransmission(''); setFuel('');
              setPriceRange({ min: '', max: '' }); setYearRange({ min: '', max: '' }); setSearchTerm('');
            }}
            className="text-xs text-primary hover:underline"
          >
            Сбросить
          </button>
        </div>

        <FilterSelect label="Страна происхождения" options={origins} value={origin} onChange={setOrigin} />
        <FilterSelect label="Марка" options={brands} value={brand} onChange={(val: string) => { setBrand(val); setModel(''); }} />
        {brand && <FilterSelect label="Модель" options={models} value={model} onChange={setModel} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Цена (₽)</label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="От"
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary"
            />
            <input 
              type="number" 
              placeholder="До"
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Год выпуска</label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="От"
              value={yearRange.min}
              onChange={(e) => setYearRange({...yearRange, min: e.target.value})}
              className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary"
            />
            <input 
              type="number" 
              placeholder="До"
              value={yearRange.max}
              onChange={(e) => setYearRange({...yearRange, max: e.target.value})}
              className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

          <FilterSelect label="Коробка передач" options={transmissions} value={transmission} onChange={setTransmission} />
          <FilterSelect label="Тип топлива" options={fuels} value={fuel} onChange={setFuel} />
          
          <button className="w-full bg-primary text-black font-bold py-3 rounded-xl transition-all hover:bg-primary-hover mt-4">
            Показать авто
          </button>
        </aside>

        {/* Car List */}
        <div className="lg:col-span-3">
          {searchTerm && (
            <div className="mb-6 flex items-center gap-2 text-gray-400">
              Результаты поиска: <span className="text-white font-bold">"{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="text-primary text-xs ml-2 hover:underline">Очистить</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedCars.map(car => {
              const isFav = favorites.includes(car.id);
              const isCompare = compareList.includes(car.id);
              return (
                <div key={car.id} className="relative group">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(car.id); }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        isCompare ? 'bg-primary text-black' : 'bg-black/50 text-white hover:bg-white/20'
                      }`}
                      title="Сравнить"
                    >
                      <Scale size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(car.id); }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        isFav ? 'bg-primary text-black' : 'bg-black/50 text-white hover:bg-white/20'
                      }`}
                    >
                      <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <Link 
                    to={`/catalog/${car.id}`}
                    className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 transition-all flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/9]">
                      <img src={car.изображения[0]} alt={car.марка} className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4">
                        <SupplierBadge level={car.id.startsWith('car-') ? 1 : 5} />
                      </div>
                    </div>
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-bold">{car.марка} {car.модель}</h2>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {car.город}</span>
                            <span className="flex items-center gap-1"><Gauge size={12} /> {car.пробег.toLocaleString()} км</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary leading-none">{car.цена.toLocaleString()} ₽</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{car.описание}</p>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                        <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500">
                          {car.страна} • {car.топливо}
                        </div>
                        <div className="text-xs text-primary font-bold">Подробнее</div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredAndSortedCars.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-dark-card inline-block p-6 rounded-3xl mb-4">
                <Filter size={48} className="text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
              <p className="text-gray-400">Попробуйте изменить параметры фильтрации</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
