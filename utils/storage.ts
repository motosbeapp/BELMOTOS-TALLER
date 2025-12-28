// BELMOTOS - Storage Engine
const STORAGE_KEY = 'belmotos_data';

export const getOrders = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveOrders = (orders) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const generateOrderId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const seedDemoData = () => {
    const demo = [
        {
            id: "482910",
            entryDate: new Date().toISOString(),
            operationType: "Revisión",
            status: "Pendiente",
            owner: { name: "Pedro Armas", idNumber: "V-12.345.678", phone: "0412-5551212", email: "pedro@mail.com" },
            motorcycle: { plate: "AD4G92A", model: "KLR 650", year: "2023", color: "Negro", mileage: "1200", chassisSerial: "VIN-992122", engineSerial: "ENG-0012" },
            clientReport: "Cambio de aceite y revisión de frenos.",
            observations: "Moto impecable.",
            estimatedCost: 85,
            checklist: {},
            updates: []
        },
        {
            id: "229104",
            entryDate: new Date().toISOString(),
            operationType: "Reparación",
            status: "En Proceso",
            owner: { name: "Maria L. Garcia", idNumber: "V-20.991.223", phone: "0424-9008877", email: "maria@mail.com" },
            motorcycle: { plate: "BB1E01X", model: "Honda CB 190R", year: "2021", color: "Rojo", mileage: "15400", chassisSerial: "VIN-118822", engineSerial: "ENG-8821" },
            clientReport: "No enciende por el botón.",
            observations: "Golpe en tapa lateral izquierda.",
            estimatedCost: 120,
            checklist: {},
            updates: []
        }
    ];
    saveOrders(demo);
};
