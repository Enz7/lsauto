import { Router } from 'express';

const router = Router();

const CUSTOMS_RATES = {
  duty_rates: { 'Китай': 0.15, 'Европа': 0.20, 'Южная Корея': 0.15 } as Record<string, number>,
  excise_per_hp: [
    { maxHp: 90, rate: 0 }, { maxHp: 150, rate: 45 },
    { maxHp: 200, rate: 437 }, { maxHp: 300, rate: 714 },
    { maxHp: 400, rate: 1218 }, { maxHp: Infinity, rate: 1584 },
  ],
  recycling_fee: { first: 3400, subsequent: 6000 },
};

router.post('/calculate', async (req, res) => {
  const { carPrice, origin, enginePower, isFirstCar } = req.body;
  if (!carPrice || !enginePower) {
    return res.status(400).json({ error: 'carPrice и enginePower обязательны' });
  }
  const price = Number(carPrice);
  const hp = Number(enginePower);
  const dutyRate = CUSTOMS_RATES.duty_rates[origin] || 0.15;
  const duty = price * dutyRate;
  const exciseRate = CUSTOMS_RATES.excise_per_hp.find(r => hp <= r.maxHp)?.rate || 0;
  const excise = exciseRate * hp;
  const recycling = isFirstCar ? CUSTOMS_RATES.recycling_fee.first : CUSTOMS_RATES.recycling_fee.subsequent;
  const vatBase = price + duty + excise;
  const vat = vatBase * 0.2;
  const total = duty + excise + recycling + vat;
  res.json({
    carPrice: price, duty: Math.round(duty), excise: Math.round(excise),
    recyclingFee: recycling, vat: Math.round(vat),
    total: Math.round(total), totalWithCar: Math.round(price + total),
  });
});

export default router;
