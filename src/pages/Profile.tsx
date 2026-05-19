
import { useApp } from '../context/AppContext';
import { ShieldCheck, Package, Heart, Settings, LogOut, Star, Car, TrendingUp, Users, Award } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const Profile = () => {
  const { isLoggedIn, userRole, logout, favorites, compareList, isVerified, deals, addedCars, currentUser } = useApp();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const isSupplier = userRole === 'Поставщик';

  const getRank = (level: number) => {
    if (level >= 7) return { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (level >= 5) return { name: 'Platinum', color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
    if (level >= 3) return { name: 'Gold', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/10' };
  };

  const rank = getRank(currentUser?.level ?? (isSupplier ? 5 : 1));

  return (
    <>
      <Helmet>
        <title>Профиль — LSAUTO</title>
        <meta name="description" content="Управляйте своим профилем, сделками и заявками на LSAUTO." />
      </Helmet>
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Шапка профиля */}
      <div className="bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-blue-500/10" />
        <div className="px-4 sm:px-10 pb-6 sm:pb-10 -mt-12">
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
                <h1 className="text-3xl font-black">{currentUser?.name || (isSupplier ? 'Поставщик' : 'Пользователь')}</h1>
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

      {/* Блоки только для поставщика */}
      {isSupplier && (
        <>
          {/* Прогресс и тариф */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-dark-card border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Ваш прогресс</div>
                  <div className="text-xl font-bold">Уровень {currentUser?.level ?? 1}: <span className={rank.color + ' italic'}>{rank.name}</span></div>
                </div>
                <div className="text-right"><div className="font-bold text-primary">{currentUser?.level ?? 1} / 8</div></div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[90%] shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              </div>
            </div>
            <div className="bg-primary rounded-[2.5rem] p-8 text-black relative overflow-hidden group">
              <Award className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform" />
              <div className="text-[10px] font-black uppercase opacity-60">Тариф</div>
              <div className="text-xl font-black uppercase">LSAuto Unlimited</div>
              <div className="mt-4 text-xs font-bold underline cursor-pointer">Продлить доступ</div>
            </div>
          </div>

          {/* Статистика поставщика */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Мои авто', val: addedCars.length + 3, icon: Car, color: 'text-blue-500' },
              { label: 'Просмотры', val: '1,240', icon: Users, color: 'text-primary' },
              { label: 'Сделки', val: '45', icon: TrendingUp, color: 'text-green-500' },
              { label: 'Рейтинг', val: '4.9', icon: Star, color: 'text-yellow-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}><stat.icon size={20} /></div>
                  <span className="text-[10px] text-green-500 font-bold">+12%</span>
                </div>
                <div>
                  <div className="text-2xl font-black">{stat.val}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">{stat.label}</div>
                </div>
                <div className="pt-2 h-10 flex items-end gap-1">
                  {[40, 70, 45, 90, 65, 80, 95].map((h, j) => (
                    <div key={j} className="flex-1 bg-white/5 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Заказы (для клиента и поставщика) */}
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Package className="text-primary" size={20} /> Мои заказы
            </h3>
            {deals.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Заказов пока нет</p>
            ) : (
              <div className="space-y-4">
                {deals.map((deal, i) => (
                  <div key={i} className="p-4 md:p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">{deal.carName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Заказ #{deal.id} от {deal.date}</div>
                      </div>
                      <div className="text-[10px] bg-primary text-black font-black px-3 py-1 rounded-full uppercase">
                        {deal.status}
                      </div>
                    </div>
                    <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-primary transition-all duration-1000 ${deal.status === 'таможня' ? 'w-1/2' : deal.status === 'в пути' ? 'w-3/4' : 'w-full'}`} />
                    </div>
                    <div className="flex justify-between">
                      {['Выкуп', 'Таможня', 'В пути', 'Выдача'].map((s, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${idx < 2 ? 'bg-primary shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-gray-700'}`} />
                          <span className="text-[8px] font-bold text-gray-600 uppercase">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-lg">Статистика</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Heart size={14} /> Избранное</span>
                <span className="font-black">{favorites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Package size={14} /> Сравнение</span>
                <span className="font-black">{compareList.length}</span>
              </div>
              <div className="flex justify-between items-center text-yellow-500">
                <span className="text-sm flex items-center gap-2 font-bold"><Star size={14} /> Рейтинг</span>
                <span className="font-black">4.9</span>
              </div>
            </div>
          </div>

          <Link
            to="/settings"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            <Settings size={18} /> Настройки аккаунта
          </Link>

          <Link to="/admin" className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-3xl text-xs font-bold flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/20 transition-all">
            <ShieldCheck size={18} /> Панель администратора
          </Link>
        </aside>
      </div>
    </div>
    </>
  );
};
