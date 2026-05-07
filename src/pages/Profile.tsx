
import { useApp } from '../context/AppContext';
import { ShieldCheck, Package, Heart, History, Settings, LogOut, Star } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export const Profile = () => {
  const { isLoggedIn, userRole, logout, favorites, compareList, isVerified } = useApp();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const getRank = (level: number) => {
    if (level >= 7) return { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (level >= 5) return { name: 'Platinum', color: 'text-gray-300', bg: 'bg-gray-300/10' };
    if (level >= 3) return { name: 'Gold', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/10' };
  };

  const rank = getRank(userRole === 'Поставщик' ? 5 : 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-blue-500/10" />
        <div className="px-10 pb-10 -mt-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex items-end gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-dark-card border-4 border-black rounded-3xl flex items-center justify-center text-primary font-black text-3xl shadow-2xl">
                  {userRole?.[0]}
                </div>
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-black">
                    <ShieldCheck size={16} />
                  </div>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black">{userRole === 'Поставщик' ? 'China Auto Export' : 'Александр'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rank.bg} ${rank.color}`}>
                    {rank.name} Уровень
                  </span>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{userRole}</span>
                </div>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all">
              <LogOut size={18} /> Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="text-primary" size={20} /> Активность
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Заявка на Zeekr 001', date: 'Сегодня, 12:45', status: 'В обработке' },
                { title: 'Добавлено в избранное: BMW X5', date: 'Вчера, 18:20', status: 'Завершено' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                  <div>
                    <div className="font-bold text-sm">{item.title}</div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{item.date}</div>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-black px-2 py-1 rounded-lg">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-lg">Статистика</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Heart size={14}/> Избранное</span>
                <span className="font-black">{favorites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Package size={14}/> Сравнение</span>
                <span className="font-black">{compareList.length}</span>
              </div>
              <div className="flex justify-between items-center text-yellow-500">
                <span className="text-sm flex items-center gap-2 font-bold"><Star size={14}/> Рейтинг</span>
                <span className="font-black">4.9</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
            <Settings size={18} /> Настройки аккаунта
          </button>

          <Link to="/admin" className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-3xl text-xs font-bold flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/20 transition-all">
            <ShieldCheck size={18} /> Панель администратора
          </Link>
        </aside>
      </div>
    </div>
  );
};
