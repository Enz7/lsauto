
import { useApp } from '../context/AppContext';
import { MOCK_REQUESTS } from '../data/mockData';
import { Briefcase, Search, UserCheck, MessageCircle, Star } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

export const BrokerWorkspace = () => {
  const { userRole, isLoggedIn, allCars, notify, setActiveChatId } = useApp();
  const navigate = useNavigate();

  if (!isLoggedIn || userRole !== 'Посредник') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-blue-500 uppercase tracking-tighter">Broker Workspace</h1>
            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-500/20 uppercase">Эксперт</span>
          </div>
          <p className="text-gray-400 mt-1">Подбор и проверка автомобилей для ваших клиентов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Client Requests for Brokers */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Search className="text-blue-500" size={20} />
            Запросы на подбор
          </h3>
          <div className="space-y-4">
            {MOCK_REQUESTS.map((req, i) => (
              <div key={i} className="bg-dark-card border border-white/5 p-8 rounded-[2rem] space-y-6 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Клиент: Александр</h4>
                      <p className="text-xs text-gray-500">Ищет {req.марка} {req.модель} • Бюджет до {req.бюджет.toLocaleString()} ₽</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveChatId('u1'); navigate('/messages'); }}
                    className="text-blue-500 hover:text-blue-400 p-2 bg-blue-500/5 rounded-xl transition-all"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
                
                <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                  <div className="text-[10px] text-gray-600 font-bold uppercase mb-2">Подходящие варианты из базы:</div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {allCars.slice(0, 2).map(car => (
                      <div key={car.id} className="min-w-[200px] bg-dark-card border border-white/5 rounded-xl p-3 space-y-2">
                        <img src={car.изображения[0]} className="h-24 w-full object-cover rounded-lg" />
                        <div className="text-xs font-bold">{car.марка} {car.модель}</div>
                        <div className="text-[10px] text-primary font-black">{car.цена.toLocaleString()} ₽</div>
                        <button 
                          onClick={() => notify('Вариант предложен клиенту', 'success')}
                          className="w-full bg-blue-500 text-white text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-wider"
                        >
                          Предложить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Broker Stats */}
        <aside className="space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Briefcase size={18} className="text-blue-500" />
              Статистика
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Сделок в работе</span>
                <span className="font-bold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Завершено</span>
                <span className="font-bold text-green-500">28</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4">
                <span className="text-gray-500 text-sm">Комиссия (мес)</span>
                <span className="font-bold text-primary">145,000 ₽</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 p-8 rounded-3xl space-y-4">
            <Star className="text-blue-500" fill="currentColor" />
            <h3 className="font-bold">LSAuto Verified Broker</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Ваш профиль имеет высокий приоритет. Клиенты чаще выбирают ваши предложения.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
