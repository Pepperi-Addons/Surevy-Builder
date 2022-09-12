import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PepAddonService } from '@pepperi-addons/ngx-lib';

import { TranslateModule, TranslateLoader, TranslateStore, TranslateService } from '@ngx-translate/core';
import { AppRoutingModule } from './app.routes';

import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';

import { SurveysManagerModule } from './components/surveys-manager/surveys-manager.module';
import { SurveyManagerModule } from './components/survey-manager/survey-manager.module';
import { ShowIfModule } from './components/dialogs/show-if-dialog/show-if.module';

import { AppComponent } from './app.component';
import { config } from './components/addon.config';
import { SettingsComponent, SettingsModule } from './components/settings';

import { SurveyBuilderComponent } from './components/survey-builder';

@NgModule({
    declarations: [
        AppComponent        
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SettingsModule,
        SurveysManagerModule,
        SurveyManagerModule,
        ShowIfModule,
        AppRoutingModule,    
        PepMenuModule,           
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }
        })
    ],
    providers: [
        TranslateStore,
        // When loading this module from route we need to add this here (because only this module is loading).
    ],
    bootstrap: [
        // AppComponent
    ]
})
export class AppModule implements DoBootstrap {
    constructor(
        private injector: Injector,
        translate: TranslateService,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
    }

    ngDoBootstrap() {
        this.pepAddonService.defineCustomElement(`settings-element-${config.AddonUUID}`, SettingsComponent, this.injector);
        this.pepAddonService.defineCustomElement(`survey-element-${config.AddonUUID}`, SurveyBuilderComponent, this.injector);
    }
}