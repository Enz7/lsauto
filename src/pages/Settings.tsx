
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Bell, Shield, Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings = () => {
  const { notify } = useApp();
  const [formData, setFormData] = useState({
    name: 'Александр',
    email: 'alex@mail.ru',
    phone: '+7 (999) 000-00-00',
    notifications: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    notify('Настройки сохранены', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <Link to="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
        <ChevronLeft size={20} /> Назад в профиль
      </Link>

      <h1 className="text-3xl font-black">Настройки аккаунта</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-dark-card border border-white/5 rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2 border-b border-white/5 pb-4">
            <User size={18} className="text-primary" /> Личные данные
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">ФИО</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Электронная почта</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-white/5 rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2 border-b border-white/5 pb-4">
            <Lock size={18} className="text-primary" /> Безопасность
          </h3>
          <button type="button" className="text-xs text-primary font-bold hover:underline">Сменить пароль</button>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-gray-500" />
              <div className="text-sm">Двухфакторная аутентификация</div>
            </div>
            <div className="w-10 h-6 bg-white/10 rounded-full relative">
               <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-white/5 rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2 border-b border-white/5 pb-4">
            <Bell size={18} className="text-primary" /> Уведомления
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Push-уведомления о новых сообщениях</span>
            <input type="checkbox" checked={formData.notifications} onChange={e => setFormData({...formData, notifications: e.target.checked})} className="accent-primary w-5 h-5" />
          </div>
        </div>

        <button type="submit" className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
          <Save size={20} /> Сохранить изменения
        </button>
      </form>
    </div>
  );
};
