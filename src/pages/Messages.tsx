
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, CheckCircle2, MoreVertical, Paperclip, MessageCircle, X, Trash2, UserCircle, Flag, FileText, ChevronLeft, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { getSocket, chatService, carService } from '../services/apiService';
import { Helmet } from 'react-helmet-async';
import type { Socket } from 'socket.io-client';

interface ChatMessage {
  id?: number;
  senderId: number;
  senderName: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  role: string;
  online: boolean;
  messages: ChatMessage[];
}

export const Messages = () => {
  const { activeChatId, setActiveChatId, chats, sendMessage: ctxSendMessage, userRole, notify, isLoggedIn } = useApp();

  const [activeRoom, setActiveRoom] = useState<string>(chats[0]?.id || 's1');
  const [rooms, setRooms] = useState<ChatRoom[]>(() =>
    chats.map(c => ({
      id: c.id,
      name: userRole === 'Поставщик' ? `Клиент ${c.id.replace('s', '#')}` : c.name,
      role: userRole === 'Поставщик' ? 'Покупатель' : 'Поставщик',
      online: c.online,
      messages: c.history.map(m => ({
        senderId: m.isOwn ? 0 : 1,
        senderName: m.isOwn ? 'Вы' : c.name,
        text: m.text,
        time: m.time,
        isOwn: m.isOwn,
      })),
    }))
  );

  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [search, setSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const currentRoom = rooms.find(r => r.id === activeRoom);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [currentRoom?.messages.length, isTyping, scrollToBottom]);

  // Connect Socket.io
  useEffect(() => {
    if (!isLoggedIn) return;
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_room', activeRoom);
    });

    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('new_message', (msg: any) => {
      const currentUserId = Number(localStorage.getItem('lsauto_user_id'));
      setRooms(prev => prev.map(r =>
        r.id === msg.roomId
          ? {
              ...r,
              messages: [...r.messages, {
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                text: msg.text,
                time: msg.time,
                isOwn: msg.senderId === currentUserId,
              }],
            }
          : r
      ));
    });

    socket.on('typing', ({ userId }: { userId: number }) => {
      const currentUserId = Number(localStorage.getItem('lsauto_user_id'));
      if (userId !== currentUserId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_message');
      socket.off('typing');
    };
  }, [isLoggedIn, activeRoom]);

  // Load chat history from server
  useEffect(() => {
    if (!isLoggedIn || !activeRoom) return;
    chatService.getHistory(activeRoom, { limit: 50 })
      .then(res => {
        const currentUserId = Number(localStorage.getItem('lsauto_user_id'));
        const msgs: ChatMessage[] = res.data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
          isOwn: m.sender_id === currentUserId,
        }));
        if (msgs.length > 0) {
          setRooms(prev => prev.map(r => r.id === activeRoom ? { ...r, messages: msgs } : r));
        }
      })
      .catch(() => {});
  }, [isLoggedIn, activeRoom]);

  // Redirect to room if activeChatId set
  useEffect(() => {
    if (activeChatId) {
      const found = rooms.find(r => r.id === activeChatId);
      if (found) {
        setActiveRoom(activeChatId);
        setMobileSidebar(false);
      }
      return () => setActiveChatId(null);
    }
  }, [activeChatId, rooms, setActiveChatId]);

  const handleSelectRoom = (id: string) => {
    setActiveRoom(id);
    setMobileSidebar(false);
    socketRef.current?.emit('join_room', id);
  };

  const handleSend = () => {
    const hasText = text.trim();
    const hasFile = !!attachment;
    if (!hasText && !hasFile) return;

    const msgText = hasFile
      ? hasText ? `${text} [📎 ${attachment!.name}]` : `[📎 ${attachment!.name}]`
      : text;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('send_message', { roomId: activeRoom, text: msgText });
    } else {
      // Fallback: add to local state + context
      const now = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
      setRooms(prev => prev.map(r =>
        r.id === activeRoom
          ? { ...r, messages: [...r.messages, { senderId: 0, senderName: 'Вы', text: msgText, time: now, isOwn: true }] }
          : r
      ));
      ctxSendMessage(activeRoom, msgText);
    }

    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (typingTimeout) clearTimeout(typingTimeout);
    if (socketRef.current?.connected && value.trim()) {
      socketRef.current.emit('typing', { roomId: activeRoom });
      setTypingTimeout(setTimeout(() => {}, 2000));
    }
  };

  const handleClearChat = () => {
    setRooms(prev => prev.map(r => r.id === activeRoom ? { ...r, messages: [] } : r));
    notify('История чата очищена', 'info');
    setMenuOpen(false);
  };

  const filteredRooms = rooms.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Сообщения — LSAUTO</title>
        <meta name="description" content="Чат с поставщиками автомобилей из Китая, Кореи и Европы" />
      </Helmet>

      <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500" role="main">
        {/* Sidebar */}
        <nav
          aria-label="Список диалогов"
          className={`
            ${mobileSidebar ? 'flex' : 'hidden'} md:flex
            w-full md:w-80 flex-shrink-0
            bg-dark-card border border-white/5 rounded-3xl flex-col overflow-hidden
          `}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Сообщения</h1>
              <span
                title={socketConnected ? 'Подключено' : 'Офлайн'}
                aria-label={socketConnected ? 'Соединение активно' : 'Нет соединения'}
              >
                {socketConnected
                  ? <Wifi size={16} className="text-green-400" />
                  : <WifiOff size={16} className="text-gray-500" />
                }
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder="Поиск диалогов..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Поиск диалогов"
                className="w-full bg-dark-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <ul className="flex-grow overflow-y-auto" role="listbox" aria-label="Диалоги">
            {filteredRooms.map((room) => (
              <li key={room.id} role="option" aria-selected={activeRoom === room.id}>
                <button
                  onClick={() => handleSelectRoom(room.id)}
                  className={`w-full p-4 flex gap-4 hover:bg-white/5 transition-colors border-l-2 ${
                    activeRoom === room.id ? 'bg-white/5 border-primary' : 'border-transparent'
                  }`}
                  aria-current={activeRoom === room.id ? 'true' : undefined}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold" aria-hidden="true">
                      {room.name[0]}
                    </div>
                    {room.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-dark-card rounded-full" aria-label="В сети" />
                    )}
                  </div>
                  <div className="text-left flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm truncate">{room.name}</h4>
                      {room.messages.length > 0 && (
                        <span className="text-[10px] text-gray-500 shrink-0 ml-1">
                          {room.messages[room.messages.length - 1].time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate text-gray-400">
                      {room.messages.length > 0
                        ? <>{room.messages[room.messages.length - 1].isOwn ? 'Вы: ' : ''}{room.messages[room.messages.length - 1].text}</>
                        : <span className="text-gray-600 italic">Нет сообщений</span>
                      }
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Chat Area */}
        <section
          aria-label="Чат"
          className={`
            ${!mobileSidebar ? 'flex' : 'hidden'} md:flex
            flex-grow bg-dark-card border border-white/5 rounded-3xl flex-col overflow-hidden
          `}
        >
          {currentRoom ? (
            <>
              {/* Header */}
              <header className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileSidebar(true)}
                    className="md:hidden p-2 -ml-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Назад к списку диалогов"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold" aria-hidden="true">
                    {currentRoom.name[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm flex items-center gap-2">
                      {currentRoom.name}
                      {currentRoom.role === 'Поставщик' && <CheckCircle2 size={14} className="text-primary" aria-label="Верифицированный поставщик" />}
                    </h2>
                    <span className="text-[10px] text-gray-500">
                      {currentRoom.role} · {currentRoom.online ? 'В сети' : 'Был недавно'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
                    aria-label="Меню чата"
                    aria-expanded={menuOpen}
                  >
                    <MoreVertical size={20} />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                      <div
                        className="absolute right-0 top-full mt-2 w-52 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150"
                        role="menu"
                      >
                        <Link
                          to={`/suppliers/${currentRoom.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm"
                          role="menuitem"
                        >
                          <UserCircle size={16} className="text-primary" aria-hidden="true" /> Профиль поставщика
                        </Link>
                        <button
                          onClick={handleClearChat}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm border-t border-white/5"
                          role="menuitem"
                        >
                          <Trash2 size={16} className="text-gray-400" aria-hidden="true" /> Очистить историю
                        </button>
                        <button
                          onClick={() => { notify('Жалоба отправлена', 'info'); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm border-t border-white/5 text-red-400"
                          role="menuitem"
                        >
                          <Flag size={16} aria-hidden="true" /> Пожаловаться
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </header>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth"
                role="log"
                aria-label="История сообщений"
                aria-live="polite"
              >
                {currentRoom.messages.map((msg, i) => (
                  <article
                    key={msg.id ?? i}
                    className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}
                  >
                    {!msg.isOwn && (
                      <span className="text-[10px] text-gray-500 mb-1 px-1">{msg.senderName}</span>
                    )}
                    <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[70%] ${
                      msg.isOwn
                        ? 'bg-primary text-black rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <time
                        dateTime={msg.time}
                        className={`text-[10px] mt-2 block ${msg.isOwn ? 'opacity-60' : 'text-gray-500'}`}
                      >
                        {msg.time}
                      </time>
                    </div>
                  </article>
                ))}

                {currentRoom.messages.length === 0 && (
                  <div className="text-center py-20 text-gray-500 text-sm italic">
                    Начните диалог с собеседником
                  </div>
                )}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-primary animate-pulse" aria-live="polite" aria-label="Собеседник печатает">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                    <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">Собеседник печатает...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-white/10 bg-dark-input">
                {attachment && (
                  <div className="px-4 pt-3 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-xl">
                      <FileText size={13} aria-hidden="true" /> {attachment.name}
                      <span className="text-primary/60 font-normal">({(attachment.size / 1024).toFixed(0)} КБ)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-gray-500 hover:text-white transition-colors"
                      aria-label="Удалить вложение"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <form
                  className="p-4 flex items-center gap-4"
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  aria-label="Форма отправки сообщения"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={e => setAttachment(e.target.files?.[0] ?? null)}
                    aria-label="Прикрепить файл"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-xl transition-all ${attachment ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-white/5'}`}
                    title="Прикрепить файл"
                    aria-label="Прикрепить файл"
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Напишите сообщение..."
                    value={text}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    aria-label="Текст сообщения"
                    className="flex-grow bg-dark-card border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() && !attachment}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 transition-all"
                    aria-label="Отправить сообщение"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-10 space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                <MessageCircle size={40} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Выберите диалог</h3>
                <p className="text-gray-500 text-sm">Выберите чат слева, чтобы начать общение</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};
