import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { TranslateModule } from '@ngx-translate/core';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';

import {pepIconSystemSelect, PepIconRegistry, pepIconNumberDecimal, pepIconSystemOk, pepIconSystemSignature, pepIconSystemImage, 
    pepIconTimeCal, pepIconTextShortText, pepIconTextLongText, pepIconSystemRadioBtn, pepIconNumberNumber, 
    pepIconNumberPercent, pepIconNumberCoins, pepIconSystemBoolean, pepIconTimeDatetime } from '@pepperi-addons/ngx-lib/icon';

import { QuestionMenuComponent } from './question-menu.component';

const pepIcons = [
    pepIconNumberDecimal,
    pepIconSystemOk,
    pepIconSystemSignature,
    pepIconSystemImage,
    pepIconSystemSelect,
    pepIconTextShortText,
    pepIconTextLongText,
    pepIconSystemRadioBtn,
    pepIconNumberNumber,
    pepIconNumberPercent,
    pepIconNumberCoins,
    pepIconSystemBoolean,
    pepIconTimeCal,
    pepIconTimeDatetime
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
    exports: [QuestionMenuComponent]
})
export class QuestionMenuModule {
    constructor(private pepIconRegistry: PepIconRegistry) {
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}

