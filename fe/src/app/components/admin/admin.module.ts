import { NgModule } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { CommonModule } from "@angular/common";
import { AdminRoutingModule } from "./admin-routing.module";
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { MajorComponent } from './major/major.component';
import { ArticleComponent } from './article/article.component';
import { BookingComponent } from './booking/booking.component';
import { HistoryComponent } from './history/history.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartModule } from "primeng/chart";
import { DataTablesModule } from "angular-datatables"
import { ToastrModule } from "ngx-toastr";
import { MedicineComponent } from './medicine/medicine.component';
import { MedicalServiceComponent } from './medical-service/medical-service.component';
import { DoctorRankComponent } from './doctor-rank/doctor-rank.component';



@NgModule({
    declarations: [AdminComponent, HeaderComponent, FooterComponent, NavbarComponent, DoctorsComponent,DashboardComponent, MajorComponent, ArticleComponent, ContactComponent, BookingComponent, HistoryComponent, ContactComponent, ProfileComponent, MedicineComponent, MedicalServiceComponent, DoctorRankComponent],
    imports: [
      CommonModule, // <-- Import thêm để dùng forms sau này
      AdminRoutingModule,
      ReactiveFormsModule,
      ChartModule,
      DataTablesModule,
      ToastrModule,
      FormsModule
  ]})
  export class AdminModule {}
