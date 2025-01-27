import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {

  //Inyecta el servicio de autenticacion
  const authService = inject(AuthService);

  //verifica si el usuario tienen un token valido
  const token = authService.getToken();
  if(token){
    return true; // permite la navegacion si el token existe
  }

  //Redirige al login si no hay token
  const router = inject(Router);
  router.navigate(['/forbidden']); //redirige a la pagina 403)
  
  return false;
};
