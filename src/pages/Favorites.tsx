
import { useApp } from '../context/AppContext';
import { МOCK_CARS } from '../data/mockData';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

export const Favorites = () => {
  const { favorites, toggleFavorite, allCars } = useApp();
  const favoriteCars = allCars.filter(car => favorites.includes(car.id));

  if (favorites.length === 0) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
          <Heart size={40} />
        </div>
        <h1 className="text-3xl font-bold">Список избранного пуст</h1>
        <p className="text-gray-400 max-w-sm mx-auto">Добавляйте понравившиеся автомобили, чтобы не потерять их и сравнить позже.</p>
        <Link to="/catalog" className="inline-block bg-primary text-black font-bold px-8 py-3 rounded-xl transition-all hover:bg-primary-hover">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Избранное</h1>
          <p className="text-gray-400">Сохранено {favoriteCars.length} автомобиля</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteCars.map(car => (
          <div key={car.id} className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden group relative">
            <button 
              onClick={() => toggleFavorite(car.id)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-red-500 hover:scale-110 transition-all"
            >
              <Trash2 size={18} />
            </button>
            <Link to={`/catalog/${car.id}`}>
              <div className="aspect-video overflow-hidden">
                <img src={car.изображения[0]} alt={car.марка} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{car.марка} {car.модель}</h3>
                    <p className="text-xs text-gray-500">{car.год} г. • {car.город}</p>
                  </div>
                  <div className="text-primary font-bold">{car.цена.toLocaleString()} ₽</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary font-bold">
                  Подробнее <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
