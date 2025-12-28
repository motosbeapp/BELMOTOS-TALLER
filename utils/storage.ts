
import { WorkshopOrder, OperationType, OrderStatus } from '../types.ts';

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

export const seedDemoData = () => {
  const demoOrders: WorkshopOrder[] = [
    {
      id: "458291",
      entryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      operationType: OperationType.REPARACION,
      status: OrderStatus.COMPLETADO,
      completionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCost: 150000,
      workHours: 4,
      owner: { name: "Juan Pérez", idNumber: "12345678", phone: "555-0101", email: "juan@example.com" },
      motorcycle: { model: "Yamaha MT-07", plate: "ABC-123", displacement: "700cc", year: "2022", color: "Azul", chassisSerial: "YAM123456", engineSerial: "ENG789", mileage: "12500" },
      checklist: {},
      observations: "Cambio de kit de arrastre.",
      clientReport: "Ruido en la cadena.",
      technicianNotes: "Se reemplazó kit marca DID.",
      updates: []
    },
    {
      id: "229104",
      entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      operationType: OperationType.REVISION,
      status: OrderStatus.EN_PROCESO,
      estimatedCost: 80000,
      workHours: 2,
      owner: { name: "María Garcia", idNumber: "87654321", phone: "555-0202", email: "maria@example.com" },
      motorcycle: { model: "Honda CB500X", plate: "XYZ-987", displacement: "500cc", year: "2021", color: "Rojo", chassisSerial: "HON654321", engineSerial: "ENG321", mileage: "8400" },
      checklist: {},
      observations: "Mantenimiento 8000km.",
      clientReport: "Revisión general.",
      technicianNotes: "Aceite drenado. Filtro cambiado.",
      updates: []
    }
  ];
  saveOrders(demoOrders);
};
