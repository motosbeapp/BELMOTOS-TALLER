
import React, { useMemo } from 'react';
import { WorkshopOrder, OrderStatus, OperationType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
// Added CheckCircle2 to the import list from lucide-react
import { Download, Printer, PieChart, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportsProps {
  orders: WorkshopOrder[];
}

const Reports: React.FC<ReportsProps> = ({ orders }) => {
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonthOrders = orders.filter(o => {
      const date = parseISO(o.entryDate);
      return isWithinInterval(date, { start, end });
    });

    const repairTypes = thisMonthOrders.reduce((acc: any, o) => {
      acc[o.operationType] = (acc[o.operationType] || 0) + 1;
      return acc;
    }, {});

    return {
      count: thisMonthOrders.length,
      repairTypes: Object.keys(repairTypes).map(key => ({ name: key, count: repairTypes[key] })),
      completed: thisMonthOrders.filter(o => o.status === OrderStatus.COMPLETADO).length,
      averageTime: '2.4 días' // Mocked avg logic
    };
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Reportes</h1>
          <p className="text-gray-500">Analítica avanzada y exportación de datos</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <Printer size={18} />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition-all">
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportSummaryCard 
          icon={<Activity className="text-blue-600" />} 
          label="Órdenes este Mes" 
          value={monthlyStats.count} 
          trend="+12%"
        />
        <ReportSummaryCard 
          icon={<Clock className="text-amber-600" />} 
          label="Tiempo Promedio" 
          value={monthlyStats.averageTime} 
          trend="-0.5d"
        />
        <ReportSummaryCard 
          icon={<CheckCircle2 className="text-emerald-600" />} 
          label="Tasa de Cierre" 
          value={`${Math.round((monthlyStats.completed / (monthlyStats.count || 1)) * 100)}%`} 
          trend="+5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tendencia de Ingresos</h2>
            <PieChart size={20} className="text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats.repairTypes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold mb-6">Detalles de Reportes Generados</h2>
          <div className="flex-1 space-y-4">
            <ReportLink title="Reporte Diario de Operaciones" date="Hoy, 08:00 AM" />
            <ReportLink title="Reporte Semanal de Eficiencia de Técnicos" date="Lunes 14, Mayo" />
            <ReportLink title="Inventario de Repuestos Utilizados" date="Abril 2024" />
            <ReportLink title="Resumen de Garantías Procesadas" date="Trimestre 1, 2024" />
            <div className="mt-auto pt-6">
               <button className="w-full py-3 border-2 border-dashed border-emerald-200 text-emerald-600 font-medium rounded-xl hover:bg-emerald-50 transition-colors">
                 + Generar Nuevo Reporte Personalizado
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportSummaryCard = ({ icon, label, value, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
        {trend}
      </span>
    </div>
    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ReportLink = ({ title, date }: any) => (
  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
    <Download size={16} className="text-gray-300" />
  </div>
);

export default Reports;
