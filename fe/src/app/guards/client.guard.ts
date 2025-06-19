import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ki?m tra dang nh?p
  if (!authService.isLogin()) {
    router.navigate(['/public/dang-nhap']);
    return false;
  }

  // Ki?m tra role client (roleId = '3')
  if (authService.isClient()) {
    return true;
  }

  // N?u kh�ng ph?i client, di?u hu?ng v? trang tuong ?ng v?i role hi?n t?i
  authService.navigateToRoleDashboard();
  return false;
};
