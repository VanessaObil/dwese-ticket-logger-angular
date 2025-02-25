import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';


/**
 * Componente para mostrar las notificaciones en la aplicación.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatBadgeModule, MatListModule],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = []; // Almacena la lista de notificaciones recibidas
  unreadCount: number = 0; // Contador de notificaciones no leídas
  private subscription: Subscription | undefined; // Suscripción a las notificaciones en tiempo real


  constructor(
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.notificationService.connect(); // Conecta el servicio de WebSocket para recibir notificaciones

    // Cargar historial de notificaciones desde la API REST si hay usuario autenticado
    this.notificationService.loadUserNotifications().subscribe((history) => {
        if (history && history.length > 0) {
            this.notifications = history;
            this.unreadCount = history.length;
        }
    });

    // Suscribirse a nuevas notificaciones en tiempo real
    this.subscription = this.notificationService.getNotifications().subscribe((notifs) => {
        if (notifs && Array.isArray(notifs)) {
            notifs.forEach(notification => {
                if (notification && notification.subject && notification.message) {
                    this.notifications.unshift(notification); // Agrega la notificación al inicio de la lista
                    this.unreadCount++; // Incrementa el contador de no leídas
                }
            });
        }
    });
}

markAllAsRead(): void {
  this.unreadCount = 0;
}

/**
* 🛠️ Método de limpieza cuando el componente se destruye.
* Se desuscribe de las notificaciones en tiempo real y desconecta el servicio WebSocket.
*/
ngOnDestroy(): void {
  if (this.subscription) {
      this.subscription.unsubscribe(); // Cancela la suscripción a las notificaciones en tiempo real
  }
  this.notificationService.disconnect(); // Desconecta el WebSocket al salir del componente
}




}
