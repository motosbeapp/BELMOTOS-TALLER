
import React, { useState } from 'react';
import { WorkshopOrder, OperationType, OrderStatus } from '../types.ts';
import { CHECKLIST_DATA, CHECKLIST_ITEMS, MotorcycleIcon } from '../constants.tsx';
import { generateOrderId } from '../utils/storage.ts';
import { Camera, Save, User, ListChecks, ShieldAlert } from 'lucide-react';

interface ReceptionFormProps {
  onSave: (order: WorkshopOrder) => void;
}

const ReceptionForm: React.FC<ReceptionFormProps> = ({ onSave }) => {
  const [formData, setFormData] = useState<Partial<WorkshopOrder>>({
    id: generateOrderId(),
    entryDate: new Date().toISOString(),
    operationType: OperationType.REVISION,
    status: OrderStatus.PENDIENTE,
    owner: { name: '', idNumber: '', phone: '', email: '' },
    motorcycle: { 
      model: '', chassisSerial: '', engineSerial: '', 
      displacement: '', plate: '', mileage: '', 
      color: '', year: '' 
    },
    checklist: CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item]: true }), {}),
    observations: '',
    clientReport: '',
    updates: [],
    workHours: 0
  });

  const [previewVehicle, setPreviewVehicle] = useState<string | null>(null);
  const [previewChassis, setPreviewChassis] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoVehicle' | 'photoChassis') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, [field]: result }));
        if (field === 'photoVehicle') setPreviewVehicle(result);
        else setPreviewChassis(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as any),
          [field]: value
        }
      }));
    }
  };

  const toggleChecklist = (item: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [item]: !prev.checklist?.[item]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as WorkshopOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Recepción</h1>
          <p className="text-gray-500">Orden de Servicio #{formData.id}</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all font-bold active:scale-95"
          >
            <Save size={18} />
            Guardar Orden
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <User size={20} />
              <h2 className="font-semibold text-lg">Datos del Propietario</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.owner?.name}
                  onChange={(e) => handleInputChange('owner', 'name', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CI / RIF</label>
                <input 
                  type="text" 
                  value={formData.owner?.idNumber}
                  onChange={(e) => handleInputChange('owner', 'idNumber', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <input 
                  type="tel" 
                  value={formData.owner?.phone}
                  onChange={(e) => handleInputChange('owner', 'phone', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={formData.owner?.email}
                  onChange={(e) => handleInputChange('owner', 'email', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <MotorcycleIcon size={24} />
              <h2 className="font-semibold text-lg">Datos de la Motocicleta</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Placa</label>
                <input 
                  type="text" 
                  value={formData.motorcycle?.plate}
                  onChange={(e) => handleInputChange('motorcycle', 'plate', e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Modelo</label>
                <input 
                  type="text" 
                  value={formData.motorcycle?.model}
                  onChange={(e) => handleInputChange('motorcycle', 'model', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Kilometraje</label>
                <input 
                  type="number" 
                  value={formData.motorcycle?.mileage}
                  onChange={(e) => handleInputChange('motorcycle', 'mileage', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Año</label>
                <input 
                  type="number" 
                  value={formData.motorcycle?.year}
                  onChange={(e) => handleInputChange('motorcycle', 'year', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert size={20} />
              <h2 className="font-bold">Condiciones del Servicio</h2>
            </div>
            <div className="text-xs text-amber-900/80 italic">
              <p>El cliente acepta que el taller no responde por objetos dejados en el vehículo ni por daños fortuitos ajenos al proceso de reparación.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <ListChecks size={20} />
              <h2 className="font-semibold text-lg">Inventario</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {CHECKLIST_DATA.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{cat.category}</h3>
                  {cat.items.map((item) => (
                    <label key={item} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-xs text-gray-600">{item}</span>
                      <input 
                        type="checkbox" 
                        checked={formData.checklist?.[item] || false}
                        onChange={() => toggleChecklist(item)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReceptionForm;
