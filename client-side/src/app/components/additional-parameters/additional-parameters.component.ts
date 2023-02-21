import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import {KeyValue} from '@angular/common';
import { AdditionalField } from 'src/app/model/survey.model';
import { SurveysService } from 'src/app/services/surveys.service';

@Component({
    selector: 'survey-additional-parameters',
    templateUrl: './additional-parameters.component.html',
    styleUrls: ['./additional-parameters.component.scss', './additional-parameters.component.theme.scss']
})
export class AdditionalParametersComponent implements OnInit, AfterViewInit {
    @Input() disabled: boolean = false;
    // @Input() additionalFields = new Map<string, AdditionalField>();
    @Input() additionalFields: Record<string,AdditionalField> = {}
    @Input() additionalFieldsValues: Record<string,string> = {}

    @Output() additionalFieldsChanged: EventEmitter<any> = new EventEmitter();

    //Original property order
    originalOrder = (a: KeyValue<string,object>, b: KeyValue<string,object>): number => {
        return 0;
    }

    constructor(
        private surveysService: SurveysService
    ) { 
    }
    
    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    onSectionEditorFieldChanged(key,value) {
        if (this.additionalFieldsValues === null) {
            this.additionalFieldsValues = {};
        }

        this.additionalFieldsValues[key] = value;
        this.additionalFieldsChanged.emit(this.additionalFieldsValues);
    }

   


}
