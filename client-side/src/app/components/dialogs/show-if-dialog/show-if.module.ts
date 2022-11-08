import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';

import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';
import { PepQueryBuilderModule } from '@pepperi-addons/ngx-lib/query-builder';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';

import { ShowIfDialogComponent } from './show-if-dialog.component'



@NgModule({
    declarations: [
        ShowIfDialogComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        PepDialogModule,
        PepQueryBuilderModule,
        PepButtonModule,
        TranslateModule.forChild()
    ],
    exports: [ShowIfDialogComponent]
})
export class ShowIfModule { 
    constructor() { }
}

