import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { TranslateModule } from '@ngx-translate/core';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';

import { PepIconRegistry, pepIconNumberDecimal, pepIconSystemOk, pepIconSystemSignature, pepIconTimeCal } from '@pepperi-addons/ngx-lib/icon';

import { QuestionMenuComponent } from './question-menu.component';

const pepIcons = [
    pepIconNumberDecimal,
    pepIconSystemOk,
    pepIconSystemSignature,
    pepIconTimeCal
];

@NgModule({
    declarations: [
        QuestionMenuComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PepNgxLibModule,
        PepRemoteLoaderModule,
        PepSizeDetectorModule,
        PepMenuModule,
        TranslateModule.forChild(),
    ],
    exports: [QuestionMenuComponent],
})
export class QuestionMenuModule {
    constructor(private pepIconRegistry: PepIconRegistry) {
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
