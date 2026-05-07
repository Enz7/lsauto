
import { useState, useEffect } from 'react';
import { Search, Send, CheckCircle2, MoreVertical, Paperclip, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Messages = () => {
  const { activeChatId, setActiveChatId, chats, sendMessage, userRole } = useApp();
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeChatId) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  }, [activeChatId]);

  // Filter or transform chats based on role
  // In a real app, the server would return different chats for each role.
  // Here we'll simulate "Client" labels for the supplier.
  const displayChats = chats.map(chat => {
    if (userRole === 'Поставщик') {
      // If user is supplier, they see clients
      // We'll mock the names if they look like supplier IDs
      if (chat.id.startsWith('s')) {
        return { ...chat, name: `Клиент ${chat.id.replace('s', '#')}`, role: 'Покупатель' };
      }
      return { ...chat, role: 'Покупатель' };
    }
    return { ...chat, role: 'Поставщик' };
  });

  useEffect(() => {
    if (activeChatId) {
      const index = displayChats.findIndex(c => c.id === activeChatId);
      if (index !== -1) {
        setActiveChatIndex(index);
      }
      return () => setActiveChatId(null);
    }
  }, [activeChatId, displayChats, setActiveChatId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(chats[activeChatIndex].id, text);
    setText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className="w-80 bg-dark-card border border-white/5 rounded-3xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold mb-4">Сообщения</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Поиск диалогов..."
              className="w-full bg-dark-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {displayChats.map((chat, idx) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatIndex(idx)}
              className={`w-full p-4 flex gap-4 hover:bg-white/5 transition-colors border-l-2 ${
                activeChatIndex === idx ? 'bg-white/5 border-primary' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
                  {chat.name[0]}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-dark-card rounded-full" />
                )}
              </div>
              <div className="text-left flex-grow min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] text-gray-500">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{chat.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow bg-dark-card border border-white/5 rounded-3xl flex flex-col overflow-hidden">
        {displayChats[activeChatIndex] ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
                  {displayChats[activeChatIndex].name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    {displayChats[activeChatIndex].name}
                    {displayChats[activeChatIndex].role === 'Поставщик' && <CheckCircle2 size={14} className="text-primary" />}
                  </h3>
                  <span className="text-[10px] text-gray-500">{displayChats[activeChatIndex].role} • {displayChats[activeChatIndex].online ? 'В сети' : 'Был недавно'}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white p-2">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {displayChats[activeChatIndex].history.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[70%] ${msg.isOwn ? 'bg-primary text-black rounded-tr-none' : 'bg-white/5 border border-white/10 text-white rounded-tl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block ${msg.isOwn ? 'opacity-60' : 'text-gray-500'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
              {displayChats[activeChatIndex].history.length === 0 && (
                <div className="text-center py-20 text-gray-500 text-sm italic">
                  Начните диалог с собеседником
                </div>
              )}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full [animation-delay:0.4s]" />
                  <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">Собеседник печатает...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-dark-input">
              <form className="flex items-center gap-4" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <button type="button" className="text-gray-400 hover:text-primary p-2">
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Напишите сообщение..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-grow bg-dark-card border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
              <MessageCircle size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Выберите диалог</h3>
              <p className="text-gray-500 text-sm">Выберите чат слева, чтобы начать общение</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
