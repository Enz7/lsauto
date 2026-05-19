
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500 py-20">
    <div className="relative select-none">
      <div className="text-[12rem] font-black leading-none text-white/5">404</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-2">
          <div className="text-6xl font-black text-primary">404</div>
        </div>
      </div>
    </div>

    <div className="space-y-3 max-w-md">
      <h1 className="text-3xl font-black">Страница не найдена</h1>
      <p className="text-gray-400 leading-relaxed">
        Такой страницы не существует или она была перемещена. Проверьте правильность ссылки.
      </p>
    </div>

    <div className="flex flex-wrap gap-4 justify-center">
      <Link
        to="/"
        className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-black font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20"
      >
        <Home size={20} /> На главную
      </Link>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all"
      >
        <ArrowLeft size={20} /> Назад
      </button>
    </div>
  </div>
);
