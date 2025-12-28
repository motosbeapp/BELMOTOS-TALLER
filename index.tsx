
// BELMOTOS - Vanilla JS SPA Engine
// Utiliza .tsx para mantener compatibilidad con el entorno pero es Vanilla JS

// Importación de utilidades (se asume que los archivos existen o se inyectan)
import { generateOrderId, getOrders, saveOrders, seedDemoData } from './utils/storage.ts';
import { generateOrderPDF, generateTechnicalReportPDF } from './utils/pdf.ts';

// Estado global de la aplicación
const state = {
    activeTab: 'dashboard',
    orders: [],
    filters: {
        search: '',
        status: 'All'
    }
};

// --- INICIALIZACIÓN ---
function init() {
    state.orders = getOrders();
    if (state.orders.length === 0) {
        seedDemoData();
        state.orders = getOrders();
    }

    // Configurar Navegación
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    render();
}

// --- ENRUTADOR SIMPLE ---
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Actualizar UI de navegación
    document.querySelectorAll('[data-tab]').forEach(el => {
        if (el.getAttribute('data-tab') === tabId) el.classList.add('active');
        else el.classList.remove('active');
    });

    render();
}

// --- NOTIFICACIONES ---
function notify(text) {
    const el = document.getElementById('notification');
    const textEl = document.getElementById('notification-text');
    textEl.innerText = text;
    el.style.display = 'block';
    setTimeout(() => {
        el.style.display = 'none';
    }, 3000);
}

// --- RENDERIZADO ---
function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    switch (state.activeTab) {
        case 'dashboard':
            container.innerHTML = renderDashboard();
            // FIX: Use window to access global initCharts function as it is defined on window later
            (window as any).initCharts();
            break;
        case 'reception':
            container.innerHTML = renderReceptionForm();
            bindReceptionEvents();
            break;
        case 'management':
            container.innerHTML = renderManagement();
            bindManagementEvents();
            break;
        case 'reports':
            container.innerHTML = renderReports();
            break;
    }
}

