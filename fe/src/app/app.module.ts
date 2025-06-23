import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ClientComponent } from './components/client/client.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DoctorComponent } from './components/doctor/doctor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { ClientModule } from './components/client/client.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptorInterceptor } from './interceptor/auth-interceptor.interceptor';
import { SpinnerComponent } from './components/auth/spinner/spinner.component';
import { LoadingInterceptor } from './interceptor/loading.interceptor';
import { ToastComponent } from './components/auth/toast/toast.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    SpinnerComponent,
    ToastComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
      enableHtml: true,
      tapToDismiss: true,
      titleClass: 'toast-title',
      messageClass: 'toast-message',
      toastClass: 'ngx-toastr custom-toast',
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      }
    }),
  ],
  providers: [
    // Tạm thời comment AuthInterceptor để test localStorage
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
