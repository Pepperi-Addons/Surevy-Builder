import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepIconModule, PepIconRegistry, pepIconSystemMove} from '@pepperi-addons/ngx-lib/icon';

import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { SequenceNumberComponent } from './sequence-number.component';
import { MatIconModule } from '@angular/material/icon';

const pepIcons = [
    pepIconSystemMove
];

@NgModule({
    declarations: [
        SequenceNumberComponent
    ],
    imports: [
        CommonModule,
        PepNgxLibModule,
        PepIconModule,
        MatIconModule,
        TranslateModule.forChild(),
    ],
    exports: [SequenceNumberComponent]
})
export class SequenceNumberModule { 

constructor(
    translate: TranslateService,
    private pepIconRegistry: PepIconRegistry,
    private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
