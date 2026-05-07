
import { useApp } from '../context/AppContext';
import { МOCK_CARS } from '../data/mockData';
import { X, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Comparison = () => {
  const { compareList, toggleCompare, allCars } = useApp();
  const cars = allCars.filter(c => compareList.includes(c.id));

  if (cars.length === 0) {
    return (
      <div className="text-center py-20">
        <Scale size={48} className="mx-auto mb-4 text-gray-700" />
        <h1 className="text-2xl font-bold">Список сравнения пуст</h1>
        <Link to="/catalog" className="text-primary hover:underline mt-4 inline-block">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 overflow-x-auto pb-10">
      <div className="flex justify-between items-center min-w-[800px]">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Scale className="text-primary" />
          Сравнение автомобилей
        </h1>
        <span className="text-gray-500">{cars.length} модели</span>
      </div>

      <div className="min-w-[800px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 p-4"></th>
              {cars.map(car => (
                <th key={car.id} className="w-1/4 p-4 relative group">
                  <button 
                    onClick={() => toggleCompare(car.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                  <img src={car.изображения[0]} className="w-full aspect-video object-cover rounded-2xl mb-4 border border-white/10" />
                  <div className="text-left">
                    <div className="font-bold">{car.марка} {car.модель}</div>
                    <div className="text-primary font-black mt-1">{car.цена.toLocaleString()} ₽</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { label: 'Год выпуска', key: 'год' },
              { label: 'Страна', key: 'страна' },
              { label: 'Топливо', key: 'топливо' },
              { label: 'Коробка', key: 'коробка' },
              { label: 'Пробег', key: 'пробег', suffix: ' км' },
              { label: 'Город', key: 'город' },
            ].map((row, i) => {
              const values = cars.map(c => (c as any)[row.key]);
              const isDifferent = new Set(values).size > 1;

              return (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <td className="p-6 text-gray-500 font-medium">{row.label}</td>
                  {cars.map(car => (
                    <td key={car.id} className={`p-6 font-bold ${isDifferent ? 'text-primary' : 'text-gray-400'}`}>
                      {(car as any)[row.key].toLocaleString()}{row.suffix || ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
