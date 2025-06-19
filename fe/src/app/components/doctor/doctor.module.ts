import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header/header.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { DoctorRoutingModule } from "./doctor-routing.module";
import { DoctorComponent } from "./doctor.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { TodayScheduleComponent } from './today-schedule/today-schedule.component';
import { TodayScheduleListComponent } from './today-schedule/today-schedule-list.component';
import { TodayScheduleSimpleComponent } from './today-schedule/today-schedule-simple.component';
import { WorkScheduleComponent } from './today-schedule/work-schedule.component';
import { NotificationComponent } from './notification/notification.component';
import { ProfileComponent } from './profile/profile.component';
import { CompletedExaminationsComponent } from './completed-examinations/completed-examinations.component';
import { ExaminationComponent } from './examination/examination.component';
import { InProgressComponent } from './in-progress/in-progress.component';
import { PendingConfirmationsComponent } from './pending-confirmations/pending-confirmations.component';
import { AwaitingResultsComponent } from './awaiting-results/awaiting-results.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { ToastrModule } from 'ngx-toastr';
import { ExaminationReportComponent } from './examination-report/examination-report.component';

@NgModule({
    declarations: [
        DoctorComponent,
        DashboardComponent,
        TodayScheduleComponent,
        TodayScheduleListComponent,
        TodayScheduleSimpleComponent,
        WorkScheduleComponent,
        NotificationComponent,
        ProfileComponent,
        CompletedExaminationsComponent,
        ExaminationComponent,
        InProgressComponent,
        PendingConfirmationsComponent,
        AwaitingResultsComponent,
        NavbarComponent,
        HeaderComponent,
        FooterComponent,
        ExaminationReportComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      DoctorRoutingModule, // <-- Import thêm để dùng forms sau này,
      ReactiveFormsModule,
      DataTablesModule,
      ToastrModule.forRoot()
    ],
    exports: [
      NavbarComponent,
      HeaderComponent,
      FooterComponent
    ]
})
export class DoctorModule {}