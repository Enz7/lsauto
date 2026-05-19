
import { useState } from 'react';



const newsCategories = [
  { id: 'all', name: 'Все новости' },
  { id: 'market', name: 'Рынок' },
  { id: 'reviews', name: 'Обзоры' },
  { id: 'analytics', name: 'Аналитика и Тренды' },
  { id: 'law', name: 'Законодательство' },
  { id: 'tips', name: 'Советы' },
];

export const NewsHub = () => {
  const [activeCat, setActiveCat] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const articles = [
    {
      id: 1,
      category: 'market',
      title: 'Рынок авто из Китая вырос на 45% за квартал',
      excerpt: 'Эксперты прогнозируют дальнейшее доминирование брендов Li Auto и Zeekr на российском рынке...',
      content: 'Согласно последним данным аналитических агентств, спрос на премиальные китайские электромобили и гибриды в России показал рекордный рост. Основными факторами стали расширение дилерских сетей и упрощение логистики через дружественные страны. Лидерами продаж остаются Zeekr 001 и Li Auto L7.',
      views: '12.4K',
      date: 'Сегодня',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      category: 'analytics',
      title: 'Сравнение: Geely Monjaro vs Lixiang L7',
      excerpt: 'Что выбрать в 2024 году? Детальный разбор технических характеристик...',
      content: 'Geely Monjaro остается одним из самых ликвидных автомобилей на вторичном рынке, в то время как Lixiang L7 привлекает технологиями и комфортом. При ввозе из Китая разница в цене может достигать 1.5 млн рублей в зависимости от способа растаможки.',
      views: '8.1K',
      date: 'Вчера',
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      category: 'law',
      title: 'Новые правила утильсбора: что изменится с 1 июня',
      excerpt: 'Разбор постановления правительства и расчет итоговой стоимости растаможки...',
      content: 'С 1 июня вступают в силу поправки, ужесточающие контроль за оплатой утилизационного сбора для коммерческих партий авто. Для физических лиц, ввозящих авто для личного пользования, правила остаются прежними, но требуют более тщательной подготовки документов.',
      views: '24.5K',
      date: '2 дня назад',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedArticle(null)} />
          <div className="relative bg-dark-card border border-white/10 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <img src={selectedArticle.image} className="w-full h-40 sm:h-64 object-cover shrink-0" />
            <div className="p-5 sm:p-10 overflow-y-auto space-y-6">
               <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{newsCategories.find(c => c.id === selectedArticle.category)?.name}</div>
               <h2 className="text-3xl font-black leading-tight">{selectedArticle.title}</h2>
               <p className="text-gray-400 leading-relaxed text-lg">{selectedArticle.content}</p>
               <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs text-gray-500 font-bold uppercase">{selectedArticle.date} • {selectedArticle.views} глаз</div>
                  <button onClick={() => setSelectedArticle(null)} className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl font-bold transition-all">Закрыть</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero News */}
      <section
        onClick={() => setSelectedArticle(articles[0])}
        className="relative h-[240px] sm:h-[380px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden group cursor-pointer border border-white/5"
      >
        <img src={articles[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 max-w-2xl space-y-3">
          <div className="flex gap-2">
            <span className="bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Главное сегодня</span>
          </div>
          <h1 className="text-xl sm:text-4xl md:text-6xl font-black leading-tight uppercase tracking-tighter">{articles[0].title}</h1>
          <p className="hidden sm:block text-gray-300 line-clamp-2">{articles[0].excerpt}</p>
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
          {articles
            .filter(art => activeCat === 'all' || art.category === activeCat)
            .filter(art => !activeTag || art.title.includes(activeTag) || art.excerpt.includes(activeTag))
            .map(art => (
            <div 
              key={art.id} 
              onClick={() => setSelectedArticle(art)}
              className="flex flex-col md:flex-row gap-6 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500 border border-transparent hover:border-white/5 p-4 rounded-3xl transition-all"
            >
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
          <div className="space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-3">
              Популярные теги
              {activeTag && <button onClick={() => setActiveTag(null)} className="text-[10px] text-primary underline ml-auto">Сброс</button>}
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Zeekr', 'Растаможка 2024', 'Lixiang', 'Электромобили', 'Аукционы Кореи', 'BMW из Германии', 'Параллельный импорт'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${activeTag === tag ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/5 text-gray-400 hover:text-primary'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
