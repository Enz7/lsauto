
import { useState } from 'react';
import { User, Store, UserCheck, ShieldCheck, Mail, Lock, Phone, FileText, Globe, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Registration = () => {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Клиент' | 'Поставщик' | 'Посредник'>('Клиент');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('БРАУЗЕР: Нажата кнопка регистрации. Роль:', role);
    console.log('БРАУЗЕР: Данные формы:', formData);
    
    setLoading(true);
    try {
      await login(role, formData);
      console.log('БРАУЗЕР: Успешный ответ от функции login');
      if (role === 'Поставщик') navigate('/dashboard');
      else if (role === 'Посредник') navigate('/catalog');
      else navigate('/');
    } catch (err) {
      console.error('БРАУЗЕР: Ошибка в handleSubmit:', err);
      notify('Ошибка при регистрации. Проверьте терминал сервера.', 'info');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 italic">LS<span className="text-primary">Auto</span></h1>
        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Маркетплейс нового поколения</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { id: 'Клиент', icon: User, title: 'Клиент', desc: 'Хочу купить автомобиль по выгодной цене', color: 'border-white' },
          { id: 'Поставщик', icon: Store, title: 'Поставщик', desc: 'Продаю автомобили и ищу новых клиентов', color: 'border-primary' },
          { id: 'Посредник', icon: UserCheck, title: 'Посредник', desc: 'Помогаю в подборе и логистике', color: 'border-blue-500' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRole(item.id as any)}
            className={`p-6 rounded-3xl border-2 transition-all text-left group ${
              role === item.id 
                ? (item.id === 'Посредник' ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10' : 'border-primary bg-primary/5 ring-4 ring-primary/10') 
                : 'border-white/5 bg-dark-card hover:border-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              role === item.id 
                ? (item.id === 'Посредник' ? 'bg-blue-500 text-white' : 'bg-primary text-black') 
                : 'bg-white/5 text-gray-400 group-hover:text-white'
            }`}>
              <item.icon size={24} />
            </div>
            <h3 className={`font-bold text-lg mb-2 ${role === item.id ? 'text-white' : 'text-gray-400'}`}>
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-dark-card border border-white/5 rounded-3xl p-8 md:p-12 yellow-glow">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <User size={14} /> ФИО / Название компании
              </label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Иван Иванов" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Mail size={14} /> E-mail
              </label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="example@mail.ru" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Phone size={14} /> Телефон
              </label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="+7 (999) 000-00-00" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Lock size={14} /> Пароль
              </label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          {role === 'Поставщик' && (
            <div className="pt-8 border-t border-white/10 space-y-6">
              <h3 className="font-bold text-xl flex items-center gap-3">
                <ShieldCheck className="text-primary" />
                Данные для верификации
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <FileText size={14} /> ИНН / ОГРНИП
                  </label>
                  <input type="text" placeholder="1234567890" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Globe size={14} /> Соцсети / Сайт
                  </label>
                  <input type="text" placeholder="t.me/your_channel" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  После регистрации наш менеджер свяжется с вами для проверки документов. 
                  Только после подтверждения вы сможете полноценно общаться с клиентами и выставлять автомобили.
                </p>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Создание аккаунта...' : `Зарегистрироваться как ${role}`}
            </button>
            <p className="text-center text-gray-500 text-sm mt-6">
              Уже есть аккаунт? <Link to="/login" className="text-primary hover:underline">Войти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
