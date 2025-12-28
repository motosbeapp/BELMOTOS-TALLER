
import { WorkshopOrder } from '../types';

const STORAGE_KEY = 'motocare_orders';

export const saveOrders = (orders: WorkshopOrder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const getOrders = (): WorkshopOrder[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateOrderId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};
