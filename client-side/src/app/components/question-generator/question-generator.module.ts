import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';

// import { SelectQuestionComponent } from '../question-tmp/select-question/select-question.component';
// import { ShortTextQuestionComponent } from '../question-tmp/text-question/text-question.component';
// import { LongTextQuestionComponent } from '../question-tmp/long-text-question/long-text-question.component';
// import { YesNoQuestionComponent } from '../question-tmp/yes-no-question/yes-no-question.component';
// import { DateQuestionComponent } from '../question-tmp/date-question/date-question.component';
// import { SignatureQuestionComponent } from '../question-tmp/signature-question/signature-question.component';
// import { ImageQuestionComponent } from '../question-tmp/image-question/image-question.component';

import { QuestionGeneratorComponent } from './question-generator.component';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { TranslateModule } from '@ngx-translate/core';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';

@NgModule({
    declarations: [
        // SelectQuestionComponent,
        // ShortTextQuestionComponent,
        // LongTextQuestionComponent,
        // YesNoQuestionComponent,
        // DateQuestionComponent,
        // SignatureQuestionComponent,
        // ImageQuestionComponent,
        QuestionGeneratorComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        PepTextboxModule,
        PepFieldTitleModule,
        TranslateModule.forChild()
    ],
    exports: [QuestionGeneratorComponent]
})
export class QuestionGeneratorModule { }
