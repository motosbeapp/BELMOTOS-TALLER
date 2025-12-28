import { jsPDF } from 'jspdf';
import { WorkshopOrder } from '../types.ts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Generar PDF de Recepción (Entrada)
export const generateOrderPDF = (order: WorkshopOrder) => {
  const doc = new jsPDF();
  const margin = 15;
  let y = 15;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105);
  doc.text('BELMOTOS-TALLER', margin, y);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Control Profesional de Recepción y Servicio', margin, y + 5);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`ORDEN: #${order.id}`, 160, y + 3);
  y += 20;

  // Status Badge
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(160, y - 8, 35, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text(order.status.toUpperCase(), 162, y - 2.5);

  // Info Block
  doc.setDrawColor(240);
  doc.line(margin, y, 195, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTROL PROFESIONAL DE RECEPCIÓN', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fecha Ingreso: ${format(new Date(order.entryDate), 'PPP p', { locale: es })}`, margin, y);
  doc.text(`Tipo de Operación: ${order.operationType}`, 100, y);
  y += 10;

  // Owner & Bike
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PROPIETARIO', margin, y);
  doc.text('DATOS DEL VEHÍCULO', 100, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  
  // Column 1: Owner
  doc.text(`Nombre: ${order.owner.name}`, margin, y);
  doc.text(`CI/RIF: ${order.owner.idNumber}`, margin, y + 5);
  doc.text(`Teléfono: ${order.owner.phone}`, margin, y + 10);
  doc.text(`Email: ${order.owner.email}`, margin, y + 15);

  // Column 2: Motorcycle
  doc.text(`Modelo: ${order.motorcycle.model}`, 100, y);
  doc.text(`Placa: ${order.motorcycle.plate}`, 100, y + 5);
  doc.text(`Kilometraje: ${order.motorcycle.mileage} KM`, 100, y + 10);
  doc.text(`Año: ${order.motorcycle.year} | Color: ${order.motorcycle.color}`, 100, y + 15);
  y += 22;

  // Seriales
  doc.setFontSize(8);
  doc.text(`Serial Chasis: ${order.motorcycle.chassisSerial}`, margin, y);
  doc.text(`Serial Motor: ${order.motorcycle.engineSerial}`, 100, y);
  y += 10;

  // Checklist
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTARIO Y ESTADO FÍSICO', margin, y);
  y += 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  
  const checklistItems = Object.entries(order.checklist);
  // Reducimos a 2 columnas para acomodar textos más largos
  const itemsPerCol = Math.ceil(checklistItems.length / 2);
  const colWidth = 90;
  
  checklistItems.forEach(([item, checked], index) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const col = Math.floor(index / itemsPerCol);
    const rowInCol = index % itemsPerCol;
    const itemY = y + (rowInCol * 5);
    const mark = checked ? '[OK]' : '[X]';
    
    // Truncar si es demasiado largo para la columna
    const displayText = item.length > 55 ? item.substring(0, 52) + '...' : item;
    doc.text(`${mark} ${displayText}`, margin + (col * colWidth), itemY);
  });
  
  y += (itemsPerCol * 5) + 12;

  // Reports
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DEL CLIENTE:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const clientText = doc.splitTextToSize(order.clientReport || 'Sin reporte específico.', 180);
  doc.text(clientText, margin, y);
  y += (clientText.length * 4) + 8;

  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES GENERALES:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const obsText = doc.splitTextToSize(order.observations || 'Sin observaciones adicionales.', 180);
  doc.text(obsText, margin, y);
  y += (obsText.length * 4) + 10;

  // Fotos de Ingreso
  if (order.photoVehicle || order.photoChassis) {
    if (y > 210) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIAS FOTOGRÁFICAS DE INGRESO:', margin, y);
    y += 8;

    const imgWidth = 85;
    const imgHeight = 60;
    
    if (order.photoVehicle) {
      try {
        doc.addImage(order.photoVehicle, 'JPEG', margin, y, imgWidth, imgHeight);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('Vista General del Vehículo', margin, y + imgHeight + 4);
      } catch (e) {
        doc.setFontSize(7);
        doc.text('[Foto del vehículo no disponible]', margin, y + 5);
      }
    }

    if (order.photoChassis) {
      try {
        doc.addImage(order.photoChassis, 'JPEG', margin + imgWidth + 5, y, imgWidth, imgHeight);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('Foto Serial de Chasis / Motor', margin + imgWidth + 5, y + imgHeight + 4);
      } catch (e) {
        doc.setFontSize(7);
        doc.text('[Foto del serial no disponible]', margin + imgWidth + 5, y + 5);
      }
    }
    y += imgHeight + 15;
  }

  // Condiciones Legales
  if (y > 210) { doc.addPage(); y = 20; }
  doc.setDrawColor(230);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, 180, 45, 'F');
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('CONDICIONES DEL SERVICIO:', margin + 5, y + 6);
  
  doc.setFont('helvetica', 'normal');
  const legalText = "Condiciones: En caso de incendio, accidentes, terremotos, la empresa no responderá por los desperfectos ocasionados a la motocicleta, ni por los objetos dejados en ella.\n\nTodos los trabajos realizados a la motocicleta deberán ser cancelados en el momento de su retiro. En el caso que la reparación necesite de la preparación de un presupuesto, una vez dado a conocer se otorga un plazo de 24 horas para autorizar o no el mismo, y el cliente en el segundo de los casos deberá retirar la motocicleta al vencer el mismo plazo.\n\nSe entiende que quien contrata y ordena el trabajo descrito, es el propietario de la motocicleta, o está autorizado por el propietario quien conoce y acepta estas condiciones que son parte integrante del contrato que se celebra y que consta en este documento.";
  const splitLegal = doc.splitTextToSize(legalText, 170);
  doc.text(splitLegal, margin + 5, y + 12);
  y += 50;

  // Footer / Firmas
  if (y > 275) { doc.addPage(); y = 20; }
  y = 280;
  doc.setFontSize(7);
  doc.line(margin, y, 80, y);
  doc.line(120, y, 195, y);
  doc.text('Recibido por Taller (Firma y Sello)', margin + 12, y + 4);
  doc.text('Firma del Propietario', 145, y + 4);

  doc.save(`BELMOTOS_Recepcion_${order.motorcycle.plate}_${order.id}.pdf`);
};

