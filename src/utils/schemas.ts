import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(6, 'Пароль должен быть не менее 6 символов'),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное'),
  role: z.enum(['Клиент', 'Поставщик', 'Посредник'], {
    errorMap: () => ({ message: 'Выберите роль' }),
  }),
});

export const carSchema = z.object({
  brand: z.string().min(1, 'Укажите марку').max(100),
  model: z.string().min(1, 'Укажите модель').max(100),
  year: z.number().int().min(1990, 'Год не может быть раньше 1990').max(new Date().getFullYear() + 1, 'Некорректный год'),
  price: z.number().positive('Цена должна быть положительной').max(100_000_000),
  origin: z.enum(['Китай', 'Европа', 'Южная Корея']),
  transmission: z.string().min(1, 'Укажите коробку'),
  fuel: z.string().min(1, 'Укажите тип топлива'),
  mileage: z.number().min(0).default(0),
  city: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
});

export const requestSchema = z.object({
  brand: z.string().min(1, 'Укажите марку').max(100),
  model: z.string().min(1, 'Укажите модель').max(100),
  budget: z.number().min(0, 'Бюджет не может быть отрицательным').max(100_000_000),
  year: z.string().optional(),
  city: z.string().max(255).optional(),
  comment: z.string().max(1000).optional(),
});

export const postSchema = z.object({
  title: z.string().min(3, 'Заголовок минимум 3 символа').max(500),
  text: z.string().min(5, 'Текст минимум 5 символов').max(5000),
  type: z.string().optional(),
});

export const customsSchema = z.object({
  carPrice: z.number().positive('Укажите цену автомобиля'),
  origin: z.enum(['Китай', 'Европа', 'Южная Корея']),
  enginePower: z.number().int().positive('Укажите мощность двигателя').max(2000),
  isFirstCar: z.boolean().default(true),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CarForm = z.infer<typeof carSchema>;
export type RequestForm = z.infer<typeof requestSchema>;
export type PostForm = z.infer<typeof postSchema>;
export type CustomsForm = z.infer<typeof customsSchema>;
