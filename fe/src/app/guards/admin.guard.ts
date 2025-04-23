import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { storageUtils } from "../utils/storage";


export const adminGuard: CanActivateFn = (route, state) => {
  if(route.data['role'] == storageUtils.get('roleId')) return true;
  inject(Router).navigate(['login'])
  return false;
};
