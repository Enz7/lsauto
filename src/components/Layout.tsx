
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Store, MessageSquare, Info, LogIn, Heart, PlusCircle, Scale, Home, User, Video, Newspaper, Briefcase, Bell } from 'lucide-react';
import { RequestModal } from './RequestModal';

import { useApp } from '../context/AppContext';

const NotificationDropdown = () => {
  const { appNotifications, markNotificationsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = appNotifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markNotificationsRead(); }}
        className="text-gray-400 hover:text-primary relative transition-colors p-1"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 bg-dark-card border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 border-b border-white/5 bg-white/5 font-bold text-xs uppercase tracking-widest flex justify-between items-center">
              Уведомления
              {unreadCount > 0 && <span className="text-primary text-[10px]">{unreadCount} новых</span>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {appNotifications.length > 0 ? (
                appNotifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                    <div className="text-xs text-white leading-relaxed mb-1">{n.text}</div>
                    <div className="text-[10px] text-gray-500 font-bold">{n.time}</div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-600 text-xs italic">История пуста</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <svg width="658" height="221" viewBox="0 0 1280 853" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0.000000,853.000000) scale(0.100000,-0.100000)"><path d="M370.972 0.295395C333.638 4.07103 300.172 16.0489 245.105 45.4728L232.572 52.2429L245.105 52.8939L257.638 53.5449L270.972 46.3842C299.505 30.7609 321.505 21.5171 343.638 15.6583C354.172 12.794 360.172 12.1431 379.372 11.6223C405.372 10.8411 418.438 12.1431 442.305 17.8716C459.372 21.9076 486.305 30.6307 504.038 37.9215C518.572 43.9105 519.238 46.1238 508.038 51.3316L500.305 54.8468L532.305 54.4562C565.772 53.9354 589.505 55.3676 619.238 59.5338C643.372 62.9188 647.772 63.9604 650.305 67.2153C652.438 70.0795 652.572 69.9493 655.372 63.4396C657.905 57.4507 657.905 56.7997 655.905 56.7997C649.238 56.7997 622.172 53.8052 607.638 51.4617C581.905 47.2955 561.905 42.218 525.638 30.7609C466.172 11.7525 446.305 6.41453 421.505 2.76909C407.638 0.685978 380.038 -0.615965 370.972 0.295395Z" fill="#FECA04"/>
<path d="M365.105 19.1736C353.372 20.4755 333.638 25.5531 321.238 30.2401C310.572 34.4063 278.038 50.4202 278.838 51.2014C279.105 51.4618 282.305 50.29 285.905 48.5975C296.705 43.3897 322.305 33.6251 334.972 30.1099C365.238 21.5171 401.638 20.7359 443.638 27.506C452.705 28.9381 443.105 25.8135 430.172 23.2096C406.038 18.132 385.772 16.8301 365.105 19.1736Z" fill="#F7F7F7"/>
<path d="M178.972 59.0128C176.038 59.143 165.905 60.0543 156.305 60.7053C105.238 64.7413 61.1049 74.6361 20.7049 91.1708C7.63827 96.5087 -4.49506 102.367 1.63827 100.415C3.10494 99.8938 9.3716 97.8107 15.6383 95.7275C43.1049 86.4838 85.2383 76.9796 112.972 73.8549C119.238 73.0737 126.705 72.1624 129.638 71.7718C132.572 71.3812 174.572 70.6001 222.972 69.8189C300.172 68.7773 351.372 66.6942 353.638 64.4809C354.172 63.83 320.038 61.7468 272.972 59.4034C250.038 58.2316 191.105 57.9712 178.972 59.0128Z" fill="#FBC701"/>
<path d="M512.972 62.7887C497.772 64.0906 468.972 67.3455 462.972 68.5172C442.705 72.0325 425.105 75.5477 425.505 75.9383C425.772 76.1987 439.638 75.1571 456.438 73.4646C482.305 71.1211 495.505 70.6003 542.305 70.6003C596.038 70.4701 616.172 71.5117 633.238 75.1571C640.438 76.7195 641.772 78.1516 647.505 88.6973C649.772 92.9937 651.638 96.1184 651.638 95.7278C651.638 94.1655 648.972 81.0159 647.505 76.0685C645.772 69.689 644.438 69.1682 619.105 65.7831C603.505 63.7 590.038 63.0491 558.972 62.6585C536.972 62.5283 516.305 62.5283 512.972 62.7887Z" fill="#FECA04"/>
<path d="M22.4382 141.686C15.5049 161.215 9.63823 178.01 9.37157 178.792C8.83823 180.094 18.5716 180.484 55.5049 180.484H102.305L104.438 175.537C105.505 172.933 106.838 169.157 107.238 167.074L108.038 163.559H73.7716C54.9716 163.559 39.6382 163.299 39.6382 163.168C39.6382 162.908 43.9049 150.539 48.9716 135.697C54.1716 120.855 58.3049 108.096 58.3049 107.445C58.3049 106.794 52.9716 106.273 46.5716 106.273H34.8382L22.4382 141.686Z" fill="#FEFEFE"/>
<path d="M152.172 107.575C140.972 110.179 135.772 116.038 130.305 132.703C127.105 142.467 127.505 145.722 132.705 148.977C135.772 150.93 140.705 151.19 170.572 151.581L204.972 152.102V155.096C204.972 156.659 203.905 159.263 202.705 160.825C200.305 163.559 199.238 163.559 159.638 163.95L118.972 164.21L116.038 172.282L113.105 180.484H158.705C187.905 180.484 206.172 179.963 209.638 179.052C220.038 176.188 229.638 161.997 231.238 146.634C231.772 141.816 231.372 140.384 228.972 138.171C226.172 135.697 223.905 135.567 190.838 135.177C164.572 134.916 155.638 134.395 155.505 133.224C155.105 130.099 155.905 127.755 157.905 125.412C159.905 123.459 163.638 123.199 199.638 123.199H239.238L242.172 115.908C243.638 111.872 244.972 108.096 244.972 107.445C244.972 106.013 158.305 106.143 152.172 107.575Z" fill="#FEFEFE"/>
<path d="M289.905 128.667C254.038 168.506 246.572 177.229 247.905 178.011C248.972 178.662 267.905 178.271 268.438 177.49C269.772 175.537 314.972 123.72 315.638 123.459C316.572 123.069 323.638 157.179 323.638 161.997C323.638 163.429 322.838 164.601 322.038 164.47C321.105 164.47 314.305 164.601 306.972 164.731L293.638 164.991L288.572 170.98C285.772 174.235 283.772 177.099 284.038 177.49C284.438 177.75 298.838 178.141 316.172 178.271C343.238 178.531 347.638 178.271 347.638 176.709C347.638 173.844 335.505 115.127 334.172 111.742C333.105 109.008 332.305 108.877 320.438 108.877H307.772L289.905 128.667Z" fill="#FECA04"/>
<path d="M366.305 137.13C352.038 179.182 351.105 178.141 396.705 177.88C426.438 177.75 426.972 177.75 432.572 174.495C435.772 172.673 439.238 169.939 440.305 168.246C441.372 166.684 446.705 152.623 452.172 137.13L462.038 108.877H452.305H442.572L440.438 114.346C439.372 117.47 436.305 126.323 433.505 134.265C424.172 161.736 424.038 161.997 418.572 163.689C411.905 165.642 381.638 164.731 379.505 162.648C378.172 161.346 379.505 156.138 385.772 137.911C390.038 125.152 394.038 113.434 394.572 111.742C395.372 109.008 395.105 108.877 385.638 108.877H375.905L366.305 137.13Z" fill="#FECA04"/>
<path d="M470.705 116.038L467.905 123.199H483.238C497.372 123.199 498.572 123.329 497.638 125.412C496.572 128.406 479.638 177.099 479.638 177.49C479.638 177.75 484.038 177.88 489.372 177.88H498.972L508.305 150.8L517.638 123.85L532.038 123.459L546.438 123.069L548.172 118.902C549.238 116.559 550.438 113.434 550.838 111.742L551.772 108.877H512.572H473.372L470.705 116.038Z" fill="#FECA04"/>
<path d="M571.372 110.7C559.505 114.866 558.438 116.429 548.705 143.249C541.238 164.21 540.438 170.069 544.572 174.105C548.572 178.141 554.305 178.662 587.105 177.88L616.572 177.229L621.505 173.584C628.438 168.376 629.638 166.163 636.972 144.681C645.905 118.772 645.772 112.913 635.905 110.179C628.438 108.226 577.505 108.617 571.372 110.7ZM622.305 125.152C623.638 126.584 622.838 130.229 618.305 143.249C615.238 152.362 611.638 160.434 610.172 161.736C607.638 163.95 604.972 164.21 586.172 164.21C571.905 164.21 564.572 163.689 563.505 162.648C561.638 160.825 572.038 129.318 575.772 125.672C578.038 123.459 580.572 123.199 599.505 123.199C616.438 123.199 620.972 123.589 622.305 125.152Z" fill="#FECA04"/>
<path d="M150.305 205.221C67.5049 205.742 59.6383 206.002 90.3049 206.783C109.772 207.304 165.505 208.085 214.305 208.476L302.972 209.257L306.305 212.252C311.105 216.548 317.772 220.844 319.638 220.844C320.572 220.844 324.705 218.241 329.105 214.986L336.972 209.127L443.905 208.346C502.838 207.825 558.172 207.044 566.972 206.523C577.505 205.872 560.038 205.481 516.305 205.351C479.638 205.351 424.305 204.831 393.372 204.31L337.105 203.529L328.172 210.168L319.372 216.939L311.105 210.559L302.972 204.18L274.305 204.31C258.572 204.44 202.705 204.831 150.305 205.221Z" fill="#F9CC2B"/>
</g>
</svg>


);

const Navbar = () => {
  const { favorites, compareList, isLoggedIn, userRole, logout } = useApp();
  const location = useLocation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  
  const navLinks = [
    { name: 'Каталог', path: '/catalog', icon: Car },
    { name: 'Поставщики', path: '/suppliers', icon: Store },
    { name: 'Лента', path: '/feed', icon: Video },
    { name: 'Новости', path: '/news', icon: Newspaper },
  ];

  if (isLoggedIn) {
    navLinks.push({ 
      name: userRole === 'Поставщик' ? 'Чат с клиентами' : 'Сообщения', 
      path: '/messages', 
      icon: MessageSquare 
    });
  }

  if (userRole === 'Поставщик') {
    navLinks.splice(3, 0, { name: 'Дашборд', path: '/dashboard', icon: PlusCircle });
  }

  if (userRole === 'Посредник') {
    navLinks.splice(3, 0, { name: 'Рабочий стол', path: '/broker', icon: Briefcase });
  }

  navLinks.push({ name: 'О сервисе', path: '/about', icon: Info });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <Logo className="text-primary group-hover:scale-110 transition-transform duration-500 h-14 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-4 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}
          </div>



          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-4 border-r border-white/10 pr-3 sm:pr-6">
              <Link to="/compare" className="hidden sm:flex text-gray-400 hover:text-primary relative transition-colors" title="Сравнение">
                <Scale size={20} />
                {compareList.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </Link>
              <Link to="/favorites" className="text-gray-400 hover:text-primary relative transition-colors" title="Избранное">
                <Heart size={20} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <NotificationDropdown />
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={logout}
                  className="hidden sm:block text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                >
                  Выйти
                </button>
                <Link 
                  to="/profile"
                  className={`flex items-center gap-3 p-1 pr-3 rounded-xl transition-all ${location.pathname === '/profile' ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-white/5'}`}
                >
                  <div className="w-8 h-8 bg-primary text-black rounded-lg flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-primary/20">
                    {userRole?.[0]}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-[10px] text-gray-500 font-bold uppercase leading-none mb-0.5">Мой аккаунт</div>
                    <div className="text-xs font-bold text-white leading-none">Профиль</div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/login" className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Войти</span>
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary-hover text-black px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all transform hover:scale-105 active:scale-95">
                  Регистрация
                </Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-white/10 transition-all"
            >
              <PlusCircle size={18} />
              Заявка
            </button>
          </div>
        </div>
      </nav>
      <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </>
  );
};

import { Breadcrumbs } from './Breadcrumbs';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { favorites, isLoggedIn, userRole } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Breadcrumbs />
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 px-6 py-3">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-gray-500'}`}>
            <Home size={20} />
            <span className="text-[10px] font-bold">Главная</span>
          </Link>
          <Link to="/catalog" className={`flex flex-col items-center gap-1 ${location.pathname === '/catalog' ? 'text-primary' : 'text-gray-500'}`}>
            <Car size={20} />
            <span className="text-[10px] font-bold">Каталог</span>
          </Link>
          <div className="relative -top-6">
            <button 
              onClick={() => {
                const btn = document.querySelector('[onClick*="setIsRequestModalOpen(true)"]') as HTMLButtonElement;
                btn?.click();
              }}
              className="bg-primary text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40"
            >
              <PlusCircle size={28} />
            </button>
          </div>
          <Link to="/favorites" className={`flex flex-col items-center gap-1 relative ${location.pathname === '/favorites' ? 'text-primary' : 'text-gray-500'}`}>
            <Heart size={20} />
            {favorites.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-black text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-black">{favorites.length}</span>}
            <span className="text-[10px] font-bold">Избранное</span>
          </Link>
          {isLoggedIn && (
            <Link to="/messages" className={`flex flex-col items-center gap-1 ${location.pathname === '/messages' ? 'text-primary' : 'text-gray-500'}`}>
              <MessageSquare size={20} />
              <span className="text-[10px] font-bold">{userRole === 'Поставщик' ? 'Чаты' : 'Связь'}</span>
            </Link>
          )}
          <Link to={isLoggedIn ? '/profile' : '/login'} className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' || location.pathname === '/login' ? 'text-primary' : 'text-gray-500'}`}>
            <User size={20} />
            <span className="text-[10px] font-bold">{isLoggedIn ? 'Профиль' : 'Войти'}</span>
          </Link>
        </div>
      </div>

      <footer className="bg-dark-card border-t border-white/10 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-black p-1 rounded font-bold text-xl">LS</div>
                <span className="text-xl font-bold tracking-tighter">Auto</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm mb-4">
                Первый в России маркетплейс автомобилей нового поколения. Прямые поставки из Китая, Европы и Южной Кореи.
              </p>
              <div className="flex gap-4">
                {/* Social icons could go here */}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/catalog" className="hover:text-primary">Каталог авто</Link></li>
                <li><Link to="/suppliers" className="hover:text-primary">Поставщики</Link></li>
                <li><Link to="/trends" className="hover:text-primary">Аналитика</Link></li>
                <li><Link to="/about" className="hover:text-primary">О сервисе</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Помощь покупателю</li>
                <li>Для поставщиков</li>
                <li>Условия использования</li>
                <li>Конфиденциальность</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 text-center text-xs text-gray-500">
            © 2024 LSAuto. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};
