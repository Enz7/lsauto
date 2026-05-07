
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const translate: Record<string, string> = {
    catalog: 'Каталог',
    suppliers: 'Поставщики',
    trends: 'Аналитика',
    favorites: 'Избранное',
    compare: 'Сравнение',
    dashboard: 'Дашборд',
    messages: 'Сообщения',
    about: 'О сервисе',
    register: 'Регистрация',
    login: 'Вход'
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-6 tracking-widest overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home size={12} />
        Главная
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = translate[name] || name;

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-gray-700" />
            {isLast ? (
              <span className="text-gray-300">{label}</span>
            ) : (
              <Link to={routeTo} className="hover:text-primary transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
