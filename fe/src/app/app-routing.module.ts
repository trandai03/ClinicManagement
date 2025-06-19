import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { AdminComponent } from './components/admin/admin.component';
import { ClientComponent } from './components/client/client.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { doctorGuard } from './guards/doctor.guard';
import { clientGuard } from './guards/client.guard';
import { ToastComponent } from './components/auth/toast/toast.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/trang-chu',
    pathMatch: 'full'
  },
  {
    path: 'public',
    component: ClientComponent,
    loadChildren: ()=> import('./components/client/client.module').then(m => m.ClientModule)
  },
  {
    path: 'client',
    canActivate: [authGuard, clientGuard],
    component: ClientComponent,
    loadChildren: ()=> import('./components/client/client.module').then(m => m.ClientModule)
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'doctor',
    canActivate: [authGuard, doctorGuard],
    component: DoctorComponent,
    loadChildren: () => import('./components/doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
    loadChildren: ()=> import('./components/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'toast-demo',
    component: ToastComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
