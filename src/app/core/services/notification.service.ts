import { Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private stompClient : Client | null = null;
private notificationSubject = new BehaviorSubject<any[]>([]);
private apiUrl =`${environment.webSocketUrl}/notifications`;
private authService!: AuthService;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private injector: Injector)
    { }


    connect():void{
      if(!this.authService){
        this.authService = this.injector.get(AuthService);
      }

      const token = this.authService?.getToken();
      const username = this.authService?.getUsername();

      if (!token || !username) {
        console.error('🚨 No hay token o usuario autenticado, WebSocket no se conectará.');
        return;
    }

    if (this.stompClient && this.stompClient.connected) {
        console.warn('⚠️ WebSocket ya está conectado.');
        return;
    }

    console.log('🌐 WebSocket URL:', environment.websocketBroker);
    // Configuración del cliente STOMP
    this.stompClient = new Client({
        brokerURL: `${environment.websocketBroker}`, // URL del servidor WebSocket
        reconnectDelay: 5000, // Intento de reconexión cada 5 segundos
        debug: (msg) => console.log('STOMP Debug:', msg),
        connectHeaders: {
            Authorization: `Bearer ${token}` // Se envía el token en la cabecera
        },
    });

    this.stompClient.onConnect = () => {
      console.log('✔ WebSocket conectado');

      const token = this.authService?.getToken();
      const username = this.authService.getUsername(); // Obtener usuario autenticado

      console.log(` Usuario autenticado en WebSocket: ${username}`);
      console.log(` Token: ${token ? 'Existe' : 'No encontrado'}`);

      const headers: StompHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // Suscribirse al canal de notificaciones global
      this.stompClient?.subscribe(
          '/topic/notifications',
          (message: IMessage) => {
              try {
                  const notification = JSON.parse(message.body);
                  console.log('📩 Notificación recibida:', notification);

                  // Agregar la notificación a la lista existente
                  const currentNotifications = this.notificationSubject.value;
                  this.notificationSubject.next([...currentNotifications, notification]);

              } catch (error) {
                  console.error('❌ Error al procesar notificación:', error);
              }
          },
          headers // Solo si el token está presente
      );
  };


  this.stompClient.onStompError = (frame) => {
    console.error('STOMP Errror', frame.headers['message']);
  };
  this.stompClient.activate();
  }

    loadUserNotifications(): Observable<any[]> {
      if (!this.authService) {
          this.authService = this.injector.get(AuthService); // Inyección diferida
      }

      const token = this.authService.getToken();
      if (!token) {
          console.warn('⚠ No hay token disponible.');
          return of([]); // Devuelve un observable vacío si no hay token
      }

      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
          tap(notifications => console.log('📩 Notificaciones cargadas:', notifications))
      );
  }

  getNotifications(): Observable<any[]> {
    return this.notificationSubject.asObservable().pipe(
      tap((notifs) => console.log('🔔 Notificaciones actualizadas en tiempo real:', notifs))
   );
  }



disconnect(): void {
  if (this.stompClient) {
    this.stompClient.deactivate();
    console.log('🔌 WebSocket desconectado.');
  }
}

}
