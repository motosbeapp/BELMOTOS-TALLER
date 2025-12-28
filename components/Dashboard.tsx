
import React, { useMemo } from 'react';
import { WorkshopOrder, OrderStatus } from '../types';
import { 
  PieChart as RePieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MotorcycleIcon } from '../constants';

interface DashboardProps {
  orders: WorkshopOrder[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDIENTE).length,
      inProgress: orders.filter(o => o.status === OrderStatus.EN_PROCESO).length,
      completed: orders.filter(o => o.status === OrderStatus.COMPLETADO).length,
    };
  }, [orders]);

  const operationData = useMemo(() => {
    const counts = orders.reduce((acc: any, order) => {
      acc[order.operationType] = (acc[order.operationType] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [orders]);

  const COLORS = ['#059669', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumen del Taller</h1>
        <div className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Calendar size={18} />
          <span className="text-sm font-medium">{format(new Date(), 'PPPP', { locale: es })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Órdenes" value={stats.total} icon={<TrendingUp className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Pendientes" value={stats.pending} icon={<Clock className="text-gray-600" />} color="bg-gray-100" />
        <StatCard title="En Proceso" value={stats.inProgress} icon={<AlertCircle className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Completados" value={stats.completed} icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Distribución por Tipo de Trabajo</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={operationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {operationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Trabajos Recientes</h2>
          <div className="space-y-4">
            {orders.slice(-5).reverse().map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <MotorcycleIcon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.motorcycle.plate} - {order.motorcycle.model}</p>
                    <p className="text-xs text-gray-500">{order.owner.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    order.status === OrderStatus.COMPLETADO ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center py-8 text-gray-400 italic">No hay órdenes registradas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
