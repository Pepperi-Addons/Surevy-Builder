import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss']
})
export class ServeyManagerComponent implements OnInit {
    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    screenSize: PepScreenSizeType;

    businesUnitOptions: any[] = [{key: '1', value: '1'}, {key: '2', value: '2'}, {key: '3', value: '4'}]; //TEMP
    menuItems = [
        {
            key: `question1`,
            text: 'question 1',
            iconName: 'arrow_left_alt'
        },
        {
            key: `question2`,
            text: 'question 2',
            iconName: 'arrow_left_alt'
        },
        {
            key: `question3`,
            text: 'question 3',
            iconName: 'arrow_left_alt'
        },
    ] //TEMP

    constructor(        
        public layoutService: PepLayoutService,
        public translate: TranslateService
    ) {
        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });        
    }

    ngOnInit() {
        console.log('loading ServeyManagerComponent');
    }
   

    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {

    }

    onAddSectionClicked() {
        
    }

    onAddQuestionClicked(item) {
        console.log('onAddQuestionClicked', item);
    }
}