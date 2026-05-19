
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Bell, Shield, Save, ChevronLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService, profileService } from '../services/apiService';

export const Settings = () => {
  const { notify, currentUser, setCurrentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    description: '',
    experience: '',
    notifications: true,
  });

  useEffect(() => {
    authService.me()
      .then(user => {
        setFormData({
          name: user.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          city: user.city ?? '',
          description: user.description ?? '',
          experience: user.experience ?? '',
          notifications: true,
        });
      })
      .catch(() => {
        if (currentUser) {
          setFormData(prev => ({ ...prev, name: currentUser.name, email: currentUser.email }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { notify('Имя не может быть пустым', 'info'); return; }
    setSaving(true);
    try {
      const updated = await profileService.update({
        name: formData.name,
        city: formData.city,
        description: formData.description,
        experience: formData.experience,
        phone: formData.phone,
      });
      if (setCurrentUser) setCurrentUser(updated);
      notify('Настройки сохранены', 'success');
    } catch {
      notify('Не удалось сохранить. Попробуйте ещё раз.', 'info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

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
              <label className="text-[10px] font-bold text-gray-500 uppercase">ФИО / Название компании</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Электронная почта</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none opacity-50 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-600">Email изменить нельзя</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Москва"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">О себе / компании</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Кратко о деятельности..."
                rows={3}
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Опыт работы</label>
              <input
                type="text"
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder="5 лет"
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
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={e => setFormData({ ...formData, notifications: e.target.checked })}
              className="accent-primary w-5 h-5"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};
