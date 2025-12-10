import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  averageTicketPrice: number;
  growth: {
    events: number;
    revenue: number;
    attendees: number;
    conversionRate: number;
  };
  topEvents: Array<{
    id: string;
    title: string;
    revenue: number;
    attendees: number;
    date: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    year: number;
    revenue: number;
    events: number;
    eventsList: Array<{
      id: string;
      title: string;
      revenue: number;
      percentage: number;
      eventDate?: string;
      salesStart?: string;
    }>;
    growthVsPrevMonth: number;
  }>;
  attendanceTrends: Array<{
    date: string;
    checkIns: number;
    noShows: number;
  }>;
  ticketSalesByType: Array<{
    type: string;
    sales: number;
    revenue: number;
    eventName: string;
    eventId: string;
  }>;
  geographicData: Array<{
    location: string;
    events: number;
    revenue: number;
  }>;
  priceMetrics: {
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
  };
  attendanceStats: {
    averageAttendanceRate: number;
    bestDayOfWeek: string;
    peakCheckInHour: string;
  };
}

interface ExportFilters {
  month?: string; // "01" - "12"
  year: string;
}

export class ExportReportService {
  /**
   * Exporta el reporte a formato PDF
   */
  static exportToPDF(data: ReportData, filters: ExportFilters): void {
    try {
      const doc = new jsPDF();
      const filteredData = this.filterDataByPeriod(data, filters);

    // Configuración de colores
    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
    const secondaryColor: [number, number, number] = [99, 102, 241]; // Indigo claro
    
    let yPosition = 20;

    // Encabezado principal
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE ANALYTICS', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('EventHub - Sistema de Gestión de Eventos', 105, 25, { align: 'center' });

    // Información del período
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const periodText = filters.month
      ? `${monthNames[parseInt(filters.month) - 1]} ${filters.year}`
      : `Año ${filters.year}`;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    yPosition = 45;
    doc.text(`Período: ${periodText}`, 20, yPosition);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 20, yPosition + 5);

    // Sección: Resumen Ejecutivo
    yPosition = 60;
    this.addSectionTitle(doc, 'RESUMEN EJECUTIVO', yPosition, primaryColor);
    yPosition += 10;

    const summaryData = [
      ['Total de Eventos', filteredData.totalEvents.toLocaleString('es-CO')],
      ['Ingresos Totales', `$${filteredData.totalRevenue.toLocaleString('es-CO')} COP`],
      ['Total Asistentes', filteredData.totalAttendees.toLocaleString('es-CO')],
      ['Tasa de Conversión', `${filteredData.conversionRate.toFixed(1)}%`],
      ['Precio Promedio Ticket', `$${filteredData.averageTicketPrice.toLocaleString('es-CO')} COP`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 90, halign: 'right' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Sección: Eventos Destacados
    if (filteredData.topEvents.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      this.addSectionTitle(doc, 'EVENTOS DESTACADOS', yPosition, primaryColor);
      yPosition += 10;

      const topEventsData = filteredData.topEvents.slice(0, 5).map((event, index) => [
        (index + 1).toString(),
        (event.title || 'Sin título').substring(0, 40) + ((event.title || '').length > 40 ? '...' : ''),
        `$${event.revenue.toLocaleString('es-CO')}`,
        event.attendees.toString()
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Evento', 'Ingresos', 'Asistentes']],
        body: topEventsData,
        theme: 'striped',
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 90 },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 30, halign: 'center' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Sección: Ingresos Mensuales
    if (filteredData.revenueByMonth.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      this.addSectionTitle(doc, 'INGRESOS MENSUALES', yPosition, primaryColor);
      yPosition += 10;

      const revenueData = filteredData.revenueByMonth.map(month => [
        `${month.month} ${month.year}`,
        month.events.toString(),
        `$${month.revenue.toLocaleString('es-CO')}`,
        `${month.growthVsPrevMonth >= 0 ? '+' : ''}${month.growthVsPrevMonth.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Período', 'Eventos', 'Ingresos', 'Crecimiento']],
        body: revenueData,
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 50, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Sección: Ventas por Tipo de Entrada
    if (filteredData.ticketSalesByType.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      this.addSectionTitle(doc, 'VENTAS POR TIPO DE ENTRADA', yPosition, primaryColor);
      yPosition += 10;

      const ticketData = filteredData.ticketSalesByType.slice(0, 10).map(ticket => [
        ticket.type || 'General',
        (ticket.eventName || 'Sin nombre').substring(0, 30) + ((ticket.eventName || '').length > 30 ? '...' : ''),
        ticket.sales.toString(),
        `$${ticket.revenue.toLocaleString('es-CO')}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Evento', 'Ventas', 'Ingresos']],
        body: ticketData,
        theme: 'striped',
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 45, halign: 'right' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Sección: Métricas de Precios
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    this.addSectionTitle(doc, 'MÉTRICAS DE PRECIOS', yPosition, primaryColor);
    yPosition += 10;

    const priceData = [
      ['Precio Promedio', `$${filteredData.priceMetrics.averagePrice.toLocaleString('es-CO')} COP`],
      ['Ticket Más Caro', `$${filteredData.priceMetrics.maxPrice.toLocaleString('es-CO')} COP`],
      ['Ticket Más Barato', `$${filteredData.priceMetrics.minPrice.toLocaleString('es-CO')} COP`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: priceData,
      theme: 'grid',
      headStyles: { fillColor: secondaryColor, textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 90, halign: 'right' }
      }
    });

    // Pie de página en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `EventHub © ${new Date().getFullYear()} - Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Generar nombre del archivo
    const fileName = this.generateFileName(filters, 'pdf');

    // Descargar PDF
    doc.save(fileName);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  }

  /**
   * Agrega un título de sección al PDF
   */
  private static addSectionTitle(
    doc: jsPDF,
    title: string,
    yPosition: number,
    color: [number, number, number]
  ): void {
    doc.setFillColor(...color);
    doc.rect(15, yPosition - 5, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  }

  /**
   * Exporta el reporte a formato Excel (.xlsx)
   */
  static exportToExcel(data: ReportData, filters: ExportFilters): void {
    const workbook = XLSX.utils.book_new();

    // Filtrar datos por mes/año si es necesario
    const filteredData = this.filterDataByPeriod(data, filters);

    // Hoja 1: Resumen Ejecutivo
    this.addExecutiveSummarySheet(workbook, filteredData, filters);

    // Hoja 2: Eventos Destacados
    this.addTopEventsSheet(workbook, filteredData);

    // Hoja 3: Ingresos Mensuales
    this.addRevenueByMonthSheet(workbook, filteredData);

    // Hoja 4: Ventas por Tipo de Entrada
    this.addTicketSalesSheet(workbook, filteredData);

    // Hoja 5: Tendencias de Asistencia
    this.addAttendanceTrendsSheet(workbook, filteredData);

    // Hoja 6: Datos Geográficos
    this.addGeographicDataSheet(workbook, filteredData);

    // Generar nombre del archivo
    const fileName = this.generateFileName(filters, 'xlsx');

    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Filtra los datos según el período seleccionado
   */
  private static filterDataByPeriod(data: ReportData, filters: ExportFilters): ReportData {
    if (!filters.month) {
      // Sin filtro de mes, solo filtrar por año
      return {
        ...data,
        revenueByMonth: data.revenueByMonth.filter(
          item => item.year.toString() === filters.year
        ),
        attendanceTrends: data.attendanceTrends.filter(trend => {
          const year = new Date(trend.date).getFullYear();
          return year.toString() === filters.year;
        })
      };
    }

    // Con filtro de mes específico
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const selectedMonthName = monthNames[parseInt(filters.month) - 1];

    const filteredRevenueByMonth = data.revenueByMonth.filter(
      item => item.year.toString() === filters.year && item.month === selectedMonthName
    );

    const filteredAttendanceTrends = data.attendanceTrends.filter(trend => {
      const date = new Date(trend.date);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return year.toString() === filters.year && month === filters.month;
    });

    // Recalcular métricas solo para el mes seleccionado
    const monthRevenue = filteredRevenueByMonth.reduce((sum, item) => sum + item.revenue, 0);
    const monthEvents = filteredRevenueByMonth.reduce((sum, item) => sum + item.events, 0);
    const monthAttendees = filteredAttendanceTrends.reduce(
      (sum, trend) => sum + trend.checkIns, 
      0
    );

    // Calcular tasa de conversión del mes
    const monthTotalTickets = filteredAttendanceTrends.reduce(
      (sum, trend) => sum + trend.checkIns + trend.noShows,
      0
    );
    const monthCheckIns = filteredAttendanceTrends.reduce(
      (sum, trend) => sum + trend.checkIns,
      0
    );
    const monthConversionRate = monthTotalTickets > 0 
      ? Math.round((monthCheckIns / monthTotalTickets) * 100 * 10) / 10
      : 0;

    // Calcular precio promedio del mes
    const monthAverageTicketPrice = monthAttendees > 0 
      ? Math.round((monthRevenue / monthAttendees) * 100) / 100
      : 0;

    // Filtrar eventos destacados del mes
    const filteredTopEvents = data.topEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventYear = eventDate.getFullYear();
      const eventMonth = (eventDate.getMonth() + 1).toString().padStart(2, '0');
      return eventYear.toString() === filters.year && eventMonth === filters.month;
    }).slice(0, 10); // Top 10 del mes

    // Filtrar ventas por tipo del mes (basándonos en los eventos del mes)
    const monthEventIds = new Set(filteredTopEvents.map(e => e.id));
    const filteredTicketSales = data.ticketSalesByType.filter(
      ticket => monthEventIds.has(ticket.eventId)
    );

    return {
      ...data,
      totalEvents: monthEvents,
      totalRevenue: monthRevenue,
      totalAttendees: monthAttendees,
      conversionRate: monthConversionRate,
      averageTicketPrice: monthAverageTicketPrice,
      growth: {
        events: 0, // No calculamos crecimiento para mes específico
        revenue: 0,
        attendees: 0,
        conversionRate: 0
      },
      topEvents: filteredTopEvents,
      revenueByMonth: filteredRevenueByMonth,
      attendanceTrends: filteredAttendanceTrends,
      ticketSalesByType: filteredTicketSales
    };
  }

  /**
   * Hoja 1: Resumen Ejecutivo
   */
  private static addExecutiveSummarySheet(
    workbook: XLSX.WorkBook,
    data: ReportData,
    filters: ExportFilters
  ): void {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const periodText = filters.month
      ? `${monthNames[parseInt(filters.month) - 1]} ${filters.year}`
      : `Año ${filters.year}`;

    const isMonthlyReport = !!filters.month;

    const summaryData = [
      ['REPORTE DE ANALYTICS - EVENTHUB'],
      ['Período:', periodText],
      ['Fecha de Generación:', new Date().toLocaleDateString('es-CO')],
      [],
      ['MÉTRICAS GENERALES']
    ];

    // Agregar métricas con o sin crecimiento según el tipo de reporte
    if (isMonthlyReport) {
      summaryData.push(
        ['Total de Eventos', data.totalEvents.toString()],
        ['Ingresos Totales', `$${data.totalRevenue.toLocaleString('es-CO')}`],
        ['Total Asistentes', data.totalAttendees.toString()],
        ['Tasa de Conversión', `${data.conversionRate.toFixed(1)}%`],
        ['Precio Promedio Ticket', `$${data.averageTicketPrice.toLocaleString('es-CO')}`]
      );
    } else {
      summaryData.push(
        ['Total de Eventos', data.totalEvents.toString(), `Crecimiento: ${data.growth.events.toFixed(1)}%`],
        ['Ingresos Totales', `$${data.totalRevenue.toLocaleString('es-CO')}`, `Crecimiento: ${data.growth.revenue.toFixed(1)}%`],
        ['Total Asistentes', data.totalAttendees.toString(), `Crecimiento: ${data.growth.attendees.toFixed(1)}%`],
        ['Tasa de Conversión', `${data.conversionRate.toFixed(1)}%`, `Crecimiento: ${data.growth.conversionRate.toFixed(1)}%`],
        ['Precio Promedio Ticket', `$${data.averageTicketPrice.toLocaleString('es-CO')}`]
      );
    }

    summaryData.push(
      [],
      ['MÉTRICAS DE PRECIOS'],
      ['Precio Promedio', `$${data.priceMetrics.averagePrice.toLocaleString('es-CO')}`],
      ['Ticket Más Caro', `$${data.priceMetrics.maxPrice.toLocaleString('es-CO')}`],
      ['Ticket Más Barato', `$${data.priceMetrics.minPrice.toLocaleString('es-CO')}`],
      [],
      ['ESTADÍSTICAS DE ASISTENCIA'],
      ['Tasa de Asistencia Promedio', `${data.attendanceStats.averageAttendanceRate.toFixed(1)}%`],
      ['Mejor Día de la Semana', data.attendanceStats.bestDayOfWeek],
      ['Hora Pico de Registro', data.attendanceStats.peakCheckInHour]
    );

    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 25 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Resumen Ejecutivo');
  }

  /**
   * Hoja 2: Eventos Destacados
   */
  private static addTopEventsSheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const headers = ['Posición', 'Evento', 'Ingresos', 'Asistentes', 'Fecha'];
    const rows = data.topEvents.map((event, index) => [
      (index + 1).toString(),
      event.title || 'Sin título',
      `$${event.revenue.toLocaleString('es-CO')}`,
      event.attendees.toString(),
      event.date ? new Date(event.date).toLocaleDateString('es-CO') : 'N/A'
    ]);

    const wsData = [
      ['EVENTOS DESTACADOS'],
      [],
      headers,
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 10 },
      { wch: 40 },
      { wch: 18 },
      { wch: 12 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Eventos Destacados');
  }

  /**
   * Hoja 3: Ingresos Mensuales
   */
  private static addRevenueByMonthSheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const rows: any[] = [];

    data.revenueByMonth.forEach(monthData => {
      rows.push([
        `${monthData.month} ${monthData.year}`,
        `$${monthData.revenue.toLocaleString('es-CO')}`,
        monthData.events.toString(),
        `${monthData.growthVsPrevMonth >= 0 ? '+' : ''}${monthData.growthVsPrevMonth.toFixed(1)}%`,
        '' // Columna para fechas
      ]);

      // Agregar eventos del mes con sus fechas
      if (monthData.eventsList && monthData.eventsList.length > 0) {
        monthData.eventsList.forEach(event => {
          // Formatear fechas
          const eventDate = event.eventDate 
            ? new Date(event.eventDate).toLocaleDateString('es-CO')
            : 'No especificada';
          
          const salesStart = event.salesStart
            ? new Date(event.salesStart).toLocaleDateString('es-CO')
            : 'No especificado';

          rows.push([
            `  → ${event.title}`,
            `$${event.revenue.toLocaleString('es-CO')}`,
            '',
            `${event.percentage.toFixed(1)}%`,
            `Fecha del Evento: ${eventDate} | Periodo de Ventas: Desde ${salesStart}`
          ]);
        });
        rows.push([]); // Línea vacía entre meses
      }
    });

    const wsData = [
      ['INGRESOS MENSUALES'],
      [],
      ['Período', 'Ingresos', 'Eventos', 'Crecimiento', 'Fechas del Evento'],
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 40 },
      { wch: 18 },
      { wch: 10 },
      { wch: 15 },
      { wch: 50 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Ingresos Mensuales');
  }

  /**
   * Hoja 4: Ventas por Tipo de Entrada
   */
  private static addTicketSalesSheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const headers = ['Tipo de Entrada', 'Evento', 'Ventas', 'Ingresos'];
    const rows = data.ticketSalesByType.map(ticket => [
      ticket.type || 'General',
      ticket.eventName || 'Sin nombre',
      ticket.sales.toString(),
      `$${ticket.revenue.toLocaleString('es-CO')}`
    ]);

    const wsData = [
      ['VENTAS POR TIPO DE ENTRADA'],
      [],
      headers,
      ...rows,
      [],
      ['TOTALES'],
      [
        'Total General',
        '',
        data.ticketSalesByType.reduce((sum, t) => sum + t.sales, 0).toString(),
        `$${data.ticketSalesByType.reduce((sum, t) => sum + t.revenue, 0).toLocaleString('es-CO')}`
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 25 },
      { wch: 40 },
      { wch: 12 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Ventas por Tipo');
  }

  /**
   * Hoja 5: Tendencias de Asistencia
   */
  private static addAttendanceTrendsSheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const headers = ['Fecha', 'Asistieron', 'No Asistieron', 'Total', 'Tasa Asistencia'];
    const rows = data.attendanceTrends.map(trend => {
      const total = trend.checkIns + trend.noShows;
      const rate = total > 0 ? ((trend.checkIns / total) * 100).toFixed(1) : '0';
      return [
        trend.date,
        trend.checkIns.toString(),
        trend.noShows.toString(),
        total.toString(),
        `${rate}%`
      ];
    });

    const wsData = [
      ['TENDENCIAS DE ASISTENCIA'],
      [],
      headers,
      ...rows,
      [],
      ['RESUMEN'],
      [
        'Total Asistieron',
        data.attendanceTrends.reduce((sum, t) => sum + t.checkIns, 0).toString()
      ],
      [
        'Total No Asistieron',
        data.attendanceTrends.reduce((sum, t) => sum + t.noShows, 0).toString()
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Tendencias Asistencia');
  }

  /**
   * Hoja 6: Datos Geográficos
   */
  private static addGeographicDataSheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const headers = ['Ubicación', 'Eventos', 'Ingresos'];
    const rows = data.geographicData.map(location => [
      location.location,
      location.events.toString(),
      `$${location.revenue.toLocaleString('es-CO')}`
    ]);

    const wsData = [
      ['DISTRIBUCIÓN GEOGRÁFICA'],
      [],
      headers,
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Datos Geográficos');
  }

  /**
   * Genera el nombre del archivo basado en los filtros
   */
  private static generateFileName(filters: ExportFilters, format: 'xlsx' | 'pdf' = 'xlsx'): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    if (filters.month) {
      const monthName = monthNames[parseInt(filters.month) - 1];
      return `Reporte_EventHub_${monthName}_${filters.year}_${timestamp}.${extension}`;
    }

    return `Reporte_EventHub_${filters.year}_${timestamp}.${extension}`;
  }
}
