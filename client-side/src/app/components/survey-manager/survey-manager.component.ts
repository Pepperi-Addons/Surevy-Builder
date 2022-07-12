import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { NavigationService } from '../../services/navigation.service';
import { ISurveyEditor } from "../../model/survey.model";
import { PepSnackBarData, PepSnackBarService } from "@pepperi-addons/ngx-lib/snack-bar";


@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss']
})
export class ServeyManagerComponent implements OnInit, OnDestroy {
    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
   
    showEditor = true;
    screenSize: PepScreenSizeType;
    sectionsQuestionsDropList = [];
    surveyEditor: ISurveyEditor;

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
        private _activatedRoute: ActivatedRoute,
        private pepSnackBarService: PepSnackBarService,
        public translate: TranslateService
    ) {
        this._subscriptions.push(this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        }));   
        
        // For update editor.
        this._subscriptions.push(this._surveysService.surveyEditorLoad$.subscribe((editor) => {
            this.surveyEditor = editor;
        }));
    }

    private subscribeEvents() {

        // Get the sections id's into sectionsQuestionsDropList for the drag & drop.
        this._subscriptions.push(this._surveysService.sectionsChange$.subscribe(res => {
            this.sectionsQuestionsDropList = [].concat(...res.map((section, sectionIndex) => {
                return this._surveysService.getSectionContainerKey(sectionIndex.toString())
            }));
        }));
    }

    ngOnInit() {
        console.log('loading ServeyManagerComponent');

        this.subscribeEvents();
    }
   
    ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe);
    }

    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {
        this._navigationService.back(this._activatedRoute);
    }

    onAddSectionClicked() {
        this._surveysService.addSection();
    }

    onAddQuestionClicked(item) {
        // console.log('onAddQuestionClicked', item);
        this._surveysService.addQuestion('short-text');
    }

    togglePreviewMode() {
        this.showEditor = !this.showEditor;
    }

    onSurveyNameChanged(value) {
        this.surveyEditor.name = value;
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onWrapperClicked(event: any) {
        this._surveysService.clearSelected();
    }

    onSaveClick() {
        this._subscriptions.push(this._surveysService.saveCurrentSurvey(this._navigationService.addonUUID).subscribe(res => {
            const data: PepSnackBarData = {
                title: this.translate.instant('MESSAGES.SURVEY_SAVED'),
                content: '',
            }

            const config = this.pepSnackBarService.getSnackBarConfig({
                duration: 5000,
            });

            this.pepSnackBarService.openDefaultSnackBar(data, config);
        }));
    }

    onPublishClick() {
        this._subscriptions.push(this._surveysService.publishCurrentSurvey(this._navigationService.addonUUID).subscribe(res => {
            const data: PepSnackBarData = {
                title: this.translate.instant('MESSAGES.SURVEY_PUBLISHED'),
                content: '',
            }

            const config = this.pepSnackBarService.getSnackBarConfig({
                duration: 5000,
            });

            this.pepSnackBarService.openDefaultSnackBar(data, config);
        }));
    }
}