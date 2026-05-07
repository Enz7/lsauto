
import { TrendingUp, TrendingDown, Award, BarChart3, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TrendCard = ({ trend, rank }: { trend: any, rank: number }) => {
  const barWidth = Math.min(100, (trend.количествоЗапросов / 500) * 100);
  
  return (
    <div className="bg-dark-card border border-white/5 p-6 rounded-2xl space-y-4 group hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-4xl font-black text-white/10 group-hover:text-primary/20 transition-colors">
            {rank < 10 ? `0${rank}` : rank}
          </div>
          <div>
            <h3 className="text-xl font-bold">{trend.марка} {trend.модель}</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                {trend.динамика === 'рост' ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                {trend.количествоЗапросов} запросов за неделю
              </span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase ${trend.динамика === 'рост' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend.динамика === 'рост' ? 'Растущий тренд' : 'Падение интереса'}
        </div>
      </div>
      
      {/* Mini Visual Chart Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 delay-300 ${trend.динамика === 'рост' ? 'bg-primary' : 'bg-gray-600'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

export const Trends = () => {
  const { trends } = useApp();

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="text-primary" />
            Аналитика TREND System
          </h1>
          <p className="text-gray-400">Реальный спрос на основе живых запросов клиентов</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl flex gap-1">
          <button className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold">Неделя</button>
          <button className="px-4 py-2 text-gray-400 hover:text-white rounded-lg text-sm font-medium">Месяц</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-primary" />
            <h2 className="text-2xl font-bold">TOP запросов недели</h2>
          </div>
          {trends.sort((a,b) => b.количествоЗапросов - a.количествоЗапросов).map((trend, i) => (
            <TrendCard key={i} trend={trend} rank={i + 1} />
          ))}
        </div>

        <aside className="space-y-8">
          <div className="bg-dark-card border border-white/5 p-6 rounded-3xl space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Zap className="text-primary" />
              Горячие запросы
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Бюджет 3-5 млн ₽', count: '1,240 запросов', growth: '+15%' },
                { label: 'Электромобили из Китая', count: '890 запросов', growth: '+24%' },
                { label: 'Дизельные кроссоверы', count: '650 запросов', growth: '-5%' },
                { label: 'Новинки Юж. Кореи', count: '420 запросов', growth: '+10%' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{item.label}</span>
                    <span className={`text-[10px] font-black ${item.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {item.growth}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{item.count}</div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${Math.random() * 60 + 40}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-8 rounded-3xl relative overflow-hidden group">
            <Clock className="absolute -right-4 -bottom-4 text-primary/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-xl font-bold mb-3 relative z-10">Хотите быть в тренде?</h3>
            <p className="text-sm text-gray-400 mb-6 relative z-10">Получайте еженедельный отчет по самым выгодным направлениям импорта.</p>
            <button className="w-full bg-primary text-black font-bold py-3 rounded-xl relative z-10 hover:shadow-lg hover:shadow-primary/20 transition-all">
              Подписаться на отчет
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
