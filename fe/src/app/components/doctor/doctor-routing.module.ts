import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { DoctorComponent } from "./doctor.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { TodayScheduleComponent } from "./today-schedule/today-schedule.component";
import { WorkScheduleComponent } from "./today-schedule/work-schedule.component";
import { BookingComponent } from "./booking/booking.component";
import { NotificationComponent } from "./notification/notification.component";
import { ProfileComponent } from "./profile/profile.component";
import { CompletedExaminationsComponent } from "./completed-examinations/completed-examinations.component";
import { ExaminationComponent } from "./examination/examination.component";
import { InProgressComponent } from "./in-progress/in-progress.component";


const router: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: 'home',
        component: DashboardComponent
    },
    {
        path: 'today-schedule',
        component: TodayScheduleComponent
    },
    {
        path: 'work-schedule',
        component: WorkScheduleComponent
    },
    {
        path: 'booking',
        component: BookingComponent
    },
    {
        path: 'in-progress',
        component: InProgressComponent
    },
    {
        path: 'examination/:id',
        component: ExaminationComponent
    },
    {
        path: 'notification',
        component: NotificationComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        path: 'completed-examinations',
        component: CompletedExaminationsComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})


export class DoctorRoutingModule{

}