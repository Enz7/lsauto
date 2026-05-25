
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Filter, ChevronDown, SlidersHorizontal, MapPin, Gauge, Heart, Scale, X as CloseIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';
import { carService } from '../services/apiService';
import type { Car } from '@/types';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleFavorite, favorites, toggleCompare, compareList, allCars } = useApp();
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [generation, setGeneration] = useState(searchParams.get('generation') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [fuel, setFuel] = useState(searchParams.get('fuel') || '');
  const [body, setBody] = useState(searchParams.get('body') || '');
  const [drive, setDrive] = useState(searchParams.get('drive') || '');
  const [engineVolume, setEngineVolume] = useState(searchParams.get('engineVolume') || '');
  const [powerRange, setPowerRange] = useState({ min: searchParams.get('powerMin') || '', max: searchParams.get('powerMax') || '' });
  const [priceRange, setPriceRange] = useState({ min: searchParams.get('priceMin') || '', max: searchParams.get('priceMax') || '' });
  const [yearRange, setYearRange] = useState({ min: searchParams.get('yearMin') || '', max: searchParams.get('yearMax') || '' });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync navigation links (e.g. /catalog?origin=Китай from Home) → state
  const urlOrigin = searchParams.get('origin') || '';
  const urlSearch = searchParams.get('search') || '';
  useEffect(() => { setOrigin(urlOrigin); }, [urlOrigin]);
  useEffect(() => { setSearchTerm(urlSearch); }, [urlSearch]);

  // Sync state → URL
  const syncURL = useCallback(() => {
    const p: Record<string, string> = {};
    if (searchTerm) p.search = searchTerm;
    if (origin) p.origin = origin;
    if (brand) p.brand = brand;
    if (model) p.model = model;
    if (generation) p.generation = generation;
    if (transmission) p.transmission = transmission;
    if (fuel) p.fuel = fuel;
    if (body) p.body = body;
    if (drive) p.drive = drive;
    if (engineVolume) p.engineVolume = engineVolume;
    if (powerRange.min) p.powerMin = powerRange.min;
    if (powerRange.max) p.powerMax = powerRange.max;
    if (priceRange.min) p.priceMin = priceRange.min;
    if (priceRange.max) p.priceMax = priceRange.max;
    if (yearRange.min) p.yearMin = yearRange.min;
    if (yearRange.max) p.yearMax = yearRange.max;
    if (sort !== 'popular') p.sort = sort;
    setSearchParams(p, { replace: true });
  }, [searchTerm, origin, brand, model, generation, transmission, fuel, body, drive, engineVolume, powerRange, priceRange, yearRange, sort, setSearchParams]);

  useEffect(() => { syncURL(); }, [syncURL]);

  // Server-side fetch with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const apiSort = sort === 'price-asc' ? 'price_asc' : sort === 'price-desc' ? 'price_desc' : sort === 'year' ? 'year_desc' : undefined;
        const result = await carService.getAll({
          page,
          limit: 20,
          brand: brand || undefined,
          origin: origin || undefined,
          transmission: transmission || undefined,
          fuel: fuel || undefined,
          minPrice: priceRange.min ? Number(priceRange.min) : undefined,
          maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
          minYear: yearRange.min ? Number(yearRange.min) : undefined,
          maxYear: yearRange.max ? Number(yearRange.max) : undefined,
          search: searchTerm || undefined,
          sort: apiSort,
        });
        setCars(result.data);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch {
        setCars([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [page, brand, origin, transmission, fuel, priceRange, yearRange, searchTerm, sort]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [brand, origin, transmission, fuel, priceRange, yearRange, searchTerm, sort]);

  // Dropdown options derived from context allCars (initial load)
  const allAvailableCars = useMemo(() => allCars.filter(c => c.status === 'approved'), [allCars]);
  const brands = useMemo(() => Array.from(new Set(allAvailableCars.map(c => c.brand))).sort(), [allAvailableCars]);
  const models = useMemo(() => {
    if (!brand) return [];
    return Array.from(new Set(allAvailableCars.filter(c => c.brand === brand).map(c => c.model))).sort();
  }, [brand, allAvailableCars]);
  const generations = useMemo(() => {
    if (!brand || !model) return [];
    return Array.from(new Set(
      allAvailableCars.filter(c => c.brand === brand && c.model === model && c.generation).map(c => c.generation!)
    ));
  }, [brand, model, allAvailableCars]);
  const bodies = useMemo(() =>
    Array.from(new Set(allAvailableCars.filter(c => c.bodyType).map(c => c.bodyType!))).sort(),
    [allAvailableCars]);
  const drives = useMemo(() =>
    Array.from(new Set(allAvailableCars.filter(c => c.driveType).map(c => c.driveType!))).sort(),
    [allAvailableCars]);

  const origins = ['Китай', 'Европа', 'Южная Корея'];
  const transmissions = ['Автомат', 'Механика', 'Редуктор'];
  const fuels = ['Бензин', 'Дизель', 'Электро', 'Гибрид'];

  return (
    <div className="flex flex-col gap-8 pb-20">
      <Helmet>
        <title>Каталог автомобилей | LSAuto — Заказ из Китая, Европы, Кореи</title>
        <meta name="description" content="Широкий выбор автомобилей в наличии и под заказ. Фильтры по марке, цене, стране и характеристикам." />
      </Helmet>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tighter">Каталог</h1>
          <p className="text-gray-400 text-sm">Найдено {total} автомобилей</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex-1 bg-primary text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            <Filter size={18} /> Фильтры
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="lg:hidden flex-1 bg-dark-card border border-white/10 px-4 py-3 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-primary"
          >
            <option value="popular">Топ</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
            <option value="year">Новее</option>
          </select>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Сортировка:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-dark-card border border-white/10 px-4 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="popular">Топ</option>
              <option value="price-asc">Дешевле</option>
              <option value="price-desc">Дороже</option>
              <option value="year">Новее</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-dark-card border border-white/5 p-6 rounded-3xl h-fit sticky top-24 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary" />
              Фильтры
            </h3>
          <button
            onClick={() => {
              setOrigin(''); setBrand(''); setModel(''); setGeneration('');
              setTransmission(''); setFuel(''); setBody(''); setDrive('');
              setEngineVolume(''); setPowerRange({ min: '', max: '' });
              setPriceRange({ min: '', max: '' }); setYearRange({ min: '', max: '' }); setSearchTerm('');
            }}
            className="text-xs text-primary hover:underline"
          >
            Сбросить
          </button>
        </div>

        {/* Марка → Модель → Поколение */}
        <FilterSelect label="Марка" options={brands} value={brand} onChange={(val: string) => { setBrand(val); setModel(''); setGeneration(''); }} />
        {brand && <FilterSelect label="Модель" options={models} value={model} onChange={(val: string) => { setModel(val); setGeneration(''); }} />}
        {brand && model && generations.length > 0 && <FilterSelect label="Поколение" options={generations} value={generation} onChange={setGeneration} />}

        {/* Год выпуска */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Год выпуска</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="От" value={yearRange.min} onChange={(e) => setYearRange({...yearRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
            <input type="number" placeholder="До" value={yearRange.max} onChange={(e) => setYearRange({...yearRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* Кузов */}
        <FilterSelect label="Кузов" options={bodies} value={body} onChange={setBody} />

        {/* Тип двигателя */}
        <FilterSelect label="Тип двигателя" options={fuels} value={fuel} onChange={setFuel} />

        {/* Тип КПП */}
        <FilterSelect label="Тип КПП" options={transmissions} value={transmission} onChange={setTransmission} />

        {/* Привод */}
        <FilterSelect label="Тип привода" options={drives} value={drive} onChange={setDrive} />

        {/* Объём двигателя */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Объём двигателя, л</label>
          <select value={engineVolume} onChange={e => setEngineVolume(e.target.value)} className="w-full bg-dark-input border border-white/10 rounded-xl py-2.5 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary outline-none cursor-pointer">
            <option value="">Все</option>
            {[1.0,1.4,1.5,1.6,1.8,2.0,2.2,2.5,3.0,3.5,4.0].map(v => <option key={v} value={v}>{v} л</option>)}
          </select>
        </div>

        {/* Мощность */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Мощность, л.с</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="От" value={powerRange.min} onChange={(e) => setPowerRange({...powerRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
            <input type="number" placeholder="До" value={powerRange.max} onChange={(e) => setPowerRange({...powerRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* Страна */}
        <FilterSelect label="Страна происхождения" options={origins} value={origin} onChange={setOrigin} />

        {/* Цена */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Цена (₽)</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="От" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
            <input type="number" placeholder="До" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary" />
          </div>
        </div>

          <button className="w-full bg-primary text-black font-bold py-3 rounded-xl transition-all hover:bg-primary-hover mt-4">
            Показать авто ({total})
          </button>
        </aside>

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black" />
            <div className="relative h-full flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-card">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <SlidersHorizontal className="text-primary" />
                  Параметры поиска
                </h3>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="bg-white/5 p-2 rounded-full"
                >
                  <CloseIcon size={24} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-8 pb-32">
                <FilterSelect label="Марка" options={brands} value={brand} onChange={(val: string) => { setBrand(val); setModel(''); setGeneration(''); }} />
                {brand && <FilterSelect label="Модель" options={models} value={model} onChange={(val: string) => { setModel(val); setGeneration(''); }} />}
                {brand && model && generations.length > 0 && <FilterSelect label="Поколение" options={generations} value={generation} onChange={setGeneration} />}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Год выпуска</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="От" value={yearRange.min} onChange={(e) => setYearRange({...yearRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                    <input type="number" placeholder="До" value={yearRange.max} onChange={(e) => setYearRange({...yearRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                  </div>
                </div>
                <FilterSelect label="Кузов" options={bodies} value={body} onChange={setBody} />
                <FilterSelect label="Тип двигателя" options={fuels} value={fuel} onChange={setFuel} />
                <FilterSelect label="Тип КПП" options={transmissions} value={transmission} onChange={setTransmission} />
                <FilterSelect label="Тип привода" options={drives} value={drive} onChange={setDrive} />
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Мощность, л.с</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="От" value={powerRange.min} onChange={(e) => setPowerRange({...powerRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                    <input type="number" placeholder="До" value={powerRange.max} onChange={(e) => setPowerRange({...powerRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                  </div>
                </div>
                <FilterSelect label="Страна" options={origins} value={origin} onChange={setOrigin} />
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Цена (₽)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="От" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                    <input type="number" placeholder="До" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} className="w-full bg-dark-input border border-white/10 rounded-2xl py-4 px-6 text-sm" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full bg-primary text-black font-black py-5 rounded-[2rem] shadow-2xl shadow-primary/20 uppercase tracking-widest"
                >
                  Показать ({total})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Car List */}
        <div className="lg:col-span-3">
          {searchTerm && (
            <div className="mb-6 flex items-center gap-2 text-gray-400">
              Результаты поиска: <span className="text-white font-bold">"{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="text-primary text-xs ml-2 hover:underline">Очистить</button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={48} className="text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {cars.map(car => {
                  const isFav = favorites.includes(car.id);
                  const isCompare = compareList.includes(car.id);
                  return (
                    <div key={car.id} className="relative group">
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(car.id); }}
                          className={`p-3 rounded-full backdrop-blur-md transition-all ${
                            isCompare ? 'bg-primary text-black' : 'bg-black/50 text-white hover:bg-white/20'
                          }`}
                          title="Сравнить"
                        >
                          <Scale size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(car.id); }}
                          className={`p-3 rounded-full backdrop-blur-md transition-all ${
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
                          <img src={car.images?.[0] ?? 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'} alt={car.brand} className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4">
                            <SupplierBadge level={5} />
                          </div>
                        </div>
                        <div className="p-5 flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{car.brand} {car.model}</h2>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {car.city}</span>
                                <span className="flex items-center gap-1"><Gauge size={12} /> {car.mileage.toLocaleString()} км</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary leading-none">{car.price.toLocaleString()} ₽</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{car.description}</p>
                          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                            <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500">
                              {car.origin} • {car.fuel}
                            </div>
                            <div className="text-xs text-primary font-bold">Подробнее</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {cars.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-dark-card inline-block p-6 rounded-3xl mb-4">
                    <Filter size={48} className="text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
                  <p className="text-gray-400">Попробуйте изменить параметры фильтрации</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span key={`dots-${p}`} className="text-gray-600 px-1">…</span>
                        )}
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                            page === p ? 'bg-primary text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      </>
                    ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
