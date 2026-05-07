
import { useState } from 'react';
import { Search, MapPin, CheckCircle2, MessageCircle, Star, Briefcase, FileCheck, ChevronRight } from 'lucide-react';
import { MOCK_SUPPLIERS } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const cityCoords: Record<string, { x: number, y: number, count: number }> = {
  'Москва': { x: 25, y: 65, count: 12 },
  'Санкт-Петербург': { x: 20, y: 45, count: 8 },
  'Владивосток': { x: 90, y: 85, count: 15 },
  'Новосибирск': { x: 55, y: 75, count: 6 },
  'Казань': { x: 32, y: 68, count: 4 },
  'Екатеринбург': { x: 42, y: 70, count: 7 },
  'Краснодар': { x: 22, y: 85, count: 5 }
};

const MapRussia = ({ onSelect }: { onSelect: (city: string) => void }) => (
  <div className="relative w-full aspect-[21/9] bg-[#0A0A0A] rounded-[2rem] border border-white/5 overflow-hidden group shadow-2xl">
    {/* Grid Overlay */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
      style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
    />
    
    {/* Stylized Russia Map */}
    <div className="absolute inset-0 p-12 opacity-10 flex items-center justify-center">
      <svg viewBox="0 0 1000 450" className="w-full h-full fill-white transition-all duration-700">
        <path d="M50,150 L120,130 L180,110 L250,115 L320,100 L400,110 L500,80 L650,60 L750,75 L850,50 L950,80 L980,150 L960,250 L900,320 L800,380 L650,420 L450,430 L250,420 L150,380 L80,320 L40,250 Z" />
      </svg>
    </div>
    
    {/* Dynamic City Markers */}
    {Object.entries(cityCoords).map(([name, pos]) => (
      <button
        key={name}
        onClick={() => onSelect(name)}
        className="absolute -translate-x-1/2 -translate-y-1/2 group/marker z-20"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <div className="relative flex items-center justify-center">
          {/* Outer Pulse */}
          <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping opacity-40 group-hover/marker:scale-150 transition-all" />
          
          {/* Inner Glow */}
          <div className="absolute w-6 h-6 bg-primary/40 rounded-full blur-md" />
          
          {/* Core Dot */}
          <div className="w-3 h-3 bg-primary rounded-full border-2 border-black shadow-[0_0_15px_rgba(250,204,21,1)] group-hover/marker:scale-125 transition-transform" />
          
          {/* Label Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/marker:opacity-100 transition-all translate-y-2 group-hover/marker:translate-y-0 pointer-events-none">
            <div className="bg-black/90 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 tracking-tighter">Поставщиков: {pos.count}</div>
              <div className="text-sm font-black text-white whitespace-nowrap">{name}</div>
            </div>
            {/* Tooltip Arrow */}
            <div className="w-2 h-2 bg-black border-r border-b border-white/10 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        </div>
      </button>
    ))}
    
    {/* Map Legend */}
    <div className="absolute bottom-8 left-8 flex gap-6 items-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Активные узлы</span>
      </div>
      <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-xs text-gray-500">
        Всего {Object.keys(cityCoords).length} регионов охвачено
      </div>
    </div>

    <div className="absolute top-8 left-8">
      <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">Geo Hub LSAuto</h3>
      <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed italic">Нажмите на маркер города, чтобы увидеть локальных дилеров и аналитику рынка</p>
    </div>
  </div>
);

export const Suppliers = () => {
  const { setActiveChatId } = useApp();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<'map' | 'list'>('map');
  const [selectedCity, setSelectedCity] = useState('');
  const [search, setSearch] = useState('');

  const filteredSuppliers = MOCK_SUPPLIERS.filter(s => {
    return (!selectedCity || s.город === selectedCity) &&
           (!search || s.название.toLowerCase().includes(search.toLowerCase()));
  });

  const handleWrite = (id: string) => {
    setActiveChatId(id);
    navigate('/messages');
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-bold">География поставок</h1>
          <p className="text-gray-400">Найдите надежного партнера в вашем регионе или через крупные хабы</p>
        </div>
        
        <div className="flex bg-dark-card border border-white/10 p-1 rounded-xl">
          <button 
            onClick={() => setViewType('map')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'map' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Карта
          </button>
          <button 
            onClick={() => setViewType('list')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'list' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Список
          </button>
        </div>
      </div>

      {viewType === 'map' ? (
        <MapRussia onSelect={(city) => navigate(`/city/${city}`)} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {Object.keys(cityCoords).sort().map(city => (
            <Link 
              key={city}
              to={`/city/${city}`}
              className="bg-dark-card border border-white/5 p-6 rounded-2xl hover:border-primary/40 transition-all group"
            >
              <div className="text-xs text-gray-500 uppercase font-bold mb-2">Город</div>
              <div className="text-lg font-bold group-hover:text-primary transition-colors">{city}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-black">{cityCoords[city].count} ПОСТАВЩИКОВ</span>
                <ChevronRight size={14} className="text-gray-700" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pt-10 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold">Все проверенные поставщики</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-card border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCity('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCity ? 'bg-primary text-black' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'}`}
          >
            Все города
          </button>
          {Object.keys(cityCoords).map(city => (
            <button 
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCity === city ? 'bg-primary text-black' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden flex flex-col group">
            <div className="relative h-48">
              <img src={supplier.фотографии[0]} alt={supplier.название} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                {supplier.документыСтатус === 'проверен' ? (
                  <div className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl">
                    <CheckCircle2 size={12} /> ПРОВЕРЕН
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-gray-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                    В ОБРАБОТКЕ
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{supplier.название}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                    <MapPin size={14} /> {supplier.город}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
                  <Star size={14} fill="currentColor" /> {supplier.рейтинг}
                </div>
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-3">
                {supplier.описание}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Опыт работы</div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Briefcase size={14} className="text-primary" /> {supplier.опыт}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Документы</div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <FileCheck size={14} className="text-primary" /> {supplier.документыСтатус}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link to={`/suppliers/${supplier.id}`} className="flex-grow bg-white/5 hover:bg-white/10 border border-white/10 text-center py-3 rounded-xl text-sm font-bold transition-all">
                  Профиль
                </Link>
                <button 
                  onClick={() => handleWrite(supplier.id)}
                  className="flex-grow bg-primary hover:bg-primary-hover text-black py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle size={18} /> Написать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-20 bg-dark-card border border-white/5 rounded-3xl">
          <MapPin size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold">В этом городе пока нет поставщиков</h3>
          <p className="text-gray-500 mt-2">Попробуйте выбрать другой город или оставить заявку</p>
          <Link to="/register" className="inline-block mt-6 text-primary font-bold hover:underline">
            Стать поставщиком в г. {selectedCity}
          </Link>
        </div>
      )}
    </div>
  );
};