// Generar Informe Técnico (Salida/Finalización)
export const generateTechnicalReportPDF = (order: WorkshopOrder) => {
  const doc = new jsPDF();
  const margin = 15;
  let y = 15;

  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175); 
  doc.text('INFORME TÉCNICO DE SERVICIO', margin, y);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('BELMOTOS-TALLER - Garantía de Calidad', margin, y + 6);
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`N° ${order.id}`, 170, y + 2);
  y += 22;

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1);
  doc.line(margin, y, 195, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DEL SERVICIO', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vehículo: ${order.motorcycle.model} (${order.motorcycle.plate})`, margin, y);
  doc.text(`Propietario: ${order.owner.name}`, 100, y);
  y += 6;
  doc.text(`Fecha Entrega: ${format(new Date(), 'PPP', { locale: es })}`, margin, y);
  doc.text(`Horas Técnicas: ${order.workHours || 0} horas`, 100, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO Y TRABAJO REALIZADO:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const notesText = doc.splitTextToSize(order.technicianNotes || 'No se registraron notas técnicas adicionales.', 180);
  doc.text(notesText, margin, y);
  y += notesText.length * 5 + 15;

  if (order.updates && order.updates.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIAS DEL PROCESO:', margin, y);
    y += 10;

    order.updates.forEach((update, idx) => {
      if (y > 230) { doc.addPage(); y = 20; }
      try {
        if (update.photo) {
          doc.addImage(update.photo, 'JPEG', margin, y, 60, 45);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(`Ref: ${update.note}`, margin + 65, y + 5);
          doc.text(`Fecha: ${format(new Date(update.timestamp), 'p', { locale: es })}`, margin + 65, y + 10);
          y += 55;
        }
      } catch (e) {
        y += 10;
      }
    });
  }

  y = 265;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.line(margin, y, 80, y);
  doc.line(120, y, 195, y);
  doc.text('Firma Jefe de Taller', margin + 15, y + 5);
  doc.text('Firma Cliente (Conformidad)', 135, y + 5);

  doc.save(`Informe_Tecnico_${order.motorcycle.plate}_${order.id}.pdf`);
};