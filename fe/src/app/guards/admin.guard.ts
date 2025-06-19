import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Kiểm tra đăng nhập
  if (!authService.isLogin()) {
    router.navigate(['/public/dang-nhap']);
    return false;
  }

  // Kiểm tra role admin (roleId = '1')
  if (authService.isAdmin()) {
    return true;
  }

  // Nếu không phải admin, điều hướng về trang tương ứng với role hiện tại
  authService.navigateToRoleDashboard();
  return false;
}; 