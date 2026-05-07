
import { useState } from 'react';
import { Send, Lock, ShieldCheck, MessageCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupplierChat = () => {
  const { userRole, isLoggedIn, notify, isVerified, setVerified } = useApp();
  const [message, setMessage] = useState('');

  if (!isLoggedIn || userRole !== 'Поставщик') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="bg-dark-card border border-white/5 p-12 rounded-3xl yellow-glow">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Доступ только для поставщиков</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Этот раздел предназначен исключительно для верифицированных партнеров LSAuto. 
            Если вы клиент, воспользуйтесь формой подбора авто.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-xl font-bold transition-all"
            >
              Стать поставщиком
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="bg-dark-card border border-white/5 p-12 rounded-3xl yellow-glow">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Закрытый чат поставщиков</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Этот раздел доступен только верифицированным поставщикам LSAuto. 
            Здесь вы можете общаться с коллегами и просматривать заявки клиентов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                setVerified(true);
                notify('Вы успешно прошли проверку!', 'success');
              }}
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-xl font-bold transition-all"
            >
              Пройти верификацию
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-xl font-bold transition-all">
              Узнать условия
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { icon: ShieldCheck, title: 'Безопасность', text: 'Только проверенные игроки рынка' },
            { icon: MessageCircle, title: 'Обмен опытом', text: 'Обсуждение логистики и таможни' },
            { icon: Info, title: 'Заявки', text: 'Доступ к базе актуальных запросов' }
          ].map((item, i) => (
            <div key={i} className="bg-dark-card p-6 rounded-2xl border border-white/5">
              <item.icon size={24} className="text-primary mb-3" />
              <h4 className="font-bold text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
      {/* Requests Sidebar */}
      <div className="lg:col-span-1 bg-dark-card border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            Заявки
          </h3>
          <span className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {[
            { user: 'Александр', car: 'Geely Monjaro', budget: '3.8 млн ₽', date: '10 мин назад' },
            { user: 'Михаил', car: 'BMW X5 2023', budget: '9.0 млн ₽', date: '25 мин назад' },
            { user: 'Елена', car: 'Zeekr 001', budget: '6.5 млн ₽', date: '1 час назад' }
          ].map((req, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{req.car}</span>
                <span className="text-[10px] text-gray-500">{req.date}</span>
              </div>
              <div className="text-xs text-gray-400 mb-2">Бюджет: {req.budget}</div>
              <button className="w-full bg-white/5 hover:bg-primary hover:text-black text-[10px] font-bold py-1.5 rounded transition-all">
                ОТВЕТИТЬ ЛИЧНО
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="lg:col-span-3 bg-dark-card border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold leading-none">Общий чат поставщиков</h3>
              <span className="text-xs text-green-500">42 онлайн</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Info size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {[
            { sender: 'Юрий (Владивосток)', text: 'Коллеги, кто сейчас везет через Хэйхэ? Какие сроки на таможне?', time: '14:20' },
            { sender: 'Константин (Москва)', text: 'Вчера выпустили машину, стояла 4 дня. Затор из-за праздников.', time: '14:25', isOwn: false },
            { sender: 'Сергей (Корея)', text: 'На паром в Пусане очередь на 2 недели вперед. Планируйте заранее.', time: '14:30' },
          ].map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{msg.sender}</span>
                <span className="text-[10px] text-gray-600">{msg.time}</span>
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.isOwn ? 'bg-primary text-black' : 'bg-white/5 border border-white/10 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 bg-dark-input">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Напишите сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow bg-dark-card border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none"
            />
            <button className="bg-primary hover:bg-primary-hover text-black w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
