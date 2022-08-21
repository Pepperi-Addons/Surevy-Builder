import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

// import { Component } from '@angular/core';
// @Component({
//     selector: 'app-empty-route',
//     template: '<div>Route is not exist.</div>',
// })
// export class EmptyRouteComponent {}

const routes: Routes = [
    {
        path: ':settingsSectionName/:addonUUID/:slugName',
        component: SettingsComponent,
        children: [
            {
                path: ':survey_key',
                loadChildren: () => import('../survey-manager/survey-manager.module').then(m => m.SurveyManagerModule)
            },
            {
                path: '**',
                loadChildren: () => import('../surveys-manager/surveys-manager.module').then(m => m.SurveysManagerModule),
            },
            // { path: '**', component: EmptyRouteComponent }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class SettingsRoutingModule { }