// --- COMPONENTE DASHBOARD ---
function renderDashboard() {
    const stats = {
        total: state.orders.length,
        pending: state.orders.filter((o: any) => o.status === 'Pendiente').length,
        process: state.orders.filter((o: any) => o.status === 'En Proceso').length,
        done: state.orders.filter((o: any) => o.status === 'Completado').length
    };

    return `
        <div class="animate-fade-in">
            <h2 class="fw-bold mb-4">Panel de Control</h2>
            <div class="row g-4 mb-5">
                ${renderStatCard('Total Vehículos', stats.total, 'fa-motorcycle', 'bg-white text-dark')}
                ${renderStatCard('Pendientes', stats.pending, 'fa-clock', 'bg-warning-subtle text-warning-emphasis')}
                ${renderStatCard('En Proceso', stats.process, 'fa-tools', 'bg-info-subtle text-info-emphasis')}
                ${renderStatCard('Completados', stats.done, 'fa-check-circle', 'bg-success-subtle text-success-emphasis')}
            </div>

            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card p-4">
                        <h5 class="fw-bold mb-4">Actividad Reciente</h5>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Orden</th>
                                        <th>Placa</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${state.orders.slice(-5).reverse().map((o: any) => `
                                        <tr>
                                            <td>#${o.id}</td>
                                            <td><strong>${o.motorcycle.plate}</strong></td>
                                            <td>${o.owner.name}</td>
                                            <td><span class="badge rounded-pill ${getStatusBadgeClass(o.status)}">${o.status}</span></td>
                                            <td><button onclick="window.viewOrder('${o.id}')" class="btn btn-sm btn-outline-emerald"><i class="fas fa-eye"></i></button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card p-4 h-100">
                        <h5 class="fw-bold mb-4">Resumen Operativo</h5>
                        <canvas id="opChart" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStatCard(title, value, icon, extraClass) {
    return `
        <div class="col-md-3">
            <div class="card p-3 h-100 ${extraClass}">
                <div class="d-flex align-items-center">
                    <div class="rounded-3 p-3 bg-white shadow-sm me-3 text-emerald">
                        <i class="fas ${icon} fa-2x"></i>
                    </div>
                    <div>
                        <p class="mb-0 text-muted small fw-bold uppercase">${title}</p>
                        <h3 class="mb-0 fw-bold">${value}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pendiente': return 'bg-secondary';
        case 'En Proceso': return 'bg-primary';
        case 'Completado': return 'bg-success';
        default: return 'bg-light text-dark';
    }
}

// --- COMPONENTE RECEPCIÓN ---
function renderReceptionForm() {
    const newId = generateOrderId();
    const today = new Date().toISOString().split('T')[0];
    
    return `
        <div class="animate-fade-in pb-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-0">Recepción de Vehículo</h2>
                    <p class="text-muted">Orden de Servicio Automática: #${newId}</p>
                </div>
                <button type="button" id="btn-save-order" class="btn btn-emerald btn-lg px-5">
                    <i class="fas fa-save me-2"></i>Guardar Recepción
                </button>
            </div>

            <form id="reception-form" class="row g-4">
                <input type="hidden" name="id" value="${newId}">
                <input type="hidden" name="entryDate" value="${new Date().toISOString()}">
                
                <div class="col-lg-8">
                    <!-- Datos Propietario -->
                    <div class="card p-4 mb-4">
                        <h5 class="fw-bold mb-4 text-emerald"><i class="fas fa-user me-2"></i>Datos del Propietario</h5>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Nombre Completo</label>
                                <input type="text" name="ownerName" class="form-control" required placeholder="Ej: Juan Pérez">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Cédula / ID</label>
                                <input type="text" name="ownerId" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Teléfono de Contacto</label>
                                <input type="tel" name="ownerPhone" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Correo Electrónico</label>
                                <input type="email" name="ownerEmail" class="form-control">
                            </div>
                        </div>
                    </div>

                    <!-- Datos Moto -->
                    <div class="card p-4 mb-4">
                        <h5 class="fw-bold mb-4 text-emerald"><i class="fas fa-motorcycle me-2"></i>Datos de la Motocicleta</h5>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold">Placa</label>
                                <input type="text" name="plate" class="form-control text-uppercase" required placeholder="ABC-123">
                            </div>
                            <div class="col-md-8">
                                <label class="form-label small fw-bold">Modelo / Marca</label>
                                <input type="text" name="model" class="form-control" required placeholder="Ej: Yamaha MT-07">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Año</label>
                                <input type="number" name="year" class="form-control">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Color</label>
                                <input type="text" name="color" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Kilometraje Actual</label>
                                <input type="number" name="mileage" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Serial Chasis (VIN)</label>
                                <input type="text" name="chassis" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Serial Motor</label>
                                <input type="text" name="engine" class="form-control">
                            </div>
                        </div>
                    </div>

                    <!-- Reporte Cliente -->
                    <div class="card p-4">
                        <h5 class="fw-bold mb-4 text-emerald"><i class="fas fa-clipboard-list me-2"></i>Reporte del Cliente</h5>
                        <textarea name="clientReport" class="form-control mb-3" rows="3" placeholder="¿Qué falla reporta el cliente?"></textarea>
                        <label class="form-label small fw-bold">Observaciones Generales de Recepción</label>
                        <textarea name="observations" class="form-control" rows="2" placeholder="Rayones, golpes, accesorios adicionales..."></textarea>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card p-4 mb-4">
                        <h5 class="fw-bold mb-4 text-emerald"><i class="fas fa-tasks me-2"></i>Operación</h5>
                        <select name="opType" class="form-select mb-3">
                            <option value="Revisión">Mantenimiento Preventivo</option>
                            <option value="Reparación">Reparación Correctiva</option>
                            <option value="Garantía">Garantía de Servicio</option>
                        </select>
                    </div>

                    <div class="card p-4">
                        <h5 class="fw-bold mb-4 text-emerald"><i class="fas fa-check-double me-2"></i>Checklist Rápido</h5>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" checked id="check-luces">
                            <label class="form-check-label small" for="check-luces">Luces y Sistema Eléctrico</label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" checked id="check-frenos">
                            <label class="form-check-label small" for="check-frenos">Sistema de Frenado</label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" checked id="check-espejos">
                            <label class="form-check-label small" for="check-espejos">Retrovisores / Estética</label>
                        </div>
                        <p class="text-muted small mt-3 italic">* El formulario PDF incluirá el inventario completo de 22 items.</p>
                    </div>
                </div>
            </form>
        </div>
    `;
}

function bindReceptionEvents() {
    document.getElementById('btn-save-order').addEventListener('click', () => {
        // FIX: Explicitly cast to HTMLFormElement to access form properties
        const form = document.getElementById('reception-form') as HTMLFormElement;
        const fd = new FormData(form);
        
        const newOrder = {
            id: fd.get('id') as string,
            entryDate: fd.get('entryDate') as string,
            operationType: fd.get('opType') as any,
            status: 'Pendiente' as any,
            owner: {
                name: fd.get('ownerName') as string,
                idNumber: fd.get('ownerId') as string,
                phone: fd.get('ownerPhone') as string,
                email: fd.get('ownerEmail') as string
            },
            motorcycle: {
                plate: fd.get('plate') as string,
                model: fd.get('model') as string,
                year: fd.get('year') as string,
                color: fd.get('color') as string,
                mileage: fd.get('mileage') as string,
                chassisSerial: fd.get('chassis') as string,
                engineSerial: fd.get('engine') as string,
                displacement: '' // Adding missing displacement required by WorkshopOrder
            },
            clientReport: fd.get('clientReport') as string,
            observations: fd.get('observations') as string,
            checklist: {}, // Por simplicidad en demo
            updates: [],
            workHours: 0,
            technicianNotes: '' // FIX: Added missing technicianNotes required by WorkshopOrder
        };

        (state.orders as any).push(newOrder);
        saveOrders(state.orders);
        
        // Generar PDF
        generateOrderPDF(newOrder as any);
        
        notify('¡Orden guardada con éxito! PDF Generado.');
        switchTab('management');
    });
}

// --- COMPONENTE GESTIÓN ---
function renderManagement() {
    return `
        <div class="animate-fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold mb-0">Gestión de Trabajos</h2>
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" placeholder="Buscar por placa o ID..." id="search-input">
                    <select class="form-select w-auto" id="filter-status">
                        <option value="All">Todos</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completados</option>
                    </select>
                </div>
            </div>

            <div class="row g-4" id="orders-list">
                ${renderOrdersList()}
            </div>
        </div>
    `;
}

function renderOrdersList() {
    const filtered = state.orders.filter((o: any) => {
        const matchSearch = o.motorcycle.plate.toLowerCase().includes(state.filters.search.toLowerCase()) || o.id.includes(state.filters.search);
        const matchStatus = state.filters.status === 'All' || o.status === state.filters.status;
        return matchSearch && matchStatus;
    }).reverse();

    if (filtered.length === 0) return '<div class="col-12 text-center py-5"><p class="text-muted">No se encontraron órdenes.</p></div>';

    return filtered.map((o: any) => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 p-4 border-start border-4 ${getStatusBorder(o.status)}">
                <div class="d-flex justify-content-between mb-3">
                    <span class="text-muted small fw-bold">#${o.id}</span>
                    <span class="badge ${getStatusBadgeClass(o.status)}">${o.status}</span>
                </div>
                <h4 class="fw-bold mb-1">${o.motorcycle.plate}</h4>
                <p class="text-muted mb-3">${o.motorcycle.model}</p>
                <div class="d-flex align-items-center mb-4 text-muted small">
                    <i class="fas fa-user me-2"></i> ${o.owner.name}
                </div>
                <div class="mt-auto d-flex gap-2">
                    <button onclick="window.updateStatus('${o.id}')" class="btn btn-sm btn-outline-emerald flex-grow-1">Actualizar</button>
                    <button onclick="window.viewTechReport('${o.id}')" class="btn btn-sm btn-light text-emerald"><i class="fas fa-file-pdf"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBorder(status) {
    switch (status) {
        case 'Pendiente': return 'border-secondary';
        case 'En Proceso': return 'border-primary';
        case 'Completado': return 'border-success';
        default: return '';
    }
}

function bindManagementEvents() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        // FIX: Cast target to HTMLInputElement to access .value
        state.filters.search = (e.target as HTMLInputElement).value;
        document.getElementById('orders-list').innerHTML = renderOrdersList();
    });
    document.getElementById('filter-status').addEventListener('change', (e) => {
        // FIX: Cast target to HTMLSelectElement to access .value
        state.filters.status = (e.target as HTMLSelectElement).value;
        document.getElementById('orders-list').innerHTML = renderOrdersList();
    });
}

// --- COMPONENTE REPORTES ---
function renderReports() {
    return `
        <div class="animate-fade-in">
            <h2 class="fw-bold mb-4">Reportes y Estadísticas</h2>
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="card p-4 bg-emerald text-white">
                        <h5>Ingresos Estimados</h5>
                        <h2 class="fw-bold">$ ${state.orders.reduce((acc, o: any) => acc + (o.estimatedCost || 0), 0).toLocaleString()}</h2>
                        <p class="mb-0 small opacity-75">Basado en trabajos finalizados</p>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold mb-0">Exportar Datos</h5>
                            <div class="btn-group">
                                <button onclick="window.exportCSV()" class="btn btn-outline-secondary btn-sm"><i class="fas fa-file-csv me-2"></i>Excel (CSV)</button>
                                <button onclick="window.exportFullPDF()" class="btn btn-emerald btn-sm"><i class="fas fa-file-pdf me-2"></i>Reporte Mensual</button>
                            </div>
                        </div>
                        <p class="text-muted">Genera un resumen detallado de todas las operaciones del mes para auditoría y control de inventario.</p>
                    </div>
                </div>
            </div>
            <div class="card p-4">
                 <h5 class="fw-bold mb-4">Eficiencia por Tipo de Trabajo</h5>
                 <canvas id="typeChart" height="100"></canvas>
            </div>
        </div>
    `;
}

// --- FUNCIONES GLOBALES (ACCESIBLES DESDE HTML) ---
// FIX: Explicitly cast window to any to attach global methods
(window as any).updateStatus = (id) => {
    const order: any = state.orders.find((o: any) => o.id === id);
    const newStatus = order.status === 'Pendiente' ? 'En Proceso' : 'Completado';
    
    if (confirm(`¿Cambiar estado de la orden #${id} a "${newStatus}"?`)) {
        order.status = newStatus;
        if (newStatus === 'Completado') order.completionDate = new Date().toISOString();
        saveOrders(state.orders);
        notify('Estado actualizado correctamente.');
        render();
    }
};

(window as any).viewTechReport = (id) => {
    const order: any = state.orders.find((o: any) => o.id === id);
    generateTechnicalReportPDF(order);
};

(window as any).initCharts = () => {
    const ctx = document.getElementById('opChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // FIX: Using window cast to access Chart library assuming it is globally available
    new (window as any).Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendiente', 'Proceso', 'Listos'],
            datasets: [{
                data: [
                    state.orders.filter((o: any) => o.status === 'Pendiente').length,
                    state.orders.filter((o: any) => o.status === 'En Proceso').length,
                    state.orders.filter((o: any) => o.status === 'Completado').length
                ],
                backgroundColor: ['#94a3b8', '#3b82f6', '#10b981']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
};

// Iniciar app
document.addEventListener('DOMContentLoaded', init);
