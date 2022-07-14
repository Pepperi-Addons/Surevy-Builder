import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PepAddonService } from '@pepperi-addons/ngx-lib';

import { TranslateModule, TranslateLoader, TranslateStore } from '@ngx-translate/core';
import { AppRoutingModule } from './app.routes';

import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';

// import { SurveysManagerModule } from './components/surveys-manager/surveys-manager.module';
// import { SurveyManagerModule } from './components/survey-manager/survey-manager.module';

import { AppComponent } from './app.component';
import { config } from './components/addon.config';

@NgModule({
    declarations: [
        AppComponent    
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        // SurveysManagerModule,
        // SurveyManagerModule,
        AppRoutingModule,    
        PepMenuModule,   
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(addonService, ['ngx-lib', 'ngx-composite-lib'], config.AddonUUID),
                deps: [PepAddonService]
            }
        })
    ],
    providers: [
        TranslateStore,
        // When loading this module from route we need to add this here (because only this module is loading).
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}