import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageConfiguration, PageConfigurationParameterString } from '@pepperi-addons/papi-sdk';

@Component({
    // selector: 'survey-block-editor',
    templateUrl: './block-editor.component.html',
    styleUrls: ['./block-editor.component.scss']
})
export class BlockEditorComponent implements OnInit {
    @Input()
    set hostObject(value: any) {
        this.initPageConfiguration(value?.pageConfiguration);
    }

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    private _pageConfiguration: PageConfiguration;
    private defaultPageConfiguration: PageConfiguration = { "Parameters": []};
    private defaultSurveyKeyParameter: PageConfigurationParameterString = { "Key": "survey_key", "Type": "String", "Consume": true, "Produce": false };

    constructor(private translate: TranslateService) {
    }

    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    private setConsumerParams(): void {
        // Add the default survey_key parameter if not exists.
        if (!this._pageConfiguration.Parameters.some(param => param.Key === this.defaultSurveyKeyParameter.Key)) {
            this._pageConfiguration.Parameters.push(this.defaultSurveyKeyParameter);

            this.hostEvents.emit({
                action: 'set-page-configuration',
                pageConfiguration: this._pageConfiguration
            });
        }
    }

    ngOnInit(): void {
        this.setConsumerParams();
    }

    ngOnChanges(e: any): void {
    }
}
