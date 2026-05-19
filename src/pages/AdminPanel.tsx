
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, DollarSign, MessageCircle, ShieldCheck, UserX, AlertTriangle, FileText, CheckCircle2, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminService, fraudService, supplierService } from '../services/apiService';

export const AdminPanel = () => {
  const { isLoggedIn, addedCars, approveCar, rejectCar, verifyUser } = useApp();
  const pendingCars = (addedCars || []).filter((c: any) => c.status === 'pending');

  const [stats, setStats] = useState({ usersCount: 0, pendingCars: 0, dealsCount: 0, activeChats: 0, revenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [fraudEvents, setFraudEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    adminService.getStats().then(setStats).catch(() => {});
    adminService.getUsers({ limit: 50 }).then(res => setUsers(res.data)).catch(() => {});
    fraudService.getEvents({ limit: 10 }).then(res => setFraudEvents(res.data)).catch(() => {});
  }, [isLoggedIn]);

  const handleVerify = (userId: string, status: boolean) => {
    verifyUser(userId, status);
    supplierService.verify(Number(userId), status).catch(() => {});
    setUsers(prev => prev.map(u => u.id === userId || String(u.id) === userId ? { ...u, is_verified: status } : u));
  };

  if (!isLoggedIn) return <div className="py-20 text-center">Доступ запрещен</div>;

  const formatRevenue = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₽`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₽`;
    return `${n.toFixed(0)} ₽`;
  };

  return (
    <>
      <Helmet>
        <title>Панель администратора — LSAUTO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <ShieldCheck className="text-primary" />
            Control Center
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Управление экосистемой LSAuto</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Выручка платформы', val: formatRevenue(stats.revenue), icon: DollarSign, color: 'text-green-500' },
          { label: 'Пользователей', val: stats.usersCount, icon: TrendingUp, color: 'text-primary' },
          { label: 'Очередь авто', val: pendingCars.length || stats.pendingCars, icon: BarChart3, color: 'text-blue-500' },
          { label: 'Активные чаты', val: stats.activeChats, icon: MessageCircle, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-card border border-white/5 p-4 md:p-8 rounded-[2rem] space-y-3 md:space-y-4 group hover:border-primary/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-3xl font-black">{stat.val}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
            <div className="flex items-end gap-1 h-8 pt-2">
              {[30, 60, 45, 90, 40, 70].map((h, j) => <div key={j} className="flex-1 bg-white/5 rounded-t-sm group-hover:bg-primary/20" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-card border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="text-primary" />
          Журнал антифрода
        </div>
        <div className="divide-y divide-white/5">
          {fraudEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-600 italic">Событий антифрода нет</div>
          ) : (
            fraudEvents.slice(0, 5).map((log, i) => (
              <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
                <div>
                  <div className="font-bold">{log.user_name ?? `User #${log.user_id}`}</div>
                  <div className="text-xs text-gray-500">{log.event_type}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${log.score >= 5 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    Score: {log.score}
                  </span>
                  <button className="bg-white/5 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <UserX size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-card border border-white/5 rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Модерация авто ({pendingCars.length})
          </h3>
          <div className="space-y-4">
            {pendingCars.map((car: any) => (
              <div key={car.id} className="p-6 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-6">
                  <img src={car.изображения[0]} className="w-16 h-12 rounded-xl object-cover" alt={car.марка} />
                  <div>
                    <div className="font-bold text-sm">{car.марка} {car.модель}</div>
                    <div className="text-[10px] text-primary font-bold uppercase">{car.цена.toLocaleString()} ₽</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveCar(car.id)} className="bg-green-500 text-white p-2 rounded-xl hover:bg-green-600 transition-all"><CheckCircle2 size={16} /></button>
                  <button onClick={() => rejectCar(car.id)} className="bg-white/5 p-2 rounded-xl hover:bg-red-500 transition-all"><UserX size={16} /></button>
                </div>
              </div>
            ))}
            {pendingCars.length === 0 && <div className="text-center py-10 text-gray-600 text-xs italic">Очередь пуста</div>}
          </div>
        </div>

        <div className="bg-dark-card border border-white/5 rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Пользователи ({users.length || stats.usersCount})
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {users.map(user => (
              <div key={user.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs uppercase">{user.name[0]}</div>
                  <div>
                    <div className="font-bold text-sm">{user.name}</div>
                    <div className="text-[10px] text-gray-500">{user.role}</div>
                  </div>
                </div>
                {user.is_verified ? (
                  <span className="text-[9px] font-black text-green-500 uppercase">Verified</span>
                ) : (
                  <button onClick={() => handleVerify(String(user.id), true)} className="bg-primary text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-primary/20">Verify</button>
                )}
              </div>
            ))}
            {users.length === 0 && <div className="text-center py-10 text-gray-600 text-xs italic">Загрузка...</div>}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
