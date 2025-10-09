// Exportar todos los servicios
export { UserService } from './User.service';
export { EventService } from './Event.service';
export { TicketTypeService } from './TicketType.service';
export { PurchaseService } from './Purchase.service';
export { NotificationService } from './Notification.service';
export { EmailTemplateService } from './EmailTemplate.service';
export { AnalyticsService } from './Analytics.service';
export { RealtimeService } from './Realtime.service';

// Mantener compatibilidad con el archivo original
export { UserService as ServicioUsuarios } from './User.service';
export { EventService as ServicioEventos } from './Event.service';
export { TicketTypeService as ServicioTiposEntrada } from './TicketType.service';
export { PurchaseService as ServicioCompras } from './Purchase.service';
export { NotificationService as ServicioNotificaciones } from './Notification.service';
export { EmailTemplateService as ServicioPlantillasEmail } from './EmailTemplate.service';
export { AnalyticsService as ServicioAnaliticas } from './Analytics.service';
export { RealtimeService as ServicioTiempoReal } from './Realtime.service';
