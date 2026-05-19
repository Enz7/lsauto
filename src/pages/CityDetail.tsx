
import { useParams, Link } from 'react-router-dom';
import { MOCK_SUPPLIERS, МOCK_CARS } from '../data/mockData';
import { MapPin, Star, TrendingUp, Users, ChevronLeft, Building2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CityDetail = () => {
  const { city } = useParams();
  const { setActiveChatId, addedCars } = useApp();
  
  const citySuppliers = MOCK_SUPPLIERS.filter(s => s.город === city);
  const cityCarsCount = [...addedCars, ...МOCK_CARS].filter(c => c.город === city).length;
  
  const avgRating = citySuppliers.length > 0 
    ? (citySuppliers.reduce((acc, s) => acc + s.рейтинг, 0) / citySuppliers.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Link to="/suppliers" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
        <ChevronLeft size={20} /> Все города
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-primary">
            <Building2 size={40} />
            <h1 className="text-5xl font-black">{city}</h1>
          </div>
          <p className="text-gray-400 max-w-xl">
            Обзор автомобильного рынка в г. {city}. Здесь сосредоточены крупнейшие логистические хабы и проверенные импортеры из Европы и Азии.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          {[
            { label: 'Поставщиков', val: citySuppliers.length, icon: Users },
            { label: 'Средний рейтинг', val: avgRating, icon: Star },
            { label: 'Авто в наличии', val: cityCarsCount, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-3xl space-y-2">
              <stat.icon size={20} className="text-primary" />
              <div className="text-2xl font-black">{stat.val}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Верифицированные поставщики в г. {city}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citySuppliers.map(supplier => (
            <div key={supplier.id} className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src={supplier.фотографии[0]} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">{supplier.название}</h3>
                      <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold">
                        <CheckCircle2 size={12} /> ПРОВЕРЕН
                      </div>
                    </div>
                  </div>
                  <div className="text-primary font-bold">⭐ {supplier.рейтинг}</div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{supplier.описание}</p>
                <div className="pt-4 flex gap-2">
                  <Link to={`/suppliers/${supplier.id}`} className="flex-grow bg-white/5 hover:bg-white/10 text-center py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5">
                    Профиль
                  </Link>
                  <button 
                    onClick={() => setActiveChatId(supplier.id)}
                    className="bg-primary hover:bg-primary-hover text-black px-4 py-2.5 rounded-xl transition-all"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {citySuppliers.length === 0 && (
          <div className="bg-dark-card border border-white/5 rounded-3xl p-20 text-center space-y-4">
            <MapPin size={48} className="text-gray-700 mx-auto" />
            <h3 className="text-xl font-bold text-gray-500">В этом городе пока нет активных поставщиков</h3>
            <Link to="/register" className="text-primary hover:underline">Стать первым в г. {city}</Link>
          </div>
        )}
      </div>
    </div>
  );
};
