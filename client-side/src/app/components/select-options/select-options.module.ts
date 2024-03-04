import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';
import { QuestionSelectOptionsComponent } from './select-options.component';
import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { pepIconArrowDown, pepIconArrowUp, PepIconRegistry, pepIconSystemFilter2} from '@pepperi-addons/ngx-lib/icon';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepGroupButtonsSettingsModule } from '@pepperi-addons/ngx-composite-lib/group-buttons-settings';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';

const pepIcons = [
    pepIconSystemFilter2,
    pepIconArrowDown, 
    pepIconArrowUp
];

@NgModule({
    declarations: [
        QuestionSelectOptionsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        PepTextboxModule,
        PepTextareaModule,
        PepCheckboxModule,
        PepGroupButtonsSettingsModule,
        PepMenuModule,
        TranslateModule.forChild()
    ],
    exports: [QuestionSelectOptionsComponent]
})
export class QuestionSelectOptionsModule { 

constructor(
    translate: TranslateService,
    private pepIconRegistry: PepIconRegistry,
    private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
