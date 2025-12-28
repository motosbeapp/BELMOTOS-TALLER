
import React, { useState, useMemo } from 'react';
import { WorkshopOrder, OrderStatus, OrderUpdate } from '../types';
import { 
  Search, FileDown, Eye, Filter, ChevronRight, X, 
  Save, Camera, Clock, Wrench, User, Bike, Trash2, 
  Plus, History, ClipboardCheck, DollarSign
} from 'lucide-react';
import { STATUS_COLORS, STATUS_ICONS, MotorcycleIcon } from '../constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateOrderPDF, generateTechnicalReportPDF } from '../utils/pdf';

interface OrderManagementProps {
  orders: WorkshopOrder[];
  onUpdateOrder: (order: WorkshopOrder) => void;
  onDeleteOrder: (id: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, onUpdateOrder, onDeleteOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<WorkshopOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.includes(searchTerm) || 
        order.motorcycle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.owner.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }, [orders, searchTerm, statusFilter]);

  const handleUpdate = (updated: WorkshopOrder) => {
    onUpdateOrder(updated);
    // No cerramos el modal para permitir seguir editando o generar reportes
  };

  const handleDelete = (id: string) => {
    onDeleteOrder(id);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-sm text-gray-500">{filteredOrders.length} órdenes en el sistema</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar placa, ID o nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">Todos los estados</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orden #{order.id}</span>
                  <h3 className="text-lg font-bold text-gray-900">{order.motorcycle.plate}</h3>
                  <p className="text-xs text-gray-500">{order.motorcycle.model}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <User size={14} className="text-gray-400" />
                <span>{order.owner.name}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-[10px] text-gray-400">{format(new Date(order.entryDate), 'dd MMM yyyy', { locale: es })}</span>
                <button className="text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <ClipboardCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hay órdenes</h3>
          <p className="text-gray-500">No se encontraron resultados para los filtros aplicados.</p>
        </div>
      )}

      {selectedOrder && (
        <OrderEditModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

const OrderEditModal = ({ order, onClose, onUpdate, onDelete }: { 
  order: WorkshopOrder, 
  onClose: () => void, 
  onUpdate: (o: WorkshopOrder) => void,
  onDelete: (id: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'technical' | 'process'>('technical');
  // Usamos copia profunda para evitar mutaciones directas de props
  const [localOrder, setLocalOrder] = useState<WorkshopOrder>(JSON.parse(JSON.stringify(order)));

  const handleSave = () => {
    if (localOrder.status === OrderStatus.COMPLETADO && !localOrder.completionDate) {
      localOrder.completionDate = new Date().toISOString();
    }
    onUpdate(localOrder);
    onClose();
  };

  const addProcessUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUpdate: OrderUpdate = {
          timestamp: new Date().toISOString(),
          note: 'Evidencia añadida',
          photo: reader.result as string
        };
        setLocalOrder(prev => ({
          ...prev,
          updates: [...(prev.updates || []), newUpdate]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUpdate = (index: number) => {
    const newUpdates = [...localOrder.updates];
    newUpdates.splice(index, 1);
    setLocalOrder({ ...localOrder, updates: newUpdates });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${STATUS_COLORS[localOrder.status]}`}>
              {STATUS_ICONS[localOrder.status]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Orden #{localOrder.id}</h2>
              <p className="text-xs text-gray-500">{localOrder.motorcycle.plate} — {localOrder.motorcycle.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => generateTechnicalReportPDF(localOrder)}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-semibold text-sm"
            >
              <FileDown size={18} />
              Reporte Técnico
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-50 bg-gray-50/30">
          <TabButton active={activeTab === 'technical'} onClick={() => setActiveTab('technical')} icon={<Wrench size={16} />} label="Gestión Técnica" />
          <TabButton active={activeTab === 'process'} onClick={() => setActiveTab('process')} icon={<History size={16} />} label="Bitácora de Avances" />
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<Eye size={16} />} label="Ficha Original" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'technical' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado del Trabajo</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={localOrder.status}
                    onChange={(e) => setLocalOrder({...localOrder, status: e.target.value as OrderStatus})}
                  >
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Horas de Mano de Obra</label>
                  <input 
                    type="number"
                    step="0.5"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={localOrder.workHours}
                    onChange={(e) => setLocalOrder({...localOrder, workHours: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Costo Final ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={localOrder.estimatedCost || 0}
                      onChange={(e) => setLocalOrder({...localOrder, estimatedCost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Diagnóstico y Notas Técnicas</label>
                <textarea 
                  rows={8}
                  placeholder="Describa el trabajo realizado, piezas cambiadas y recomendaciones para el cliente..."
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={localOrder.technicianNotes}
                  onChange={(e) => setLocalOrder({...localOrder, technicianNotes: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-gray-900">Historial Fotográfico</h3>
                 <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all font-bold text-sm">
                   <Plus size={18} /> Añadir Avance
                   <input type="file" accept="image/*" className="hidden" onChange={addProcessUpdate} />
                 </label>
               </div>

               {localOrder.updates && localOrder.updates.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {localOrder.updates.map((update, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                       <button 
                        onClick={() => removeUpdate(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                       >
                         <Trash2 size={14} />
                       </button>
                       <img src={update.photo} className="w-full aspect-video object-cover rounded-xl mb-3" />
                       <p className="text-[10px] text-gray-400 mb-1">{format(new Date(update.timestamp), 'PPpp', { locale: es })}</p>
                       <input 
                          className="w-full text-sm bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Nota de avance..."
                          value={update.note}
                          onChange={(e) => {
                            const newUpdates = [...localOrder.updates];
                            newUpdates[idx].note = e.target.value;
                            setLocalOrder({...localOrder, updates: newUpdates});
                          }}
                       />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                   <p className="text-gray-400">No hay fotos de avances registradas todavía.</p>
                 </div>
               )}
             </div>
          )}

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-[2rem]">
                  <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-emerald-700">
                    <User size={18} /> Datos Propietario
                  </h4>
                  <dl className="space-y-3">
                    <InfoRow label="Nombre" value={localOrder.owner.name} />
                    <InfoRow label="CI/RIF" value={localOrder.owner.idNumber} />
                    <InfoRow label="Teléfono" value={localOrder.owner.phone} />
                    <InfoRow label="Email" value={localOrder.owner.email} />
                  </dl>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem]">
                  <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-emerald-700">
                    <Bike size={18} /> Especificaciones Moto
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <InfoRow label="Modelo" value={localOrder.motorcycle.model} />
                    <InfoRow label="Placa" value={localOrder.motorcycle.plate} />
                    <InfoRow label="Kilometraje" value={`${localOrder.motorcycle.mileage} KM`} />
                    <InfoRow label="Año" value={localOrder.motorcycle.year} />
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem]">
                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-emerald-700">
                  <ClipboardCheck size={18} /> Reporte Inicial
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Problema Reportado</span>
                    <p className="text-sm text-gray-700 mt-1 italic">{localOrder.clientReport || 'Sin reporte detallado'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Observaciones del Recibidor</span>
                    <p className="text-sm text-gray-700 mt-1 italic">{localOrder.observations || 'Sin observaciones'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex justify-between items-center gap-3">
          <button 
            onClick={() => onDelete(localOrder.id)} 
            className="flex items-center gap-2 px-6 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
            Eliminar Orden
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-gray-500 font-bold">Cancelar</button>
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-5 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
      active 
        ? 'text-emerald-700 border-emerald-600 bg-white' 
        : 'text-gray-400 border-transparent hover:text-gray-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</dt>
    <dd className="text-sm text-gray-900 font-medium">{value || '---'}</dd>
  </div>
);

export default OrderManagement;
