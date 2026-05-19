
export type Роль = 'Клиент' | 'Поставщик' | 'Посредник';

export interface Пользователь {
  id: string;
  имя: string;
  роль: Роль;
  город: string;
  верифицирован: boolean;
  уровень?: number; // 1-8
  аватар?: string;
}

export interface ВидеоСделки {
  id: string;
  url: string;
  заголовок: string;
  дата: string;
}

export interface Автомобиль {
  id: string;
  марка: string;
  модель: string;
  год: number;
  цена: number;
  страна: 'Китай' | 'Европа' | 'Южная Корея';
  коробка: string;
  топливо: string;
  пробег: number;
  описание: string;
  город: string;
  поставщикId: string;
  изображения: string[];
  тренд: boolean;
  теги: string[];
  поколение?: string;
  кузов?: string;
  привод?: string;
  объёмДвигателя?: number;
  мощность?: number;
}

export interface Заявка {
  id: string;
  клиентId: string;
  бюджет: number;
  марка: string;
  модель: string;
  год: number;
  комментарий: string;
  дата: string;
}

export interface Поставщик {
  id: string;
  название: string;
  город: string;
  контакты: string;
  описание: string;
  опыт: string;
  документыСтатус: 'проверен' | 'не проверен';
  фотографии: string[];
  рейтинг: number;
}

export interface Сообщение {
  id: string;
  отправительId: string;
  получательId: string;
  текст: string;
  дата: string;
  вложения?: string[];
}

export interface ЧатПоставщиковСообщение {
  id: string;
  поставщикId: string;
  текст: string;
  дата: string;
}

export interface Тренд {
  марка: string;
  модель: string;
  количествоЗапросов: number;
  динамика: 'рост' | 'падение';
}
