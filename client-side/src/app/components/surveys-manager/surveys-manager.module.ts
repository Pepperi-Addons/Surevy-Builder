import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { PepGenericListModule } from '@pepperi-addons/ngx-composite-lib/generic-list';

import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { PepSideBarModule } from '@pepperi-addons/ngx-lib/side-bar';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { PepIconRegistry, pepIconSystemClose, pepIconArrowLeftAlt, pepIconNumberPlus } from '@pepperi-addons/ngx-lib/icon';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';

import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { ServeysManagerComponent } from './surveys-manager.component';
import { config } from '../addon.config';
import { SurveysService } from 'src/app/services/surveys.service';
import { NavigationService } from 'src/app/services/navigation.service';

const pepIcons = [
    pepIconSystemClose,
    pepIconArrowLeftAlt,
    pepIconNumberPlus
];

export const routes: Routes = [
    {
        path: '',
        component: ServeysManagerComponent
    }
];

@NgModule({
    declarations: [
        ServeysManagerComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MatIconModule,        
        PepNgxLibModule,
        PepGenericListModule,
        PepSizeDetectorModule,
        PepTopBarModule,
        PepSideBarModule,
        PepPageLayoutModule,
        PepButtonModule,
        PepTextboxModule,
        PepTextareaModule,
        PepSelectModule,        
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        }),
        RouterModule.forChild(routes)
    ],
    exports:[ServeysManagerComponent],
    providers: [
        TranslateStore,
        // When loading this module from route we need to add this here (because only this module is loading).
        SurveysService,
        NavigationService
    ]
})
export class SurveysManagerModule {
    constructor(
        translate: TranslateService,
        private pepIconRegistry: PepIconRegistry,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
