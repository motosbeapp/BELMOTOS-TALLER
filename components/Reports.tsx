import React, { useMemo, useState } from 'react';
import { WorkshopOrder, OrderStatus, OperationType } from '../types.ts';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, LineChart, Line
} from 'recharts';
import { Download, Printer, PieChart, Activity, Clock, CheckCircle2, TrendingUp, DollarSign, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';

interface ReportsProps {
  orders: WorkshopOrder[];
}

const Reports: React.FC<ReportsProps> = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const stats = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    const periodOrders = orders.filter(o => {
      const date = parseISO(o.entryDate);
      return isWithinInterval(date, { start, end });
    });

    const income = periodOrders
      .filter(o => o.status === OrderStatus.COMPLETADO)
      .reduce((acc, o) => acc + (o.estimatedCost || 0), 0);

    const completed = periodOrders.filter(o => o.status === OrderStatus.COMPLETADO);
    
    // Calcular tiempo promedio en minutos/horas
    let totalMinutes = 0;
    completed.forEach(o => {
      if (o.completionDate) {
        totalMinutes += differenceInMinutes(parseISO(o.completionDate), parseISO(o.entryDate));
      }
    });
    const avgHours = completed.length > 0 ? (totalMinutes / completed.length / 60).toFixed(1) : '0';

    const typeCounts = periodOrders.reduce((acc: any, o) => {
      acc[o.operationType] = (acc[o.operationType] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(typeCounts).map(key => ({
      name: key,
      count: typeCounts[key]
    }));

    return {
      periodOrders,
      income,
      count: periodOrders.length,
      completedCount: completed.length,
      avgHours,
      chartData,
      closureRate: periodOrders.length > 0 ? Math.round((completed.length / periodOrders.length) * 100) : 0
    };
  }, [orders, selectedMonth]);

  const exportToExcel = () => {
    const headers = ["ID", "Fecha", "Placa", "Modelo", "Cliente", "Tipo", "Estado", "Horas", "Costo"];
    const rows = orders.map(o => [
      o.id,
      format(parseISO(o.entryDate), 'dd/MM/yyyy'),
      o.motorcycle.plate,
      o.motorcycle.model,
      o.owner.name,
      o.operationType,
      o.status,
      o.workHours || 0,
      o.estimatedCost || 0
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Taller_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.click();
  };

  const exportSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105);
    doc.text('REPORTE EJECUTIVO - BELMOTOS', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Periodo: ${format(selectedMonth, 'MMMM yyyy', { locale: es })}`, 20, 30);
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('RESUMEN FINANCIERO Y OPERATIVO', 20, 50);

    doc.setFontSize(11);
    doc.text(`Ingresos Totales: $${stats.income.toLocaleString()}`, 25, 65);
    doc.text(`Órdenes Recibidas: ${stats.count}`, 25, 75);
    doc.text(`Órdenes Completadas: ${stats.completedCount}`, 25, 85);
    doc.text(`Tasa de Cierre: ${stats.closureRate}%`, 25, 95);
    doc.text(`Tiempo Promedio de Reparación: ${stats.avgHours} horas`, 25, 105);

    doc.text('DISTRIBUCIÓN POR SERVICIO', 20, 125);
    stats.chartData.forEach((item, idx) => {
      doc.text(`${item.name}: ${item.count} trabajos`, 25, 135 + (idx * 8));
    });

    doc.save(`Reporte_Ejecutivo_${format(selectedMonth, 'MMM_yyyy')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Reportes</h1>
          <p className="text-gray-500">Visualización de datos y analítica del taller</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + '-02'))}
          />
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={18} />
            Excel
          </button>
          <button 
            onClick={exportSummaryPDF}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
          >
            <FileText size={18} />
            PDF Ejecutivo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard icon={<DollarSign className="text-emerald-600" />} label="Ingresos (Completados)" value={`$${stats.income.toLocaleString()}`} color="bg-emerald-50" />
        <ReportCard icon={<Activity className="text-blue-600" />} label="Órdenes Recibidas" value={stats.count} color="bg-blue-50" />
        <ReportCard icon={<Clock className="text-amber-600" />} label="Avg. Reparación" value={`${stats.avgHours}h`} color="bg-amber-50" />
        <ReportCard icon={<CheckCircle2 className="text-purple-600" />} label="Tasa de Cierre" value={`${stats.closureRate}%`} color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Distribución por Tipo de Servicio
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Próximos Reportes</h2>
          <div className="space-y-4">
            <ReportAction label="Análisis Semanal de Garantías" date="Próximo lunes" />
            <ReportAction label="Rendimiento de Mecánicos" date="Disponible fin de mes" />
            <ReportAction label="Top de Repuestos Solicitados" date="Disponible mañana" />
          </div>
          <div className="mt-8 pt-6 border-t border-gray-50">
             <button className="w-full py-4 bg-gray-50 text-emerald-700 font-bold rounded-2xl border-2 border-dashed border-emerald-100 hover:bg-emerald-100 transition-colors">
               Personalizar Vista de Datos
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ReportAction = ({ label, date }: { label: string, date: string }) => (
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all">
    <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-800">{label}</p>
    <p className="text-[10px] text-gray-400 font-medium">{date}</p>
  </div>
);

export default Reports;