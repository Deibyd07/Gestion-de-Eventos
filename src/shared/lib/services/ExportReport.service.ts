import * as XLSX from 'xlsx';

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
    const fileName = this.generateFileName(filters);

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
        ['Tasa de Conversión', `${data.conversionRate}%`],
        ['Precio Promedio Ticket', `$${data.averageTicketPrice.toLocaleString('es-CO')}`]
      );
    } else {
      summaryData.push(
        ['Total de Eventos', data.totalEvents.toString(), `Crecimiento: ${data.growth.events}%`],
        ['Ingresos Totales', `$${data.totalRevenue.toLocaleString('es-CO')}`, `Crecimiento: ${data.growth.revenue}%`],
        ['Total Asistentes', data.totalAttendees.toString(), `Crecimiento: ${data.growth.attendees}%`],
        ['Tasa de Conversión', `${data.conversionRate}%`, `Crecimiento: ${data.growth.conversionRate}%`],
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
      ['Tasa de Asistencia Promedio', `${data.attendanceStats.averageAttendanceRate}%`],
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
      event.title,
      `$${event.revenue.toLocaleString('es-CO')}`,
      event.attendees.toString(),
      new Date(event.date).toLocaleDateString('es-CO')
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
        `${monthData.growthVsPrevMonth >= 0 ? '+' : ''}${monthData.growthVsPrevMonth}%`,
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
            `${event.percentage}%`,
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
      ticket.type,
      ticket.eventName,
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
  private static generateFileName(filters: ExportFilters): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (filters.month) {
      const monthName = monthNames[parseInt(filters.month) - 1];
      return `Reporte_EventHub_${monthName}_${filters.year}_${timestamp}.xlsx`;
    }

    return `Reporte_EventHub_${filters.year}_${timestamp}.xlsx`;
  }
}
