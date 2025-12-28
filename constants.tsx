
import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const CHECKLIST_DATA = [
  {
    category: 'INSPECCIÓN FÍSICA',
    items: [
      'Tanque de gasolina acoplado', 'Tapa de tanque de gasolina', 'Línea de combustible al carburador',
      'Posa pies funcionales', 'Pedal de freno', 'Tapas laterales acoplados',
      'Guarda barro delantero acoplado', 'Guardabarros trasero acoplado', 'Asiento acoplado',
      'Base del motor aseguradas', 'Tubo de escape acoplado', 'Pedal de arranque funcionado',
      'Base de la tijera ajustada con bujes colocados', 'Amortiguadores ajustados',
      'Fundas de amortiguadores delanteros', 'Parrilla trasera ajustada',
      'Manillas de acelerador y embrague', 'Kit de arrastre (Cadena, piñón, corona)',
      'Placas (No tenerlas defectuosas)', 'Posición del manurio correcta',
      'Resortes (Freno, burro, válvula de freno)'
    ]
  },
  {
    category: 'INSPECCIÓN ELÉCTRICA',
    items: [
      'Suichera funcionando', 'Luces delanteras (Alta, baja, servicio)',
      'Luces de cruce (Izquierda, derecha)', 'Luz de freno (Delantero, Trasero)',
      'Luz del tablero', 'Corneta', 'Encendido eléctrico'
    ]
  },
  {
    category: 'ACCESORIOS',
    items: [
      'Herramientas', 'Etiquetas colocadas', 'Retrovisores', 'Llaves'
    ]
  },
  {
    category: 'SISTEMAS DE FRENOS',
    items: [
      'Línea de freno por el lado derecho', 'Caliper de freno ajustado y con seguros',
      'Arañas de la transmisión', 'Líquido de frenos', 
      'Frenos delanteros y traseros disco o campana', 'Llantas - Infladas'
    ]
  },
  {
    category: 'MOTOR',
    items: [
      'Probar cambios de velocidades (5 y Neutro)', 'Nivel de aceite'
    ]
  }
];

// Flat list for state initialization
export const CHECKLIST_ITEMS = CHECKLIST_DATA.flatMap(c => c.items);

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: <LayoutDashboard size={20} /> },
  { id: 'reception', label: 'Recepción', icon: <PlusCircle size={20} /> },
  { id: 'management', label: 'Gestión', icon: <Wrench size={20} /> },
  { id: 'reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
];

export const STATUS_COLORS = {
  'Pendiente': 'bg-gray-100 text-gray-700',
  'En Proceso': 'bg-blue-100 text-blue-700',
  'Completado': 'bg-green-100 text-green-700'
};

export const STATUS_ICONS = {
  'Pendiente': <Clock size={16} />,
  'En Proceso': <AlertCircle size={16} />,
  'Completado': <CheckCircle2 size={16} />
};

export const MotorcycleIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M18.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M9 14h6" />
    <path d="M12 14v-4" />
    <path d="M12 10l-2-4h3l2 4" />
    <path d="M7 11l2-4" />
    <path d="M15 11l2-4" />
  </svg>
);
