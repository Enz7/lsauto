
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserX, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const AdminPanel = () => {
  const { isLoggedIn, addedCars, approveCar, rejectCar } = useApp();
  const pendingCars = addedCars.filter((c: any) => c.status === 'pending');

  if (!isLoggedIn) return <div className="py-20 text-center">Доступ запрещен</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <ShieldCheck className="text-primary" />
          Панель модерации (ADMIN)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-white/5 p-6 rounded-3xl">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">На проверке (Docs)</div>
          <div className="text-3xl font-black">14</div>
        </div>
        <div className="bg-dark-card border border-white/5 p-6 rounded-3xl text-yellow-500">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Подозрительный фрод</div>
          <div className="text-3xl font-black">3</div>
        </div>
        <div className="bg-dark-card border border-white/5 p-6 rounded-3xl text-green-500">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Всего сделок</div>
          <div className="text-3xl font-black">284</div>
        </div>
      </div>

      <div className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="text-primary" />
          Журнал антифрода
        </div>
        <div className="divide-y divide-white/5">
          {[
            { user: 'AutoImport77', action: 'Дубликат устройства', level: 'Высокий' },
            { user: 'IvanBroker', action: 'Подозрительная активность в чате', level: 'Средний' },
            { user: 'KoreaPrime', action: 'Неудачная видео-верификация', level: 'Высокий' },
          ].map((log, i) => (
            <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
              <div>
                <div className="font-bold">{log.user}</div>
                <div className="text-xs text-gray-500">{log.action}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${log.level === 'Высокий' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {log.level}
                </span>
                <button className="bg-white/5 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                  <UserX size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-card border border-white/5 rounded-3xl p-8">
        <h3 className="font-bold mb-6 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Модерация новых объявлений ({pendingCars.length})
        </h3>
        <div className="space-y-4">
          {pendingCars.map((car: any) => (
            <div key={car.id} className="p-6 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-6">
                <img src={car.изображения[0]} className="w-16 h-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold">{car.марка} {car.модель}</div>
                  <div className="text-xs text-primary">{car.цена.toLocaleString()} ₽ • {car.страна}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => approveCar(car.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition-all"
                >
                  <CheckCircle2 size={14} /> Одобрить
                </button>
                <button 
                  onClick={() => rejectCar(car.id)}
                  className="bg-white/5 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 transition-all"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
          {pendingCars.length === 0 && (
            <div className="text-center py-10 text-gray-600 italic text-sm">
              Очередь модерации пуста
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
