
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Truck, 
  Key, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp, 
  Filter, 
  Star, 
  Award,
  Video,
  Newspaper
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'all', name: 'Все посты', icon: Filter },
  { id: 'new', name: 'Новые авто', icon: TrendingUp },
  { id: 'video', name: 'Видеообзоры', icon: Video },
  { id: 'delivery', name: 'Доставка', icon: Truck },
  { id: 'pickup', name: 'Выдачи', icon: Key },
  { id: 'stories', name: 'Истории', icon: Newspaper },
];

export const SupplierFeed = () => {
  const { notify, setActiveChatId, posts } = useApp();
  const [activeCat, setActiveCat] = useState('all');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-700">
      {/* Sidebar: Categories */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="bg-dark-card border border-white/5 rounded-3xl p-6 sticky top-24">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
            <Filter size={18} /> Лента контента
          </h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeCat === cat.id ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <cat.icon size={16} />
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Топ поставщиков</h4>
            <div className="space-y-4">
              {[
                { name: 'China Auto', deals: 154, rank: 1 },
                { name: 'Euro Car', deals: 122, rank: 2 },
                { name: 'Korea Motors', deals: 98, rank: 3 },
              ].map((sup, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                      {sup.rank}
                    </div>
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{sup.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-bold">{sup.deals} сделок</span>
                </div>
              ))}
            </div>
            <Link to="/suppliers" className="block text-center text-xs text-primary font-bold hover:underline">Весь рейтинг</Link>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="lg:col-span-3 space-y-8">
        {/* Podium Leaders (Top 3 Month) */}
        <section className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-3xl p-8 overflow-hidden relative group">
          <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Star className="text-primary" fill="currentColor" />
            Лидеры месяца
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { name: 'China Auto Export', rank: 'Золото', color: 'text-yellow-500', icon: '🥇' },
              { name: 'Euro Car Import', rank: 'Серебро', color: 'text-gray-400', icon: '🥈' },
              { name: 'Korea Prime Motors', rank: 'Бронза', color: 'text-orange-500', icon: '🥉' },
            ].map((leader, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl text-center space-y-3 hover:border-primary/40 transition-all cursor-pointer">
                <div className="text-4xl">{leader.icon}</div>
                <div>
                  <div className={`text-[10px] font-bold uppercase ${leader.color}`}>{leader.rank}</div>
                  <div className="font-bold text-sm">{leader.name}</div>
                </div>
                <div className="text-[10px] text-gray-500">Рейтинг: 5.0 • 45 сделок</div>
              </div>
            ))}
          </div>
        </section>

        {/* Posts */}
        <div className="space-y-8">
          {posts.filter(p => activeCat === 'all' || p.type === activeCat).map(post => (
            <article key={post.id} className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden group hover:border-white/10 transition-all">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
                    {post.supplier[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{post.supplier}</h4>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">{post.date}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveChatId('s1'); notify('Переходим в чат...', 'info'); }}
                  className="bg-white/5 hover:bg-primary hover:text-black p-2 rounded-xl transition-all"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{post.text}</p>
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {post.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                      <div className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl">
                        <Play fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-white/5 flex items-center gap-6">
                <button onClick={() => notify('Лайк поставлен', 'success')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={18} /> {post.likes}
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                  <MessageCircle size={18} /> {post.comments}
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors ml-auto">
                  <Share2 size={18} /> Поделиться
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
