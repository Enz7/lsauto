
import { useState } from 'react';
import { TrendingUp, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

const newsCategories = [
  { id: 'all', name: 'Все новости' },
  { id: 'market', name: 'Рынок' },
  { id: 'reviews', name: 'Обзоры' },
  { id: 'analytics', name: 'Аналитика и Тренды' },
  { id: 'law', name: 'Законодательство' },
  { id: 'tips', name: 'Советы' },
];

export const NewsHub = () => {
  const { trends } = useApp();
  const [activeCat, setActiveCat] = useState('all');

  const articles = [
    {
      id: 1,
      category: 'market',
      title: 'Рынок авто из Китая вырос на 45% за квартал',
      excerpt: 'Эксперты прогнозируют дальнейшее доминирование брендов Li Auto и Zeekr на российском рынке...',
      views: '12.4K',
      date: 'Сегодня',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      category: 'analytics',
      title: 'Сравнение: Geely Monjaro vs Lixiang L7',
      excerpt: 'Что выбрать в 2024 году? Детальный разбор технических характеристик, стоимости обслуживания и ликвидности...',
      views: '8.1K',
      date: 'Вчера',
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      category: 'law',
      title: 'Новые правила утильсбора: что изменится с 1 июня',
      excerpt: 'Разбор постановления правительства и расчет итоговой стоимости растаможки для физлиц...',
      views: '24.5K',
      date: '2 дня назад',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Hero News */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer">
        <img src={articles[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-2xl space-y-4">
          <div className="flex gap-2">
            <span className="bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">Главное сегодня</span>
            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Аналитика</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">{articles[0].title}</h1>
          <p className="text-gray-300 line-clamp-2">{articles[0].excerpt}</p>
          <div className="flex items-center gap-6 text-xs text-gray-400 font-bold uppercase">
            <span className="flex items-center gap-2"><Eye size={14} className="text-primary" /> {articles[0].views} просмотров</span>
            <span>{articles[0].date}</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {newsCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeCat === cat.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-8">
          {articles.map(art => (
            <div key={art.id} className="flex flex-col md:flex-row gap-6 group cursor-pointer">
              <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="space-y-3 py-2">
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest">{newsCategories.find(c => c.id === art.category)?.name}</div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{art.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-600 font-black uppercase">
                  <span>{art.date}</span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full" />
                  <span>{art.views} просмотров</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Widgets */}
        <aside className="space-y-10">
          {/* Trend Widget */}
          <div className="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="bg-primary text-black p-6">
              <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp size={20} />
                Trend System
              </h3>
              <p className="text-[10px] font-bold opacity-70 mt-1 uppercase">Топ запросов за неделю</p>
            </div>
            <div className="p-4 space-y-4">
              {trends.slice(0, 5).map((trend, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-default group">
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">#{i+1} Место</div>
                    <div className="font-bold text-xs">{trend.марка} {trend.модель}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black ${trend.динамика === 'рост' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.динамика === 'рост' ? '↑' : '↓'} {trend.количествоЗапросов}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-3">
              <TrendingUp className="text-primary" />
              Еженедельный дайджест
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">Получайте подборку лучших обзоров и аналитику рынка прямо на почту или в Telegram.</p>
            <button className="w-full bg-primary text-black font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/10">
              Подписаться
            </button>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-3 underline decoration-primary decoration-4 underline-offset-8">
              Популярные теги
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Zeekr', 'Растаможка 2024', 'Lixiang', 'Электромобили', 'Аукционы Кореи', 'BMW из Германии', 'Параллельный импорт'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-primary cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
