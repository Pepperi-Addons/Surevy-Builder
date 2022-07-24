import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';
import { SectionComponent } from './section.component';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionGeneratorModule } from '../question-generator/question-generator.module';
import { QuestionMenuModule } from '../question-menu/question-menu.module';
import { PepSeparatorModule } from '@pepperi-addons/ngx-lib/separator';
import { SequenceNumberModule } from '../sequence-number/sequence-number.module';

@NgModule({
    declarations: [SectionComponent],
    imports: [
        CommonModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        PepSeparatorModule,
        PepFieldTitleModule,
        QuestionGeneratorModule,
        QuestionMenuModule,
        SequenceNumberModule,
        TranslateModule.forChild()
    ],
    exports: [SectionComponent]
})
export class SectionModule { }
