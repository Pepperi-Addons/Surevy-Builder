import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';
import { SelectedItemEditorComponent } from './selected-item-editor.component';
import { QuestionSelectOptionsModule } from '../select-options/select-options.module';
import { PepNgxLibModule, PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepSliderModule } from '@pepperi-addons/ngx-lib/slider';
import { PepIconRegistry, pepIconSystemFilter2, pepIconSystemCopy} from '@pepperi-addons/ngx-lib/icon';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';

import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepSideBarModule } from '@pepperi-addons/ngx-lib/side-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';
import { PepQueryBuilderModule } from '@pepperi-addons/ngx-lib/query-builder';

const pepIcons = [
    pepIconSystemFilter2,
    pepIconSystemCopy
];

@NgModule({
    declarations: [
        SelectedItemEditorComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        MatDialogModule,
        PepDialogModule,
        PepQueryBuilderModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        QuestionSelectOptionsModule,
        PepTextboxModule,
        PepSliderModule,
        PepTextareaModule,
        PepCheckboxModule,
        PepSideBarModule,
        TranslateModule.forChild(),
    ],
    exports: [SelectedItemEditorComponent]
})
export class SelectedItemEditorModule { 

constructor(
    translate: TranslateService,
    private pepIconRegistry: PepIconRegistry,
    private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
