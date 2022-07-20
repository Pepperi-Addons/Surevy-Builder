import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { TranslateModule } from '@ngx-translate/core';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';

import { PepGroupButtonsModule } from '@pepperi-addons/ngx-lib/group-buttons';

//import { PepIconRegistry, pepIconNumberDecimal, pepIconSystemOk, pepIconSystemSignature, pepIconTimeCal } from '@pepperi-addons/ngx-lib/icon';

import { YesNoQuestionComponent } from './yes-no-question.component';

@NgModule({
    declarations: [
        YesNoQuestionComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PepNgxLibModule,
        PepRemoteLoaderModule,
        PepSizeDetectorModule,        
        PepGroupButtonsModule,
        TranslateModule.forChild(),
    ],
    exports: [YesNoQuestionComponent],
})
export class YesNoQuestionModule { }
