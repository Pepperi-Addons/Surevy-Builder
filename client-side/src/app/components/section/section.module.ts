import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateStore } from '@ngx-translate/core';
import { PepAddonService, PepFileService, PepHttpService } from '@pepperi-addons/ngx-lib';
import { PepDraggableItemsModule } from '@pepperi-addons/ngx-lib/draggable-items';

import { SectionComponent } from './section.component';

@NgModule({
    declarations: [SectionComponent],
    imports: [
        CommonModule,
        DragDropModule,
        PepButtonModule,
        // ToolbarModule,
        PepRemoteLoaderModule,
        PepDraggableItemsModule,
        // TranslateModule.forChild()
        // ({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (addonService: PepAddonService) => 
        //             PepAddonService.createMultiTranslateLoader(addonService, ['ngx-lib', 'ngx-composite-lib']),
        //         deps: [PepAddonService]
        //     }, isolate: false
        // })
    ],
    exports: [SectionComponent]
})
export class SectionModule { }
