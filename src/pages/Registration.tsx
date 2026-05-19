
import { useState } from 'react';
import { User, Store, UserCheck, ShieldCheck, Mail, Lock, Phone, FileText, Globe, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/apiService';
import { Helmet } from 'react-helmet-async';
import { loginSchema, registerSchema } from '../utils/schemas';
import { z } from 'zod';

// ─── ВХОД ─────────────────────────────────────────────────────────────────

const LoginForm = () => {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(formData);
      login(data.user.role, data.user);
      navigate(data.user.role === 'Поставщик' ? '/dashboard' : data.user.role === 'Посредник' ? '/broker' : '/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Ошибка входа';
      if (!err?.response) {
        login('Клиент', { name: 'Пользователь', email: formData.email });
        notify('Вход выполнен (демо-режим)', 'info');
        navigate('/');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Вход — LSAUTO</title>
        <meta name="description" content="Войдите в свой аккаунт LSAUTO — маркетплейс автомобилей из Китая, Кореи и Европы" />
      </Helmet>
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Вход в <span className="text-primary">LSAuto</span></h1>
        <p className="text-gray-400 text-sm">Войдите в свой аккаунт</p>
      </div>

      <div className="bg-dark-card border border-white/5 rounded-3xl p-8 yellow-glow">
        <form className="space-y-6" onSubmit={handleSubmit} aria-label="Форма входа" noValidate>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Mail size={14} aria-hidden="true" /> E-mail
            </label>
            <input
              id="login-email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="example@mail.ru"
              aria-required="true"
              className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Lock size={14} aria-hidden="true" /> Пароль
            </label>
            <input
              id="login-password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-required="true"
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary hover:underline">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
    </>
  );
};

// ─── РЕГИСТРАЦИЯ ──────────────────────────────────────────────────────────

const RegisterForm = () => {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Клиент' | 'Поставщик' | 'Посредник'>('Клиент');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = registerSchema.safeParse({ ...formData, role });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });
      login(data.user.role, data.user);
      notify('Аккаунт создан!', 'success');
      navigate(role === 'Поставщик' ? '/dashboard' : role === 'Посредник' ? '/broker' : '/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message;
      if (!err?.response) {
        // Бэкенд недоступен — локальная регистрация для демо
        login(role, formData);
        notify('Аккаунт создан (демо-режим)', 'info');
        navigate(role === 'Поставщик' ? '/dashboard' : role === 'Посредник' ? '/broker' : '/');
      } else {
        setError(msg || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Регистрация — LSAUTO</title>
        <meta name="description" content="Зарегистрируйтесь на LSAUTO — купите или продайте автомобиль из Китая, Кореи или Европы" />
      </Helmet>
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Регистрация в <span className="text-primary">LSAuto</span>
        </h1>
        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
          Маркетплейс нового поколения
        </p>
      </div>

      {/* Выбор роли */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
        {[
          { id: 'Клиент', icon: User, title: 'Клиент', desc: 'Хочу купить автомобиль по выгодной цене' },
          { id: 'Поставщик', icon: Store, title: 'Поставщик', desc: 'Продаю автомобили и ищу новых клиентов' },
          { id: 'Посредник', icon: UserCheck, title: 'Посредник', desc: 'Помогаю в подборе и логистике' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRole(item.id as typeof role)}
            className={`p-6 rounded-3xl border-2 transition-all text-left group ${
              role === item.id
                ? item.id === 'Посредник'
                  ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10'
                  : 'border-primary bg-primary/5 ring-4 ring-primary/10'
                : 'border-white/5 bg-dark-card hover:border-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              role === item.id
                ? item.id === 'Посредник' ? 'bg-blue-500 text-white' : 'bg-primary text-black'
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

      <div className="bg-dark-card border border-white/5 rounded-3xl p-5 sm:p-8 md:p-12 yellow-glow">
        <form className="space-y-8" onSubmit={handleSubmit} aria-label="Форма регистрации" noValidate>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <User size={14} /> ФИО / Название компании
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Иван Иванов"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Mail size={14} /> E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="example@mail.ru"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Phone size={14} /> Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Lock size={14} /> Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
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
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Globe size={14} /> Соцсети / Сайт
                  </label>
                  <input
                    type="text"
                    placeholder="t.me/your_channel"
                    className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  После регистрации наш менеджер свяжется с вами для проверки документов.
                  Только после подтверждения вы сможете общаться с клиентами и выставлять автомобили.
                </p>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Создание аккаунта...' : `Зарегистрироваться как ${role}`}
            </button>
            <p className="text-center text-gray-500 text-sm mt-6">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary hover:underline">Войти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

// ─── ЭКСПОРТ ──────────────────────────────────────────────────────────────

export const Registration = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="animate-in fade-in duration-500">
      {isLogin ? <LoginForm /> : <RegisterForm />}

      {/* Ссылка назад */}
      <div className="flex justify-center mt-6">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> На главную
        </Link>
      </div>
    </div>
  );
};
