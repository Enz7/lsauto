
import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, MessageCircle, Heart, Share2, Star, Award, LayoutGrid, Video, Image, MapPin, Search, Send, X, Check, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CITIES = ['Москва', 'Санкт-Петербург', 'Владивосток'];
const SUPPLIER_CITY: Record<string, string> = { s1: 'Москва', s2: 'Санкт-Петербург', s3: 'Владивосток' };
const VERIFIED_SUPPLIERS = new Set(['s1', 's2', 's3']);

interface Comment { id: number; user: string; text: string; time: string; }

export const SupplierFeed = () => {
  const { notify, setActiveChatId, posts, likePost, isLoggedIn, userRole } = useApp();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<'все' | 'photo' | 'video'>('все');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Liked state (local toggle)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Comments per post
  const [localComments, setLocalComments] = useState<Record<number, Comment[]>>({});
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Share
  const [copiedPost, setCopiedPost] = useState<number | null>(null);

  const filtered = posts.filter(p => {
    if (typeFilter === 'photo' && p.type !== 'photo') return false;
    if (typeFilter === 'video' && p.type !== 'video') return false;
    if (cityFilter && SUPPLIER_CITY[p.supplierId] !== cityFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.supplierName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleLike = (postId: number) => {
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => { const s = new Set(prev); s.delete(postId); return s; });
      notify('Лайк убран', 'info');
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
      likePost(postId);
    }
  };

  const toggleComments = (postId: number) => {
    setOpenComments(prev => prev === postId ? null : postId);
    setCommentText('');
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleAddComment = (postId: number) => {
    const text = commentText.trim();
    if (!text) return;
    const newComment: Comment = {
      id: Date.now(),
      user: isLoggedIn ? (userRole ?? 'Пользователь') : 'Гость',
      text,
      time: 'Только что',
    };
    setLocalComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), newComment] }));
    setCommentText('');
    notify('Комментарий добавлен', 'success');
  };

  const handleShare = async (postId: number, title: string) => {
    const url = `${window.location.origin}/feed#post-${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (_) {}
    }
    await navigator.clipboard.writeText(url);
    setCopiedPost(postId);
    notify('Ссылка скопирована', 'success');
    setTimeout(() => setCopiedPost(null), 2000);
  };

  const handleWrite = (supplierId: string) => {
    setActiveChatId(supplierId);
    navigate('/messages');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Поиск по публикациям..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'все', label: 'Все', icon: LayoutGrid },
            { key: 'photo', label: 'Фото', icon: Image },
            { key: 'video', label: 'Видео', icon: Video },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key as typeof typeFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${typeFilter === key ? 'bg-primary text-black' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          <button
            onClick={() => setCityFilter('')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!cityFilter ? 'bg-white/10 text-white' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'}`}
          >
            <MapPin size={14} /> Все города
          </button>
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setCityFilter(city === cityFilter ? '' : city)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${cityFilter === city ? 'bg-white/10 text-white' : 'bg-dark-card border border-white/5 text-gray-400 hover:text-white'}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Лидеры месяца */}
      <section className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-3xl p-8 overflow-hidden relative group">
        <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Star className="text-primary" fill="currentColor" />
          Лидеры месяца
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { name: 'China Auto Export', id: 's1', rank: 'Золото', color: 'text-yellow-500', icon: '🥇' },
            { name: 'Euro Car Import', id: 's2', rank: 'Серебро', color: 'text-gray-400', icon: '🥈' },
            { name: 'Korea Prime Motors', id: 's3', rank: 'Бронза', color: 'text-orange-500', icon: '🥉' },
          ].map((leader, i) => (
            <Link
              key={i}
              to={`/suppliers/${leader.id}`}
              className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl text-center space-y-3 hover:border-primary/40 transition-all"
            >
              <div className="text-4xl">{leader.icon}</div>
              <div>
                <div className={`text-[10px] font-bold uppercase ${leader.color}`}>{leader.rank}</div>
                <div className="font-bold text-sm">{leader.name}</div>
              </div>
              <div className="text-[10px] text-gray-500">Рейтинг: 5.0 • 45 сделок</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Посты */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filtered.map(post => {
          const isLiked = likedPosts.has(post.id);
          const postComments = localComments[post.id] ?? [];
          const totalComments = post.comments + postComments.length;
          const isCommentsOpen = openComments === post.id;
          const isCopied = copiedPost === post.id;

          return (
            <article key={post.id} id={`post-${post.id}`} className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden group hover:border-white/10 transition-all flex flex-col">
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <Link to={`/suppliers/${post.supplierId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-sm">
                    {post.supplierName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      {post.supplierName}
                      {VERIFIED_SUPPLIERS.has(post.supplierId) && (
                        <ShieldCheck size={13} className="text-primary shrink-0" />
                      )}
                    </h4>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">{post.date}</div>
                  </div>
                </Link>
                <button
                  onClick={() => handleWrite(post.supplierId)}
                  title="Написать поставщику"
                  className="bg-white/5 hover:bg-primary hover:text-black p-2 rounded-xl transition-all"
                >
                  <MessageCircle size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-grow">
                <h3 className="text-base font-bold leading-snug">{post.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{post.text}</p>
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                  {post.type === 'video' && (
                    <button
                      onClick={() => notify('Воспроизведение видео в демо-режиме', 'info')}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all"
                    >
                      <div className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                        <Play fill="currentColor" />
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 bg-white/5 flex items-center gap-4 border-t border-white/5">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-110 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                  {post.likes + (isLiked ? 1 : 0)}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isCommentsOpen ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                >
                  <MessageCircle size={15} />
                  {totalComments}
                </button>
                <button
                  onClick={() => handleShare(post.id, post.title)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ml-auto ${isCopied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {isCopied ? <><Check size={15} /> Скопировано</> : <><Share2 size={15} /> Поделиться</>}
                </button>
              </div>

              {/* Comments panel */}
              {isCommentsOpen && (
                <div className="border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                  {/* Existing comments */}
                  <div className="max-h-56 overflow-y-auto">
                    {postComments.length === 0 && post.comments === 0 && (
                      <div className="px-5 py-4 text-xs text-gray-600 text-center">Будьте первым, кто оставит комментарий</div>
                    )}
                    {/* Fake initial comments from post.comments count */}
                    {post.comments > 0 && postComments.length === 0 && (
                      <div className="px-5 py-3 text-xs text-gray-500 text-center border-b border-white/5">
                        {post.comments} комментариев скрыто — войдите, чтобы увидеть
                      </div>
                    )}
                    {postComments.map(c => (
                      <div key={c.id} className="px-5 py-3 border-b border-white/5 last:border-none">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-[10px] font-bold">
                            {c.user[0]}
                          </div>
                          <span className="text-xs font-bold">{c.user}</span>
                          <span className="text-[10px] text-gray-600 ml-auto">{c.time}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed pl-8">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-3 flex gap-2 bg-black/20">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Написать комментарий..."
                      className="flex-grow bg-dark-card border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim()}
                      className="w-9 h-9 bg-primary disabled:opacity-30 text-black rounded-xl flex items-center justify-center shrink-0 hover:bg-primary-hover transition-all"
                    >
                      <Send size={14} />
                    </button>
                    <button
                      onClick={() => setOpenComments(null)}
                      className="w-9 h-9 bg-white/5 text-gray-400 hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-dark-card border border-white/5 rounded-3xl">
          <LayoutGrid size={40} className="text-gray-700 mx-auto mb-4" />
          <div className="text-gray-500 font-bold">Публикаций не найдено</div>
          <button onClick={() => { setTypeFilter('все'); setCityFilter(''); setSearch(''); }} className="mt-4 text-primary text-sm font-bold hover:underline">
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};
