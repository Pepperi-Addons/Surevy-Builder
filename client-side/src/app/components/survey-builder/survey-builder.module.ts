// import { CommonModule } from '@angular/common';
// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
// import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';
// import { NavigationService } from 'src/app/services/navigation.service';
// import { SurveysService } from 'src/app/services/surveys.service';
// import { config } from '../addon.config';
// import { SurveyBuilderInternalModule } from '../survey-builder-internal';

// import { SurveyBuilderComponent} from './index';

// export const routes: Routes = [
//     {
//         path: '',
//         component: SurveyBuilderComponent,
//         data: { showSidebar: false, addPadding: false}
//     }
// ];

// @NgModule({
//     declarations: [
//         SurveyBuilderComponent,
//     ],
//     imports: [
//         CommonModule,
//         PepNgxLibModule,
//         SurveyBuilderInternalModule,
//         TranslateModule.forChild({
//             loader: {
//                 provide: TranslateLoader,
//                 useFactory: (addonService: PepAddonService) => 
//                     PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
//                 deps: [PepAddonService]
//             }, isolate: false
//         }),
//         RouterModule.forChild(routes)
//     ],
//     exports:[SurveyBuilderComponent],
//     providers: [
//         TranslateStore,
//         // When loading this module from route we need to add this here (because only this module is loading).
//         NavigationService,
//         SurveysService
//     ]
// })
// export class SurveyBuilderModule {
//     constructor(
//         translate: TranslateService,
//         private pepAddonService: PepAddonService
//     ) {
//         this.pepAddonService.setDefaultTranslateLang(translate);
//     }
// }
