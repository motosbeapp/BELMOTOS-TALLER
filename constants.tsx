
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
    category: 'INSPECCIÓN MECÁNICA & ESTRUCTURAL',
    items: [
      'Combustible y Tanque (Tapa, fijación, nivel)',
      'Motor y Escape (Bases, nivel de aceite, escape)',
      'Transmisión (Kit arrastre, cambios, piñón/corona)',
      'Suspensión (Amortiguadores, bujes, fundas)',
      'Manubrio y Controles (Posición, manillas, comandos)',
      'Carrocería y Asiento (Tapas, guardabarros, parrilla, asiento, reposapiés)',
      'Ruedas y Neumáticos (Llantas, presión, estado)'
    ]
  },
  {
    category: 'SISTEMA ELÉCTRICO',
    items: [
      'Luces (Delantera Alta/Baja, cruce, freno, tablero)',
      'Dispositivos (Corneta, encendido eléctrico, suichera)'
    ]
  },
  {
    category: 'SISTEMA DE FRENOS',
    items: [
      'Componentes (Líquido, caliper, arañas, discos/campanas)',
      'Funcionamiento (Palanca, pedal, respuesta)'
    ]
  },
  {
    category: 'ACCESORIOS Y DOCUMENTACIÓN',
    items: [
      'Herramientas, Retrovisores y Llaveros',
      'Etiquetas (Certificación, advertencia)',
      'Documentación (Certificado de origen, titulo)'
    ]
  },
  {
    category: 'PRUEBA FUNCIONAL RÁPIDA',
    items: [
      'Arranque (Eléctrico y/o pedal)',
      'Respuesta de aceleración',
      'Cambios de velocidad (incluye neutral)',
      'Frenos delantero/trasero (sensación y respuesta)'
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
