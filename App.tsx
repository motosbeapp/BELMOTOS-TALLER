
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReceptionForm from './components/ReceptionForm';
import OrderManagement from './components/OrderManagement';
import Reports from './components/Reports';
import { WorkshopOrder } from './types';
import { getOrders, saveOrders } from './utils/storage';
import { generateOrderPDF } from './utils/pdf';
import { Bell } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const notify = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleSaveOrder = (newOrder: WorkshopOrder) => {
    const updated = [...orders, newOrder];
    setOrders(updated);
    saveOrders(updated);
    
    // Generar el PDF automáticamente al guardar
    generateOrderPDF(newOrder);
    
    notify('¡Orden guardada y PDF generado con éxito!');
    setActiveTab('management');
  };

  const handleUpdateOrder = (updatedOrder: WorkshopOrder) => {
    const updated = orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    setOrders(updated);
    saveOrders(updated);
    notify(`Orden #${updatedOrder.id} actualizada con éxito`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la orden #${orderId}? Esta acción no se puede deshacer.`)) {
      const updated = orders.filter(order => order.id !== orderId);
      setOrders(updated);
      saveOrders(updated);
      notify(`Orden #${orderId} eliminada correctamente`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'reception':
        return <ReceptionForm onSave={handleSaveOrder} />;
      case 'management':
        return (
          <OrderManagement 
            orders={orders} 
            onUpdateOrder={handleUpdateOrder} 
            onDeleteOrder={handleDeleteOrder}
          />
        );
      case 'reports':
        return <Reports orders={orders} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Notifications Portal-like */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <Bell size={18} />
            <span className="font-medium">{showNotification}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          60% { transform: translate(-50%, 10%); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
};

export default App;
