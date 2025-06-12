import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { DoctorComponent } from "./doctor.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ScheduleComponent } from "./schedule/schedule.component";
import { WorkScheduleComponent } from "./schedule/work-schedule.component";
import { BookingComponent } from "./booking/booking.component";
import { NotificationComponent } from "./notification/notification.component";
import { ProfileComponent } from "./profile/profile.component";
import { HistoryComponent } from "./history/history.component";
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
        path: 'schedule',
        component: ScheduleComponent
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
        path: 'history',
        component: HistoryComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})


export class DoctorRoutingModule{

}