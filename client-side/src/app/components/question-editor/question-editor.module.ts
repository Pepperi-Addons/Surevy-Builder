import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';

import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';


import { QuestionEditorComponent } from './question-editor.component';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        QuestionEditorComponent
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
        TranslateModule.forChild()
    ],
    exports: [QuestionEditorComponent]
})
export class QuestionEditorModule { }
