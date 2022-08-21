import { NgModule, OnInit } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '**',
        loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule),
    }
    // ,
    // {   path: '**', component: EmptyRouteComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }



