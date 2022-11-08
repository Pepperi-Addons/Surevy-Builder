import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRadioModule } from '@angular/material/radio'
import { MatIconModule } from '@angular/material/icon';
/*
import { PepIconModule, pepIconNumberPlus, PepIconRegistry, pepIconSystemBolt, pepIconSystemClose,
    pepIconSystemEdit, pepIconSystemMove, pepIconSystemBin, pepIconViewCardMd, pepIconSystemView, pepIconDeviceMobile, pepIconDeviceTablet, pepIconDeviceDesktop } from '@pepperi-addons/ngx-lib/icon';*/
import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { PepSideBarModule } from '@pepperi-addons/ngx-lib/side-bar';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { PepIconRegistry, pepIconSystemClose, pepIconArrowLeftAlt, pepIconNumberPlus, pepIconArrowDown, pepIconSystemBin } from '@pepperi-addons/ngx-lib/icon';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';
import { PepDateModule } from '@pepperi-addons/ngx-lib/date';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepSnackBarModule } from '@pepperi-addons/ngx-lib/snack-bar';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';

import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { SurveyBuilderInternalModule } from '../survey-builder-internal/survey-builder-internal.module';
import { SelectedItemEditorModule } from '../selected-item-editor/selected-item-editor.module'
import { QuestionMenuModule } from '../question-menu/question-menu.module';

import { ServeyManagerComponent } from './survey-manager.component';

import { config } from '../addon.config';
import { SurveysService } from 'src/app/services/surveys.service';
import { NavigationService } from 'src/app/services/navigation.service';

const pepIcons = [
    pepIconSystemClose,
    pepIconArrowLeftAlt,
    pepIconNumberPlus,
    pepIconArrowDown,
    pepIconSystemBin
];

export const routes: Routes = [
    {
        path: '',
        component: ServeyManagerComponent,
        data: { showSidebar: false, addPadding: false}
    }
];

@NgModule({
    declarations: [
        ServeyManagerComponent        
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FlexLayoutModule,
        SurveyBuilderInternalModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatIconModule,
        PepNgxLibModule,
        PepSizeDetectorModule,
        PepTopBarModule,
        PepSideBarModule,
        PepPageLayoutModule,
        PepButtonModule,
        PepTextboxModule,
        PepTextareaModule,
        PepSelectModule,
        PepMenuModule,
        PepDateModule,
        PepCheckboxModule,
        PepSnackBarModule,     
        PepFieldTitleModule,
        SelectedItemEditorModule,
        QuestionMenuModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes)
    ],
    exports:[ServeyManagerComponent],
    
})
export class SurveyManagerModule {
    constructor(
        private pepIconRegistry: PepIconRegistry
    ) {
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
