import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, carSchema, requestSchema, customsSchema } from './schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'test@mail.ru', password: 'secret123' });
    expect(result.success).toBe(true);
  });
  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/email/i);
  });
  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.ru', password: '123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/6/);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'Иван Иванов',
      email: 'ivan@mail.ru',
      password: 'secure99',
      role: 'Клиент',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({
      name: 'Тест',
      email: 'a@b.ru',
      password: '123456',
      role: 'Хакер',
    });
    expect(result.success).toBe(false);
  });
  it('rejects too short name', () => {
    const result = registerSchema.safeParse({
      name: 'А',
      email: 'a@b.ru',
      password: '123456',
      role: 'Клиент',
    });
    expect(result.success).toBe(false);
  });
});

describe('carSchema', () => {
  it('accepts valid car data', () => {
    const result = carSchema.safeParse({
      brand: 'Geely',
      model: 'Monjaro',
      year: 2024,
      price: 3500000,
      origin: 'Китай',
      transmission: 'Автомат',
      fuel: 'Бензин',
    });
    expect(result.success).toBe(true);
  });
  it('rejects negative price', () => {
    const result = carSchema.safeParse({
      brand: 'Geely',
      model: 'Monjaro',
      year: 2024,
      price: -1000,
      origin: 'Китай',
      transmission: 'Автомат',
      fuel: 'Бензин',
    });
    expect(result.success).toBe(false);
  });
  it('rejects year before 1990', () => {
    const result = carSchema.safeParse({
      brand: 'Geely',
      model: 'Monjaro',
      year: 1985,
      price: 1000000,
      origin: 'Китай',
      transmission: 'Автомат',
      fuel: 'Бензин',
    });
    expect(result.success).toBe(false);
  });
});

describe('customsSchema', () => {
  it('calculates valid customs input', () => {
    const result = customsSchema.safeParse({
      carPrice: 2500000,
      origin: 'Китай',
      enginePower: 150,
      isFirstCar: true,
    });
    expect(result.success).toBe(true);
  });
  it('rejects zero car price', () => {
    const result = customsSchema.safeParse({
      carPrice: 0,
      origin: 'Китай',
      enginePower: 150,
    });
    expect(result.success).toBe(false);
  });
});
