import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'survey-builder',
    templateUrl: './survey-builder.component.html',
    styleUrls: ['./survey-builder.component.scss']
})
export class SurveyBuilderComponent implements OnInit {
    
    @Input() hostObject: any;
    
    editMode: boolean = false;

    constructor() {
        //
    }

    ngOnInit() {
        //        
    }
}
