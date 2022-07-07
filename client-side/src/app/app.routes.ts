import { NgModule, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Important for single spa
@Component({
    selector: 'app-empty-route',
    template: '<div>Route is not exist.</div>',
})
export class EmptyRouteComponent { }

const routes: Routes = [
    {
        path: `settings/:addonUUID`,
        children: [
            {
                path: '**',
                loadChildren: () => import('./surveys-manager/surveys-manager.module').then(m => m.SurveysManagerModule)
            },
        ]
    },
    {
        path: `addons/:addonUUID`,
        children: [
           {
                path: '',
                loadChildren: () => import('./survey-manager/survey-manager.module').then(m => m.SurveyManagerModule)
            }
        ]
    },
    {   path: '**', component: EmptyRouteComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }



