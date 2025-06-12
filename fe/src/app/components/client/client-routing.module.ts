import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { MajorComponent } from "./major/major.component";
import { HomeComponent } from "./home/home.component";
import { DoctorComponent } from "./doctor/doctor.component";
import { ArticleComponent } from "./article/article.component";
import { ContactComponent } from "./contact/contact.component";
import { DoctorDetailComponent } from "./doctor-detail/doctor-detail.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { RegisterComponent } from "./register/register.component";


const router: Routes = [
    {
        path: 'trang-chu',
        component: HomeComponent
    },
    {
        path: 'chuyen-khoa',
        component: MajorComponent
    },
    {
        path: 'danh-muc-bac-si',
        component: DoctorComponent,
    },
    {
        path: 'bac-si-chi-tiet/:id',
        component: DoctorDetailComponent
    },
    {
        path: 'lien-he',
        component: ContactComponent
    },
    {
        path: 'tin-tuc',
        component: ArticleComponent
    },
    {
        path: 'dang-nhap',
        component: LoginComponent
    },
    {
        path: 'dang-ky',
        component: RegisterComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})


export class ClientRoutingModule{

}