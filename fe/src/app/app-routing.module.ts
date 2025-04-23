import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { AdminComponent } from './components/admin/admin.component';
import { ClientComponent } from './components/client/client.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { doctorGuard } from './guards/doctor.guard';

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
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'doctor',
    canActivate: [authGuard,doctorGuard],
    data: {
      role: '2'
    },
    component: DoctorComponent,
    loadChildren: () => import('./components/doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard,adminGuard],
    data: {
      role: '1'
    },
    loadChildren: ()=> import('./components/admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
