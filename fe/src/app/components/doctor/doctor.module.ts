import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header/header.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { DoctorRoutingModule } from "./doctor-routing.module";
import { DoctorComponent } from "./doctor.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ScheduleComponent } from './schedule/schedule.component';
import { WorkScheduleComponent } from './schedule/work-schedule.component';
import { BookingComponent } from './booking/booking.component';
import { NotificationComponent } from './notification/notification.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { HistoryComponent } from './history/history.component';
import { ExaminationComponent } from './examination/examination.component';
import { InProgressComponent } from './in-progress/in-progress.component';

@NgModule({
    declarations: [
        HeaderComponent,
        NavbarComponent,
        FooterComponent,
        DoctorComponent,
        DashboardComponent, 
        ScheduleComponent, 
        WorkScheduleComponent, 
        BookingComponent, 
        NotificationComponent, 
        ProfileComponent, 
        HistoryComponent, 
        ExaminationComponent,
        InProgressComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      DoctorRoutingModule, // <-- Import thêm để dùng forms sau này,
      ReactiveFormsModule,
      DataTablesModule
    ],
})
export class DoctorModule {}