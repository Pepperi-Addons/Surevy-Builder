import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';

import { SectionComponent } from './section.component';

@NgModule({
    declarations: [SectionComponent],
    imports: [
        CommonModule,
        DragDropModule,
        PepButtonModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        // TranslateModule.forChild()
    ],
    exports: [SectionComponent]
})
export class SectionModule { }
