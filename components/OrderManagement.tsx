
import React, { useState, useMemo } from 'react';
import { WorkshopOrder, OrderStatus, OrderUpdate } from '../types';
import { 
  Search, FileDown, Eye, Filter, ChevronRight, X, 
  Save, Camera, Clock, Wrench, User, Bike, Trash2, 
  Plus, History, ClipboardCheck
} from 'lucide-react';
import { STATUS_COLORS, STATUS_ICONS, MotorcycleIcon } from '../constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateOrderPDF, generateTechnicalReportPDF } from '../utils/pdf';

interface OrderManagementProps {
  orders: WorkshopOrder[];
  onUpdateOrder: (order: WorkshopOrder) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, onUpdateOrder }) => {
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
    setSelectedOrder(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-sm text-gray-500">{filteredOrders.length} órdenes encontradas</p>
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

      {/* Responsive Table / Card View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrder(order)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="font-bold text-gray-900">#{order.id}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <MotorcycleIcon size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.motorcycle.plate}</p>
                <p className="text-xs text-gray-500">{order.motorcycle.model}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1"><User size={12} /> {order.owner.name}</span>
              <div className="flex gap-2">
                 {order.status === OrderStatus.COMPLETADO && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); generateTechnicalReportPDF(order); }}
                     className="text-blue-600"
                   >
                     <ClipboardCheck size={16} />
                   </button>
                 )}
                 <span>{format(new Date(order.entryDate), 'dd/MM/yy')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Orden</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Vehículo</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ingreso</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Horas</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map(order => (
              <tr 
                key={order.id} 
                className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-6 py-4"><span className="font-bold text-gray-900">#{order.id}</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{order.motorcycle.plate}</span>
                    <span className="text-xs text-gray-500">{order.motorcycle.model}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.owner.name}</td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {format(new Date(order.entryDate), 'dd/MM/yy HH:mm')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                    {order.workHours || 0}h
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); generateOrderPDF(order); }}
                      title="Hoja de Recepción"
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                    >
                      <FileDown size={18} />
                    </button>
                    {order.status === OrderStatus.COMPLETADO && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); generateTechnicalReportPDF(order); }}
                        title="Informe Técnico de Entrega"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        <ClipboardCheck size={18} />
                      </button>
                    )}
                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail & Edit Modal */}
      {selectedOrder && (
        <OrderEditModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

const OrderEditModal = ({ order, onClose, onUpdate }: { order: WorkshopOrder, onClose: () => void, onUpdate: (o: WorkshopOrder) => void }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'technical' | 'process'>('technical');
  const [localOrder, setLocalOrder] = useState<WorkshopOrder>({ ...order });

  const handleSave = () => {
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
          note: 'Nueva foto de avance',
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <MotorcycleIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Orden #{localOrder.id}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[localOrder.status]}`}>
                  {localOrder.status}
                </span>
                <span className="text-xs text-gray-400">Placa: <strong className="text-gray-900">{localOrder.motorcycle.plate}</strong></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex px-6 border-b border-gray-50 bg-gray-50/50">
          {[
            { id: 'technical', label: 'Técnico y Horas', icon: <Wrench size={16} /> },
            { id: 'process', label: 'Bitácora de Fotos', icon: <Camera size={16} /> },
            { id: 'info', label: 'Info Vehículo', icon: <Bike size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'technical' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Estado del Trabajo</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    value={localOrder.status}
                    onChange={(e) => setLocalOrder({...localOrder, status: e.target.value as OrderStatus})}
                  >
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Horas Laboradas</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                      value={localOrder.workHours}
                      onChange={(e) => setLocalOrder({...localOrder, workHours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Notas Técnicas y Diagnóstico</label>
                <textarea 
                  rows={8}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm leading-relaxed"
                  placeholder="Escribe aquí el procedimiento detallado, repuestos cambiados y diagnóstico final..."
                  value={localOrder.technicianNotes}
                  onChange={(e) => setLocalOrder({...localOrder, technicianNotes: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <History size={18} className="text-emerald-600" /> Avances del Proceso
                </h3>
                <label className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors text-sm font-semibold">
                  <Plus size={18} /> Añadir Foto
                  <input type="file" accept="image/*" className="hidden" onChange={addProcessUpdate} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(localOrder.updates || []).length > 0 ? localOrder.updates.map((update, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-white shrink-0">
                      <img src={update.photo} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">
                        {format(new Date(update.timestamp), 'dd MMM, HH:mm', { locale: es })}
                      </p>
                      <input 
                        className="w-full text-sm bg-transparent border-b border-gray-200 py-1 outline-none focus:border-emerald-500"
                        value={update.note}
                        onChange={(e) => {
                          const newUpdates = [...(localOrder.updates || [])];
                          newUpdates[idx].note = e.target.value;
                          setLocalOrder({...localOrder, updates: newUpdates});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newUpdates = localOrder.updates.filter((_, i) => i !== idx);
                          setLocalOrder({...localOrder, updates: newUpdates});
                        }}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Eliminar Registro
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 italic text-sm">No hay registros de fotos en esta reparación.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
                <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2"><User size={18} /> Propietario</h3>
                <div className="space-y-3">
                  <InfoItem label="Nombre" value={localOrder.owner.name} />
                  <InfoItem label="CI/RIF" value={localOrder.owner.idNumber} />
                  <InfoItem label="Teléfono" value={localOrder.owner.phone} />
                  <InfoItem label="Correo" value={localOrder.owner.email} />
                </div>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Bike size={18} /> Motocicleta</h3>
                <div className="space-y-3">
                  <InfoItem label="Placa" value={localOrder.motorcycle.plate} />
                  <InfoItem label="Modelo" value={localOrder.motorcycle.model} />
                  <InfoItem label="KM" value={`${localOrder.motorcycle.mileage} KM`} />
                  <InfoItem label="Año" value={localOrder.motorcycle.year} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-between items-center sticky bottom-0">
          <div className="flex gap-2">
            {localOrder.status === OrderStatus.COMPLETADO && (
              <button 
                onClick={() => generateTechnicalReportPDF(localOrder)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <ClipboardCheck size={20} />
                Generar Informe Técnico
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center border-b border-white/50 pb-2">
    <span className="text-xs text-gray-500 font-medium uppercase">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

export default OrderManagement;
