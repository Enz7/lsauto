
import { useState, useEffect } from 'react';
import { Calculator, Truck, ShieldAlert } from 'lucide-react';

export const CustomsCalculator = () => {
  const [price, setPrice] = useState(25000);
  const [engine, setEngine] = useState(2000);
  const [age, setAge] = useState('3-5');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    // Упрощенная логика расчета пошлины для РФ
    let duty = 0;
    const euroRate = 105;
    const usdRate = 95;

    if (age === '0-3') {
      duty = price * 0.48 * usdRate;
    } else if (age === '3-5') {
      duty = engine * 1.7 * euroRate;
    } else {
      duty = engine * 3.2 * euroRate;
    }

    const recyclingFee = age === '0-3' ? 3400 : 5200;
    const logistics = 250000; // Примерная доставка
    
    const res = {
      carPrice: price * usdRate,
      duty: duty,
      fee: recyclingFee,
      logistics: logistics,
      total: Math.round(duty + recyclingFee + (price * usdRate) + logistics)
    };
    setDetails(res);
  }, [price, engine, age]);

  return (
    <div className="bg-dark-card border border-white/5 rounded-3xl p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Калькулятор «Под ключ»</h2>
          <p className="text-sm text-gray-500">Рассчитайте полную стоимость авто с доставкой и ПТС</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Цена за рубежом ($)</label>
          <input 
            type="number" 
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Объем двигателя (см³)</label>
          <input 
            type="number" 
            value={engine}
            onChange={(e) => setEngine(Number(e.target.value))}
            className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Возраст авто</label>
          <select 
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full bg-dark-input border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="0-3">Новая (до 3 лет)</option>
            <option value="3-5">3 - 5 лет (Оптимально)</option>
            <option value="5+">Старше 5 лет</option>
          </select>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Цена авто</div>
            <div className="text-lg font-bold">{details.carPrice?.toLocaleString()} ₽</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Таможня</div>
            <div className="text-lg font-bold text-red-400">+{details.duty?.toLocaleString()} ₽</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Утильсбор</div>
            <div className="text-lg font-bold">+{details.fee?.toLocaleString()} ₽</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Логистика</div>
            <div className="text-lg font-bold">+{details.logistics?.toLocaleString()} ₽</div>
          </div>
        </div>
        
        <div className="text-center lg:text-right min-w-[200px] border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
          <div className="text-gray-400 text-xs mb-1">Итого «Под ключ»:</div>
          <div className="text-4xl font-black text-primary mb-4">{details.total?.toLocaleString()} ₽</div>
          <button className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 w-full">
            Купить сейчас
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
          <Truck size={18} className="text-primary mt-1" />
          <div className="text-xs text-gray-400">Доставка в Москву/СПб включена в расчет (средний тариф: 250,000 ₽)</div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
          <ShieldAlert size={18} className="text-primary mt-1" />
          <div className="text-xs text-gray-400">Расчет является предварительным. Точная сумма зависит от курса ЦБ на день подачи декларации.</div>
        </div>
      </div>
    </div>
  );
};
