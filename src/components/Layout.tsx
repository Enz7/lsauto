
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
  <svg 
    viewBox="0 0 1280 853" 
    className={`${className} fill-current`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(0.000000,853.000000) scale(0.100000,-0.100000)">
      <path d="M0 4265 l0 -4265 6400 0 6400 0 0 4265 0 4265 -6400 0 -6400 0 0 -4265z m7685 2485 c506 -36 900 -131 1860 -449 551 -182 765 -245 1055 -311 358 -81 708 -129 1191 -162 l36 -3 -57 -128 -57 -128 -13 46 c-7 25 -23 54 -35 63 -58 46 -592 124 -1145 167 -222 17 -887 20 -1110 4 -84 -6 -154 -8 -157 -6 -2 3 20 12 50 22 29 9 89 36 133 59 83 44 117 83 99 112 -29 45 -652 278 -1010 377 -457 126 -731 163 -1140 154 -198 -5 -265 -10 -385 -32 -274 -49 -487 -115 -782 -244 -203 -89 -549 -268 -736 -383 l-62 -38 -138 1 c-75 1 -175 4 -222 7 l-85 7 80 42 c44 24 103 56 130 71 226 129 690 361 890 447 585 250 1075 343 1610 305z m-30 -300 c165 -14 389 -47 520 -76 113 -26 386 -101 394 -109 7 -8 -12 -6 -49 5 -51 15 -297 57 -435 74 -509 64 -987 42 -1373 -65 -244 -67 -541 -179 -842 -317 -98 -44 -164 -75 -172 -79 -5 -2 -8 -2 -8 0 0 8 288 167 427 236 531 263 1041 373 1538 331z m-2540 -650 c220 -5 492 -14 605 -20 525 -27 627 -32 959 -55 194 -13 355 -26 357 -28 5 -5 -48 -10 -301 -32 -529 -45 -604 -47 -1780 -55 -1157 -8 -1259 -11 -1675 -50 -650 -62 -1386 -236 -2012 -476 -76 -29 -138 -50 -138 -48 0 7 261 131 420 199 415 179 792 297 1250 394 424 90 1168 163 1760 174 74 2 140 4 145 5 6 1 190 -3 410 -8z m5370 -60 c418 -22 776 -61 1028 -111 l107 -22 21 -69 c24 -82 64 -270 73 -348 l7 -55 -29 67 c-58 132 -142 259 -189 285 -61 34 -237 61 -568 87 -859 69 -1901 34 -2980 -100 -90 -12 -43 3 145 44 346 77 572 117 880 157 179 23 621 60 800 68 183 8 531 6 705 -3z m-8255 -736 c0 -6 -89 -269 -229 -674 l-88 -255 553 -3 c339 -1 554 -6 554 -12 0 -5 -4 -19 -10 -32 -5 -13 -26 -68 -46 -123 -20 -55 -41 -103 -46 -106 -15 -10 -1488 -11 -1488 -1 0 5 30 94 66 198 36 104 83 241 104 304 22 63 84 247 140 409 55 162 100 296 100 298 0 1 88 3 195 3 107 0 195 -3 195 -6z m2980 -1 c0 -5 -21 -65 -46 -135 l-47 -128 -619 0 c-597 0 -620 -1 -658 -20 -31 -16 -42 -30 -59 -75 -23 -61 -20 -82 16 -96 14 -5 244 -9 527 -9 539 0 580 -3 633 -52 55 -51 54 -119 -3 -286 -73 -213 -119 -285 -217 -341 -115 -65 -96 -64 -904 -68 -584 -2 -733 -1 -733 9 0 7 21 70 46 141 l47 127 643 0 642 0 31 26 c19 16 37 45 48 80 30 96 72 88 -528 95 -588 6 -599 7 -658 74 -30 34 -36 59 -31 125 3 41 79 261 112 323 56 104 173 185 300 206 65 11 1458 14 1458 4z m1418 -46 c6 -7 22 -69 36 -138 14 -68 52 -257 86 -419 34 -162 65 -317 70 -345 4 -27 15 -81 24 -118 9 -38 16 -79 16 -93 l0 -24 -507 0 c-280 0 -518 3 -531 6 -22 6 -22 7 15 53 20 25 66 79 101 119 l64 72 234 0 c169 0 234 3 234 11 0 7 -20 116 -44 243 -24 127 -47 249 -51 271 -14 87 -27 136 -35 133 -7 -3 -72 -77 -319 -367 -25 -30 -64 -76 -86 -101 -22 -25 -98 -115 -170 -199 -139 -164 -155 -183 -186 -219 -19 -22 -24 -23 -189 -22 -96 1 -170 6 -170 11 0 5 28 42 63 82 34 39 121 140 192 222 71 83 147 171 169 196 23 25 80 90 128 145 221 253 422 480 432 486 6 4 102 8 212 8 153 0 204 -3 212 -13z m992 10 c0 -2 -61 -183 -135 -403 -74 -219 -135 -413 -135 -431 0 -63 -1 -63 338 -63 287 0 309 1 339 20 18 10 40 34 49 52 10 18 76 211 149 428 l131 395 163 3 c129 2 162 0 159 -10 -3 -7 -69 -204 -148 -438 -78 -234 -154 -447 -168 -475 -37 -73 -126 -156 -197 -183 -98 -38 -187 -44 -606 -40 l-394 3 -60 30 c-118 59 -131 127 -66 335 32 102 239 723 256 768 3 9 46 12 165 12 88 0 160 -1 160 -3z m2497 -9 c-2 -7 -22 -61 -43 -120 l-39 -108 -230 0 -231 0 -128 -382 c-70 -211 -139 -416 -153 -455 l-25 -73 -159 0 c-87 0 -159 2 -159 4 0 1 26 81 59 177 32 96 63 190 69 209 6 19 47 143 91 275 45 131 81 240 81 242 0 2 -108 3 -240 3 -132 0 -240 1 -240 3 0 1 18 53 40 116 22 63 40 116 40 118 0 2 286 3 636 3 505 0 635 -3 631 -12z m1374 -10 c73 -34 116 -114 106 -197 -10 -78 -211 -666 -250 -729 -64 -105 -167 -169 -309 -192 -86 -14 -827 -13 -903 1 -125 23 -177 72 -183 175 -4 57 4 86 102 380 59 175 119 340 134 368 55 102 170 187 278 206 27 4 261 7 519 6 419 -1 474 -3 506 -18z m-5245 -1624 c166 -132 141 -126 232 -58 42 32 101 77 130 101 l53 43 502 0 c563 0 2423 -15 3412 -27 572 -7 622 -8 415 -15 -248 -7 -1479 -21 -3248 -38 l-1063 -10 -62 -48 c-106 -83 -207 -152 -220 -152 -6 0 -73 45 -147 101 l-134 100 -1031 9 c-1501 13 -2982 31 -3275 39 -212 5 -113 8 595 15 1335 14 2478 22 3131 24 l601 2 109 -86z m-3916 -319 c7 -8 10 -25 6 -39 -3 -14 -2 -28 4 -31 15 -9 12 -31 -6 -49 -9 -10 -33 -16 -60 -16 l-44 0 0 75 0 75 44 0 c26 0 48 -6 56 -15z m540 -12 c52 -66 -25 -153 -100 -113 -22 12 -42 64 -33 88 21 59 95 73 133 25z m610 0 c39 -50 3 -123 -60 -123 -63 0 -99 73 -60 123 17 21 30 27 60 27 30 0 43 -6 60 -27z m4442 10 c26 -29 30 -60 14 -91 -25 -49 -82 -57 -121 -17 -30 30 -32 64 -4 99 25 32 87 37 111 9z m1798 2 c7 -8 10 -25 6 -39 -3 -14 -2 -28 4 -31 15 -9 12 -31 -6 -49 -9 -10 -33 -16 -60 -16 l-44 0 0 75 0 75 44 0 c26 0 48 -6 56 -15z m552 -2 c26 -29 30 -60 14 -91 -25 -49 -82 -57 -121 -17 -30 30 -32 64 -4 99 25 32 87 37 111 9z m-6472 -593 c11 -6 72 -25 137 -44 l118 -33 0 -154 c0 -154 0 -155 -32 -219 -42 -84 -106 -148 -191 -193 l-69 -36 -59 28 c-104 49 -197 149 -225 243 -16 53 -21 314 -6 326 6 5 53 21 102 35 50 14 106 33 125 41 41 18 74 20 100 6z m5370 -30 c66 -33 133 -103 163 -168 33 -74 30 -189 -6 -268 -120 -259 -474 -265 -605 -9 -34 66 -42 180 -18 253 19 56 70 126 117 161 18 13 62 34 98 47 85 30 171 24 251 -16z m-3083 -81 c26 -11 56 -27 65 -36 19 -17 39 -15 110 13 40 15 53 16 81 6 28 -10 39 -10 63 3 39 20 70 19 124 -6 96 -45 117 -49 134 -30 20 22 108 54 138 49 20 -3 29 -21 71 -148 29 -89 45 -150 40 -159 -5 -7 -37 -25 -71 -38 -54 -22 -67 -24 -87 -13 -30 16 -45 6 -45 -32 0 -38 -25 -68 -57 -68 -13 0 -23 -6 -23 -14 0 -22 -29 -46 -54 -46 -13 0 -31 -9 -41 -20 -10 -11 -28 -20 -41 -20 -13 0 -26 -4 -29 -10 -8 -13 -62 -13 -70 0 -4 7 -12 7 -25 0 -29 -16 -58 -12 -80 10 -11 11 -29 20 -39 20 -11 0 -28 10 -38 23 -10 12 -30 27 -45 34 -14 6 -29 21 -33 32 -3 11 -15 23 -26 26 -26 9 -41 39 -33 71 6 25 5 27 -17 20 -13 -4 -29 -8 -35 -8 -22 -2 -136 45 -141 58 -4 11 49 166 91 267 19 44 40 47 113 16z"/>
      <path d="M10519 4707 c-45 -29 -62 -69 -155 -346 -73 -219 -77 -236 -63 -260 l15 -26 346 -3 346 -2 31 26 c18 15 38 38 45 53 24 47 169 492 169 519 0 15 -10 33 -23 44 -20 17 -49 18 -350 18 -323 0 -327 0 -361 -23z"/>
      <path d="M3680 2349 c-47 -15 -104 -33 -127 -39 l-43 -11 0 -124 c0 -103 4 -134 22 -182 25 -68 97 -144 175 -186 l53 -28 60 32 c34 18 83 56 110 86 68 74 90 147 90 293 l0 108 -52 12 c-29 7 -87 25 -128 40 l-75 27 -85 -28z m240 -154 c10 -12 -4 -32 -85 -120 -54 -58 -100 -105 -104 -105 -4 0 -33 26 -64 58 -48 49 -56 61 -44 71 19 15 39 6 66 -29 12 -17 28 -30 35 -30 7 0 49 38 92 84 44 47 82 85 85 85 4 1 12 -6 19 -14z"/>
      <path d="M8772 2247 c-19 -23 -52 -101 -52 -124 0 -21 4 -23 59 -23 l58 0 7 43 c4 23 9 52 12 64 5 17 -1 25 -25 37 -37 19 -45 20 -59 3z"/>
      <path d="M9215 2244 l-30 -15 9 -65 10 -64 58 0 c57 0 58 1 58 28 0 36 -46 132 -62 131 -7 0 -27 -7 -43 -15z"/>
      <path d="M8725 2060 c-9 -14 21 -109 43 -137 16 -20 20 -21 55 -10 37 12 38 13 32 52 -18 115 -11 105 -71 105 -29 0 -56 -5 -59 -10z"/>
      <path d="M8877 2063 c-7 -10 11 -105 21 -115 4 -4 30 -4 57 0 l50 7 0 55 0 55 -62 3 c-34 2 -64 -1 -66 -5z"/>
      <path d="M9040 2011 l0 -58 53 -6 c28 -3 56 -2 60 3 5 4 11 33 14 64 l6 56 -67 0 -66 0 0 -59z"/>
      <path d="M9207 2063 c-4 -3 -7 -23 -7 -44 0 -21 -4 -49 -10 -63 -9 -24 -6 -27 27 -41 29 -12 39 -13 51 -3 23 19 52 89 52 126 l0 32 -53 0 c-30 0 -57 -3 -60 -7z"/>
      <path d="M5961 2167 c-25 -67 -46 -127 -48 -132 -2 -6 14 -16 34 -23 79 -27 80 -27 93 15 7 21 28 75 47 121 18 46 33 88 33 93 0 10 -83 49 -103 49 -7 0 -32 -55 -56 -123z"/>
      <path d="M6377 2238 c-38 -21 -69 -47 -89 -75 -51 -76 -12 -100 62 -38 23 19 46 35 50 35 5 0 15 2 23 6 9 3 59 -35 133 -100 65 -59 124 -106 130 -106 5 0 19 6 29 14 19 14 19 16 -10 107 -38 122 -41 129 -69 129 -14 0 -53 13 -88 30 -79 37 -99 37 -171 -2z"/>
      <path d="M6728 2253 c-42 -17 -44 -26 -24 -80 8 -21 27 -78 41 -126 29 -97 24 -94 104 -61 30 13 33 17 27 46 -3 18 -21 78 -39 133 -36 111 -42 116 -109 88z"/>
      <path d="M6250 2240 c-25 -10 -59 -19 -76 -19 -31 -1 -32 -3 -69 -107 -42 -118 -40 -137 15 -114 28 12 34 11 60 -8 16 -12 36 -19 44 -16 19 7 56 -13 56 -31 0 -8 16 -21 35 -29 24 -10 35 -21 35 -36 0 -11 8 -24 18 -27 9 -4 34 -24 56 -45 22 -22 48 -38 62 -38 46 0 39 23 -25 81 -40 36 -59 59 -51 64 11 7 21 1 97 -67 46 -41 73 -47 93 -23 11 14 4 24 -45 68 -32 29 -67 58 -77 65 -10 7 -18 17 -18 23 0 21 31 5 98 -52 76 -64 114 -74 120 -33 2 15 -27 47 -118 127 -71 63 -129 107 -142 107 -11 0 -39 -16 -61 -36 -34 -31 -44 -35 -75 -30 -65 10 -68 47 -12 123 23 29 45 53 50 53 6 0 10 5 10 10 0 15 -29 11 -80 -10z"/>
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
