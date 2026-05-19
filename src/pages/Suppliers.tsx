
import { useState } from 'react';
import { Search, MapPin, CheckCircle2, MessageCircle, Star, Briefcase, FileCheck, ChevronRight } from 'lucide-react';
import { MOCK_SUPPLIERS } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const cityCoords: Record<string, { lat: number; lng: number; count: number }> = {
  'Москва':          { lat: 55.7558, lng: 37.6173, count: 12 },
  'Санкт-Петербург': { lat: 59.9311, lng: 30.3609, count: 8  },
  'Владивосток':     { lat: 43.1332, lng: 131.9113, count: 15 },
  'Новосибирск':     { lat: 54.9885, lng: 82.9207, count: 6  },
  'Казань':          { lat: 55.8304, lng: 49.0661, count: 4  },
  'Екатеринбург':    { lat: 56.8389, lng: 60.6057, count: 7  },
  'Краснодар':       { lat: 45.0448, lng: 38.9760, count: 5  },
};

const supplierCities = MOCK_SUPPLIERS.map(s => s.город);

const createMarkerIcon = (isSupplier: boolean) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
      <div style="position:absolute;width:32px;height:32px;background:${isSupplier ? 'rgba(250,204,21,0.25)' : 'rgba(250,204,21,0.1)'};border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:${isSupplier ? 14 : 10}px;height:${isSupplier ? 14 : 10}px;background:#FACC15;border-radius:50%;border:2px solid #000;box-shadow:0 0 12px rgba(250,204,21,0.9);"></div>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const MapRussia = ({ onSelect }: { onSelect: (city: string) => void }) => (
  <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl" style={{ height: 'clamp(260px, 50vw, 480px)' }}>
    <MapContainer
      center={[62, 94]}
      zoom={3}
      minZoom={3}
      maxZoom={12}
      maxBounds={[[35, 15], [85, 200]]}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {Object.entries(cityCoords).map(([city, pos]) => {
        const hasSupplier = supplierCities.includes(city);
        const citySuppliers = MOCK_SUPPLIERS.filter(s => s.город === city);
        return (
          <Marker
            key={city}
            position={[pos.lat, pos.lng]}
            icon={createMarkerIcon(hasSupplier)}
          >
            <Popup className="leaflet-popup-dark">
              <div style={{ minWidth: '180px', padding: '4px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '6px', color: '#fff' }}>{city}</div>
                {citySuppliers.length > 0 ? (
                  citySuppliers.map(s => (
                    <div key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#FACC15' }}>{s.название}</div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>⭐ {s.рейтинг} • {s.опыт}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: '#888' }}>{pos.count} поставщиков</div>
                )}
                <button
                  onClick={() => onSelect(city)}
                  style={{ marginTop: '8px', width: '100%', background: '#FACC15', color: '#000', border: 'none', borderRadius: '8px', padding: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Показать всех →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
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
    <>
      <Helmet>
        <title>Поставщики — LSAUTO</title>
        <meta name="description" content="Найдите проверенных поставщиков автомобилей из Китая, Европы и Южной Кореи на карте." />
      </Helmet>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
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
    </>
  );
};
