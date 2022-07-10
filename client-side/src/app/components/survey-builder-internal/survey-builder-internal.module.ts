import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';

import { SectionModule } from '../section/section.module'
import { SurveyBuilderComponent } from './survey-builder-internal.component';
// import { RouterModule, Routes } from '@angular/router';
// import { config } from '../addon.config';

// export const routes: Routes = [
//     {
//         path: '',
//         component: SurveyBuilderComponent
//     }
// ];

@NgModule({
    declarations: [
        SurveyBuilderComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PepNgxLibModule,
        PepRemoteLoaderModule,
        PepSizeDetectorModule,
        PepDialogModule,
        DragDropModule,
        SectionModule,
        // TranslateModule.forChild({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (addonService: PepAddonService) => 
        //             PepAddonService.createMultiTranslateLoader(addonService, ['ngx-lib', 'ngx-composite-lib'], config.AddonUUID),
        //         deps: [PepAddonService]
        //     }, isolate: false
        // }),
        // RouterModule.forChild(routes)
    ],
    exports:[SurveyBuilderComponent],
})
export class SurveyBuilderInternalModule {
    // constructor(
    //     translate: TranslateService,
    //     private pepAddonService: PepAddonService
    // ) {
    //     this.pepAddonService.setDefaultTranslateLang(translate);
    // }
}
