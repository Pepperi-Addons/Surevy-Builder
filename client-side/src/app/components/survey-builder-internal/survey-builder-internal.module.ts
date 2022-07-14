import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';

import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';

import { SectionModule } from '../section/section.module'
import { SurveyBuilderComponent } from './survey-builder-internal.component';

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
        TranslateModule.forChild(),
    ],
    exports:[SurveyBuilderComponent],
})
export class SurveyBuilderInternalModule {
    
}
