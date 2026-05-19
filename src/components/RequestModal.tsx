
import { Send, Car, DollarSign, Calendar, MessageSquare, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export const RequestModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { notify, submitRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [budget, setBudget] = useState('');
  const [year, setYear] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      submitRequest({
        brand,
        model,
        budget: budget ? Number(budget) : 0,
        year,
        city,
        comment,
      });
      notify('Заявка отправлена всем поставщикам!', 'success');
      setBrand(''); setModel(''); setBudget(''); setYear(''); setCity(''); setComment('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-card border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Car className="text-primary" size={20} />
            Оставить заявку на подбор
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-8 space-y-6 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Марка</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required placeholder="Напр: BMW" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Модель</label>
              <input type="text" value={model} onChange={e => setModel(e.target.value)} required placeholder="Напр: X5" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Бюджет (₽)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Напр: 5 000 000" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Год выпуска</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="Напр: 2021-2024" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Ваш город</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Напр: Москва" className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Комментарий к заказу</label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Опишите желаемую комплектацию, цвет и другие важные детали..."
              className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
            <MessageSquare className="text-primary mt-1 flex-shrink-0" size={18} />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Ваша заявка будет видна только верифицированным поставщикам в закрытом чате. Они смогут написать вам лично и предложить варианты, подходящие под ваш бюджет.
            </p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Отправить запрос поставщикам
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
