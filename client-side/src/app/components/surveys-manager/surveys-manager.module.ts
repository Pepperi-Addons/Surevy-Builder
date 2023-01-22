import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

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


import { ServeysManagerComponent } from './surveys-manager.component';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';
import { PepNgxCompositeLibModule } from '@pepperi-addons/ngx-composite-lib';

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
        PepNgxCompositeLibModule,
        PepGenericListModule,
        PepSizeDetectorModule,
        PepTopBarModule,
        PepSideBarModule,
        PepPageLayoutModule,
        PepButtonModule,
        PepTextboxModule,
        PepTextareaModule,
        PepSelectModule,
        PepMenuModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes)
    ],
    exports:[ServeysManagerComponent]
})
export class SurveysManagerModule {
    constructor(
        private pepIconRegistry: PepIconRegistry
    ) {
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
