
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Settings, LogOut, Wrench } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-800 text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Wrench size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BELMOTOS-TALLER</span>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-600 shadow-lg text-white font-medium' 
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-emerald-700 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white transition-colors">
            <Settings size={20} />
            Configuración
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white transition-colors">
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </aside>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
