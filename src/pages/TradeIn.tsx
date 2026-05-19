
import { useState } from 'react';
import { Car, ArrowRight, CheckCircle2, RefreshCw, ChevronDown } from 'lucide-react';

const BRANDS = ['Geely', 'BMW', 'Toyota', 'Hyundai', 'Kia', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Lada', 'Chevrolet', 'Ford', 'Nissan', 'Mazda', 'Mitsubishi', 'Lexus', 'Другое'];
const CONDITIONS = ['Отличное', 'Хорошее', 'Среднее', 'Требует ремонта'];

const BASE_MSRP: Record<string, number> = {
  'Geely': 2800000, 'BMW': 6500000, 'Toyota': 3500000, 'Hyundai': 2200000,
  'Kia': 2400000, 'Mercedes-Benz': 7000000, 'Audi': 5500000,
  'Volkswagen': 3200000, 'Lada': 900000, 'Chevrolet': 2500000,
  'Ford': 2800000, 'Nissan': 2600000, 'Mazda': 3000000,
  'Mitsubishi': 2700000, 'Lexus': 5000000, 'Другое': 2500000,
};

const CONDITION_COEFF: Record<string, number> = {
  'Отличное': 0.85,
  'Хорошее': 0.75,
  'Среднее': 0.62,
  'Требует ремонта': 0.45,
};

export const TradeIn = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('Хорошее');
  const [owners, setOwners] = useState('1');
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !year || !mileage) return;

    const age = currentYear - Number(year);
    const mileageNum = Number(mileage.replace(/\s/g, ''));
    const baseMsrp = BASE_MSRP[brand] ?? 2500000;
    const ageFactor = Math.max(0.3, 1 - age * 0.07);
    const mileageFactor = Math.max(0.5, 1 - (mileageNum / 200000) * 0.3);
    const condCoeff = CONDITION_COEFF[condition] ?? 0.75;
    const ownersFactor = Number(owners) === 1 ? 1 : Number(owners) === 2 ? 0.95 : 0.88;

    const raw = baseMsrp * ageFactor * mileageFactor * condCoeff * ownersFactor;
    setEstimate({ min: Math.round(raw * 0.92 / 1000) * 1000, max: Math.round(raw * 1.08 / 1000) * 1000 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setBrand(''); setModel(''); setYear(''); setMileage('');
    setCondition('Хорошее'); setOwners('1');
    setEstimate(null); setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-black">Заявка принята!</h1>
        <p className="text-gray-400 text-lg">Наши партнёры-поставщики получили вашу заявку на трейд-ин и свяжутся с вами в течение 30 минут.</p>
        <div className="bg-dark-card border border-white/10 rounded-3xl p-8 text-left space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Автомобиль:</span><span className="font-bold">{brand} {model} {year}г.</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Пробег:</span><span className="font-bold">{mileage} км</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Состояние:</span><span className="font-bold">{condition}</span></div>
          {estimate && (
            <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
              <span className="text-gray-500">Предв. оценка:</span>
              <span className="font-black text-primary">{estimate.min.toLocaleString()} – {estimate.max.toLocaleString()} ₽</span>
            </div>
          )}
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 mx-auto text-primary font-bold hover:underline">
          <RefreshCw size={16} /> Новая оценка
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
          <RefreshCw size={14} /> Trade-in
        </div>
        <h1 className="text-4xl md:text-5xl font-black">Оцените свой автомобиль</h1>
        <p className="text-gray-400 text-lg">Узнайте предварительную стоимость вашего авто и зачтите её в счёт покупки нового</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* How it works */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">Как это работает</h2>
          {[
            { n: '01', title: 'Заполните форму', desc: 'Укажите данные вашего автомобиля — марку, год, пробег и состояние' },
            { n: '02', title: 'Получите оценку', desc: 'Система рассчитает предварительную рыночную стоимость вашего авто' },
            { n: '03', title: 'Подтвердите заявку', desc: 'Поставщики свяжутся с вами и согласуют финальную цену и условия сделки' },
          ].map(step => (
            <div key={step.n} className="flex gap-4 bg-dark-card border border-white/5 p-5 rounded-2xl">
              <div className="text-3xl font-black text-primary/30 shrink-0">{step.n}</div>
              <div>
                <div className="font-bold mb-1">{step.title}</div>
                <div className="text-sm text-gray-500">{step.desc}</div>
              </div>
            </div>
          ))}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-sm text-gray-400">
            <Car size={24} className="text-primary mb-3" />
            <strong className="text-white block mb-1">Принимаем любые авто</strong>
            Мы принимаем автомобили любых марок, годов и состояний. Итоговая сумма зачтётся как первоначальный взнос за новый авто.
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={estimate ? handleSubmit : handleCalculate} className="bg-dark-card border border-white/5 rounded-[2.5rem] p-5 sm:p-8 md:p-10 space-y-6">
            <h2 className="text-2xl font-black">Данные вашего автомобиля</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Марка</label>
                <div className="relative">
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    <option value="">Выберите марку</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Модель</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="Например: Monjaro"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Год выпуска</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder={String(currentYear - 3)}
                  min="1990"
                  max={currentYear}
                  required
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Пробег (км)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={e => setMileage(e.target.value)}
                  placeholder="80000"
                  min="0"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Состояние</label>
                <div className="relative">
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Количество владельцев</label>
                <div className="relative">
                  <select
                    value={owners}
                    onChange={e => setOwners(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    <option value="1">1 владелец</option>
                    <option value="2">2 владельца</option>
                    <option value="3">3 и более</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {estimate && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-xs text-primary font-black uppercase tracking-widest mb-2">Предварительная оценка</div>
                <div className="text-3xl font-black text-primary">{estimate.min.toLocaleString()} – {estimate.max.toLocaleString()} ₽</div>
                <div className="text-xs text-gray-500 mt-2">Финальная стоимость уточняется после осмотра. Оценка действительна 7 дней.</div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest text-sm"
            >
              {estimate ? (
                <><CheckCircle2 size={20} /> Отправить заявку поставщикам</>
              ) : (
                <><ArrowRight size={20} /> Рассчитать стоимость</>
              )}
            </button>

            {estimate && (
              <button type="button" onClick={() => setEstimate(null)} className="w-full text-gray-500 hover:text-white text-sm font-bold py-2 transition-colors">
                ← Изменить данные
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
