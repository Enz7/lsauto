export type UserRole = 'Клиент' | 'Поставщик' | 'Посредник' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  isVerified: boolean;
  level: number;
  description?: string;
  phone?: string;
  photoUrl?: string;
  rating?: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  origin: 'Китай' | 'Европа' | 'Южная Корея';
  transmission: string;
  fuel: string;
  mileage: number;
  description: string;
  city: string;
  supplierId: string;
  images: string[];
  isTrending: boolean;
  tags: string[];
  generation?: string;
  bodyType?: string;
  driveType?: string;
  engineVolume?: number;
  power?: number;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Deal {
  id: string;
  carName: string;
  status: 'выкуплено' | 'таможня' | 'в пути' | 'выдано';
  escrowStatus: 'none' | 'held' | 'released' | 'refunded';
  escrowAmount: number;
  date: string;
}

export interface UserRequest {
  id: string;
  brand: string;
  model: string;
  budget: number;
  comment: string;
  date: string;
  status: string;
  city?: string;
  year?: string;
}

export interface Post {
  id: number;
  supplierId: string;
  supplierName: string;
  type: string;
  title: string;
  text: string;
  image: string;
  likes: number;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  city: string;
  contacts: string;
  description: string;
  experience: string;
  docsStatus: 'проверен' | 'не проверен';
  photos: string[];
  rating: number;
  level: number;
  isVerified: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  createdAt: string;
  isOwn: boolean;
}

export interface Chat {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  online: boolean;
  history: Message[];
}

export interface Trend {
  brand: string;
  model: string;
  requestCount: number;
  dynamics: 'рост' | 'падение';
}

export interface AppNotification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
