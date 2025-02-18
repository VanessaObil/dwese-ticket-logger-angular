import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';


@Injectable({
 providedIn: 'root'
})
export class RegionService {


 constructor(private http: HttpClient, private authService: AuthService) { }

 /**
  * Método para obtener las regiones desde la API.
  * @returns Observable que emite la lista de regiones.
  */
 fetchRegions(page: number, size: number, sortColumn: string, sortDirection: string): Observable<any> {
   const token = this.authService.getToken(); // Obtén el token del AuthService


   if (!token) {
     // Si no hay token, lanza un error indicando que el usuario no está autorizado.
     return throwError(() => new Error('Unauthorized'));
   }
   const params = new HttpParams()
   .set('page', page.toString())
   .set('size', size.toString())
    .set('sort', `${sortColumn},${sortDirection}`);


   // Realiza la solicitud GET al endpoint de regiones con el token en el encabezado.
   return this.http.get(`${environment.apiUrl}/regions`, {
     headers: new HttpHeaders({
       Authorization: `Bearer ${token}`}),
       params: params
   });
 }
}
