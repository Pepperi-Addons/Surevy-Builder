import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';

import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';

import { SelectQuestionComponent } from './select-question/select-question.component';
import { ShortTextQuestionComponent } from './text-question/text-question.component';
import { LongTextQuestionComponent } from './long-text-question/long-text-question.component';
import { YesNoQuestionComponent } from './yes-no-question/yes-no-question.component';
import { DateQuestionComponent } from './date-question/date-question.component';
import { SignatureQuestionComponent } from './signature-question/signature-question.component';
import { ImageQuestionComponent } from './image-question/image-question.component';
import { QuestionBuilderComponent } from './question-builder/question-builder.component';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        SelectQuestionComponent,
        ShortTextQuestionComponent,
        LongTextQuestionComponent,
        YesNoQuestionComponent,
        DateQuestionComponent,
        SignatureQuestionComponent,
        ImageQuestionComponent,
        QuestionBuilderComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        PepTextboxModule,
        TranslateModule.forChild()
    ],
    exports: [QuestionBuilderComponent]
})
export class QuestionModule { }
