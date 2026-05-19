
import { useState, useEffect } from 'react';
import { Landmark, Receipt, Percent, Calendar, Wallet, Info, ShieldCheck, ChevronDown } from 'lucide-react';

const KASKO_BRANDS: Record<string, number> = {
  'Geely': 0.045, 'Haval': 0.047, 'Chery': 0.046, 'BYD': 0.048,
  'Zeekr': 0.052, 'Li Auto': 0.050,
  'BMW': 0.065, 'Mercedes-Benz': 0.068, 'Audi': 0.063,
  'Toyota': 0.042, 'Lexus': 0.055, 'Honda': 0.043,
  'Hyundai': 0.044, 'Kia': 0.044,
  'Volkswagen': 0.048, 'Skoda': 0.046,
  'Другое': 0.050,
};

export const FinancingCalculators = () => {
  const [type, setType] = useState<'credit' | 'leasing' | 'каско'>('credit');

  // Credit / Leasing
  const [price, setPrice] = useState(5000000);
  const [initial, setInitial] = useState(1000000);
  const [term, setTerm] = useState(36);
  const [rate, setRate] = useState(14.5);
  const [monthly, setMonthly] = useState(0);

  // КАСКО
  const [kaskoBrand, setKaskoBrand] = useState('Geely');
  const [kaskoYear, setKaskoYear] = useState(2024);
  const [kaskoPrice, setKaskoPrice] = useState(3500000);
  const [kaskoAnnual, setKaskoAnnual] = useState(0);
  const [kaskoMonthly, setKaskoMonthly] = useState(0);

  useEffect(() => {
    const principal = price - initial;
    const monthlyRate = (rate / 100) / 12;
    if (type === 'credit') {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      setMonthly(Math.round(payment));
    } else if (type === 'leasing') {
      const residual = price * 0.2;
      const payment = (principal - residual) / term + (principal * monthlyRate);
      setMonthly(Math.round(payment));
    }
  }, [price, initial, term, rate, type]);

  useEffect(() => {
    if (type !== 'каско') return;
    const age = new Date().getFullYear() - kaskoYear;
    const baseCoeff = KASKO_BRANDS[kaskoBrand] ?? 0.050;
    const ageFactor = age <= 1 ? 1.0 : age <= 3 ? 1.05 : age <= 5 ? 1.10 : 1.20;
    const annual = Math.round(kaskoPrice * baseCoeff * ageFactor / 1000) * 1000;
    setKaskoAnnual(annual);
    setKaskoMonthly(Math.round(annual / 12 / 100) * 100);
  }, [kaskoBrand, kaskoYear, kaskoPrice, type]);

  const tabs = [
    { key: 'credit', label: 'Автокредит', icon: Landmark },
    { key: 'leasing', label: 'Лизинг', icon: Receipt },
    { key: 'каско', label: 'КАСКО', icon: ShieldCheck },
  ] as const;

  return (
    <div className="bg-dark-card border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            {type === 'credit' ? <Landmark className="text-primary" size={32} /> : type === 'leasing' ? <Receipt className="text-primary" size={32} /> : <ShieldCheck className="text-primary" size={32} />}
            Финансовые услуги
          </h2>
          <p className="text-gray-500 text-sm">Рассчитайте оптимальный график платежей для покупки авто</p>
        </div>

        <div className="flex bg-black border border-white/10 p-1.5 rounded-2xl w-full md:w-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${type === t.key ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {type !== 'каско' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={14} /> Стоимость авто
                </label>
                <span className="text-primary font-black">{price.toLocaleString()} ₽</span>
              </div>
              <input type="range" min="1000000" max="25000000" step="100000" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full accent-primary bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Percent size={14} /> Первоначальный взнос
                </label>
                <span className="text-white font-bold">{initial.toLocaleString()} ₽</span>
              </div>
              <input type="range" min="0" max={price * 0.9} step="50000" value={initial} onChange={e => setInitial(Number(e.target.value))} className="w-full accent-primary bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Срок (мес)
                </label>
                <select value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary">
                  <option value={12}>12 месяцев</option>
                  <option value={24}>24 месяца</option>
                  <option value={36}>36 месяцев</option>
                  <option value={48}>48 месяцев</option>
                  <option value={60}>60 месяцев</option>
                  <option value={84}>84 месяца</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Percent size={14} /> Ставка (%)
                </label>
                <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              {type === 'credit' ? <Landmark size={120} /> : <Receipt size={120} />}
            </div>
            <div className="relative z-10 space-y-2">
              <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">Ежемесячный платеж</div>
              <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter">{monthly.toLocaleString()} ₽</div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mt-4">
                <Info size={12} className="text-primary" />
                {type === 'credit' ? 'Расчет по аннуитетной схеме' : 'Включая вычет по НДС и налогу на прибыль'}
              </div>
            </div>
            <div className="relative z-10 pt-10">
              <button className="w-full bg-primary hover:bg-primary-hover text-black font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all uppercase text-sm tracking-widest">
                Получить одобрение
              </button>
              <p className="text-[9px] text-gray-600 text-center mt-4">Предложение не является публичной офертой. Точные условия зависят от банка-партнера.</p>
            </div>
          </div>
        </div>
      ) : (
        /* КАСКО Calculator */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Марка автомобиля</label>
              <div className="relative">
                <select
                  value={kaskoBrand}
                  onChange={e => setKaskoBrand(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  {Object.keys(KASKO_BRANDS).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Год выпуска</label>
              <div className="relative">
                <select
                  value={kaskoYear}
                  onChange={e => setKaskoYear(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={14} /> Стоимость авто
                </label>
                <span className="text-primary font-black">{kaskoPrice.toLocaleString()} ₽</span>
              </div>
              <input
                type="range"
                min="500000"
                max="20000000"
                step="100000"
                value={kaskoPrice}
                onChange={e => setKaskoPrice(Number(e.target.value))}
                className="w-full accent-primary bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-gray-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                <Info size={14} className="text-primary" /> Что входит в расчёт
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
                <li>Ущерб при ДТП (полное КАСКО)</li>
                <li>Угон и хищение</li>
                <li>Стихийные бедствия</li>
                <li>Коэффициент износа по году</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Стоимость в год</div>
                <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter">{kaskoAnnual.toLocaleString()} ₽</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Ежемесячно</div>
                <div className="text-3xl font-black text-white">{kaskoMonthly.toLocaleString()} ₽</div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Марка</div>
                  <div className="text-sm font-black">{kaskoBrand}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Год</div>
                  <div className="text-sm font-black">{kaskoYear}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                <Info size={12} className="text-primary" />
                Приблизительный расчёт. Точная ставка — у страховщика.
              </div>
            </div>
            <div className="relative z-10 pt-8">
              <button className="w-full bg-primary hover:bg-primary-hover text-black font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all uppercase text-sm tracking-widest">
                Получить полис КАСКО
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
