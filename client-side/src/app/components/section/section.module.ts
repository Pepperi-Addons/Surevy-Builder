import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';

import { SectionComponent } from './section.component';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionGeneratorModule } from '../question-generator/question-generator.module';
import { QuestionMenuModule } from '../question-menu/question-menu.module';
import { PepSeparatorModule } from '@pepperi-addons/ngx-lib/separator';

@NgModule({
    declarations: [SectionComponent],
    imports: [
        CommonModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        PepSeparatorModule,
        QuestionGeneratorModule,
        QuestionMenuModule,
        TranslateModule.forChild()
    ],
    exports: [SectionComponent]
})
export class SectionModule { }
