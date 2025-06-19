import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { DoctorComponent } from "./doctor.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { TodayScheduleComponent } from "./today-schedule/today-schedule.component";
import { TodayScheduleListComponent } from "./today-schedule/today-schedule-list.component";
import { TodayScheduleSimpleComponent } from "./today-schedule/today-schedule-simple.component";
import { WorkScheduleComponent } from "./today-schedule/work-schedule.component";
import { NotificationComponent } from "./notification/notification.component";
import { ProfileComponent } from "./profile/profile.component";
import { CompletedExaminationsComponent } from "./completed-examinations/completed-examinations.component";
import { ExaminationComponent } from "./examination/examination.component";
import { ExaminationReportComponent } from "./examination-report/examination-report.component";
import { InProgressComponent } from "./in-progress/in-progress.component";
import { PendingConfirmationsComponent } from "./pending-confirmations/pending-confirmations.component";
import { AwaitingResultsComponent } from "./awaiting-results/awaiting-results.component";

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
        path: 'work-schedule',
        component: WorkScheduleComponent
    },
    {
        path: 'pending-confirmations',
        component: PendingConfirmationsComponent
    },
    {
        path: 'today-schedule',
        component: TodayScheduleSimpleComponent
    },
    {
        path: 'today-schedule-full',
        component: TodayScheduleComponent
    },
    {
        path: 'today-schedule-list',
        component: TodayScheduleListComponent
    },
    {
        path: 'in-progress',
        component: InProgressComponent
    },
    {
        path: 'awaiting-results',
        component: AwaitingResultsComponent
    },
    {
        path: 'examination/:id',
        component: ExaminationComponent
    },
    {
        path: 'examination-report/:id',
        component: ExaminationReportComponent
    },
    {
        path: 'examination-report',
        component: ExaminationReportComponent
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
export class DoctorRoutingModule { }
