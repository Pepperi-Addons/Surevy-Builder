import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';
import { AdditionalParametersComponent } from './additional-parameters.component';


@NgModule({
    declarations: [
        AdditionalParametersComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PepRemoteLoaderModule,
        PepTextboxModule,
        PepCheckboxModule,
        PepFieldTitleModule,
        TranslateModule.forChild()
    ],
    exports: [AdditionalParametersComponent]
})
export class AdditionalParametersModule { 
    constructor() {}
}

