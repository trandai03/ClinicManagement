import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminComponent } from "./admin.component";
import { DoctorsComponent } from "./doctors/doctors.component";
import { MajorComponent } from "./major/major.component";
import { ArticleComponent } from "./article/article.component";
import { BookingComponent } from "./booking/booking.component";
import { HistoryComponent } from "./history/history.component";
import { ContactComponent } from "./contact/contact.component";
import { ProfileComponent } from "./profile/profile.component";
import { MedicineComponent } from "./medicine/medicine.component";
import { MedicalServiceComponent } from "./medical-service/medical-service.component";
import { DoctorRankComponent } from "./doctor-rank/doctor-rank.component";


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
        path: 'article',
        component: ArticleComponent
    },
    {
        path: 'doctors/:vip',
        component: DoctorsComponent
    },
    {
        path: 'major',
        component: MajorComponent
    },
    {
        path: 'doctor-rank',
        component: DoctorRankComponent
    },
    {
        path: 'booking',
        component: BookingComponent
    },
    {
        path: 'history',
        component: HistoryComponent
    },
    {
        path: 'contact',
        component: ContactComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        path: 'medicine',
        component: MedicineComponent
    },
    {
        path: 'medical-service',	
        component: MedicalServiceComponent
    }

];
@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})


export class AdminRoutingModule{

}