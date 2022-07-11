import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { NavigationService } from '../../services/navigation.service';


@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss']
})
export class ServeyManagerComponent implements OnInit, OnDestroy {
    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
   
    screenSize: PepScreenSizeType;
    showEditor = true;
    sectionsColumnsDropList = [];

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

    private _subscriptions: Subscription[] = [];

    constructor(        
        public layoutService: PepLayoutService,
        private _surveysService: SurveysService,
        private _navigationService: NavigationService,
        public translate: TranslateService
    ) {
        this._subscriptions.push(this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        }));   
    }

    private subscribeEvents() {
        // Get the sections id's into sectionsColumnsDropList for the drag & drop.
        this._subscriptions.push(this._surveysService.sectionsChange$.subscribe(res => {
            // Concat all results into one array.
            this.sectionsColumnsDropList = [].concat(...res.map(section => {
                return section.Key
            }));
        }));
    }

    ngOnInit() {
        console.log('loading ServeyManagerComponent');

        this.subscribeEvents();
    }
   
    

    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {
        this._navigationService.back();
    }

    onAddSectionClicked() {
        this._surveysService.addSection();
    }

    onAddQuestionClicked(item) {
        console.log('onAddQuestionClicked', item);
    }

    ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe);
    }
}