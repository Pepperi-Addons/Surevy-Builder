import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings.routes';
import { SettingsComponent } from './settings.component';


// import { TranslateLoader, TranslateModule, TranslateStore } from '@ngx-translate/core';
// import { PepAddonService } from '@pepperi-addons/ngx-lib';
// import { config } from '../addon.config';

@NgModule({
    declarations: [
        SettingsComponent
    ],
    imports: [
        CommonModule,
        SettingsRoutingModule,
        // TranslateModule.forChild({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (addonService: PepAddonService) => 
        //             PepAddonService.createMultiTranslateLoader(addonService, ['ngx-lib', 'ngx-composite-lib'], config.AddonUUID),
        //         deps: [PepAddonService]
        //     }, isolate: false
        // }),
    ],
    // providers: [
    //     TranslateStore,
    //     // When loading this module from route we need to add this here (because only this module is loading).
    // ]
})
export class SettingsModule {
}
