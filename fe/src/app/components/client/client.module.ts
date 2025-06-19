import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FooterComponent } from "./footer/footer.component";
import { HomeComponent } from "./home/home.component";
import { HeaderComponent } from "./header/header.component";
import { ClientComponent } from "./client.component";
import { MajorComponent } from './major/major.component';
import { ClientRoutingModule } from "./client-routing.module";
import { ScheduleComponent } from './schedule/schedule.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, NgModel, ReactiveFormsModule } from "@angular/forms";
import { DoctorComponent } from './doctor/doctor.component';
import { ArticleComponent } from './article/article.component';
import { ContactComponent } from './contact/contact.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';
import { NgxPaginationModule } from "ngx-pagination";
import { ProfileComponent } from './profile/profile.component';
import { DataTablesModule } from "angular-datatables";




@NgModule({
    declarations: [FooterComponent,HomeComponent,HeaderComponent,ClientComponent, MajorComponent, ScheduleComponent, DoctorComponent, ArticleComponent, ContactComponent, DoctorDetailComponent, ProfileComponent],
    imports: [
      CommonModule, // <-- Import thêm để dùng forms sau này
      FormsModule,
      ClientRoutingModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatNativeDateModule,
      MatInputModule,
      ReactiveFormsModule,
      FormsModule,
      NgxPaginationModule,
      DataTablesModule
    ],
  })
  export class ClientModule {}