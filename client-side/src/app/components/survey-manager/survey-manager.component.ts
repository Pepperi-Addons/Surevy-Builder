import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PepLayoutService, PepScreenSizeType, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { NavigationService } from '../../services/navigation.service';
import { ISurveyEditor } from "../../model/survey.model";
import { DestoyerDirective } from '../../model/destroyer';
import { PepSnackBarData, PepSnackBarService } from "@pepperi-addons/ngx-lib/snack-bar";


@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss']
})
export class ServeyManagerComponent extends DestoyerDirective implements OnInit, OnDestroy {
    get isActive() {
        if (this.surveyEditor) {
            return this.surveyEditor.active !== undefined ? this.surveyEditor.active : true;
        } else {
            return null;
        }
    }

    get isActiveDateRangeSelected() {
        return this.isActive && this.surveyEditor && this.surveyEditor.activeDateRange;
    }

    get activeFromDate() {
        return this.isActive && this.surveyEditor?.activeDateRange?.from ? this._utilitiesService.stringifyDate(this.surveyEditor.activeDateRange.from) : null;
    }

    get activeToDate() {
        return this.isActive && this.surveyEditor?.activeDateRange?.to ? this._utilitiesService.stringifyDate(this.surveyEditor.activeDateRange.to) : null;
    }

    showEditor = true;
    screenSize: PepScreenSizeType;
    sectionsQuestionsDropList = [];
    surveyEditor: ISurveyEditor;    
    minDateValue: string = null;
    maxDateValue: string = null;
/*
    menuItems = [
        {
            key: `short-text`,
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
    ] */


    constructor(
        public layoutService: PepLayoutService,
        private _surveysService: SurveysService,
        private _navigationService: NavigationService,
        private _activatedRoute: ActivatedRoute,
        private pepSnackBarService: PepSnackBarService,
        private _utilitiesService: PepUtilitiesService,
        public translate: TranslateService
    ) {
        super();

        this.layoutService.onResize$.pipe(this.destroy$).subscribe(size => {
            this.screenSize = size;
        });

        // For update editor.
        this._surveysService.surveyEditorLoad$.pipe(this.destroy$).subscribe((editor) => {
            this.surveyEditor = editor;
            this.minDateValue = null;
            this.maxDateValue = null;            
        });

        this._surveysService.sectionsChange$.pipe(this.destroy$).subscribe(res => {
            this.sectionsQuestionsDropList = [].concat(...res.map((section, sectionIndex) => {
                return this._surveysService.getSectionContainerKey(sectionIndex.toString())
            }));
        });
    }



    ngOnInit() {
        console.log('loading ServeyManagerComponent');
    }

    togglePreviewMode() {
        this.showEditor = !this.showEditor;
    }

    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {
        this._navigationService.back(this._activatedRoute);
    }

    onSurveyPropertyChanged(property: string, value: string | boolean) {
        this.surveyEditor[property] = value;
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onActiveStateChanged(isActive: any) {        
        this.surveyEditor.active = isActive;
        if (!isActive) {
            this.surveyEditor.activeDateRange = undefined;
            this.minDateValue = null;
            this.maxDateValue = null;               
        }
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onActiveFromDateChanged(value: string) {        
        if (value) {
            if (!this.surveyEditor.activeDateRange) {
                this.surveyEditor.activeDateRange = {
                    from: undefined,
                    to: undefined
                }
            }
            this.surveyEditor.activeDateRange.from = new Date(value);
            this.minDateValue = value;
        } else {
            this.minDateValue = null;    
            if (this.surveyEditor.activeDateRange.to) {
                this.surveyEditor.activeDateRange.from = undefined;
            } else {
                this.surveyEditor.activeDateRange = undefined;   
            }
        }        
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onActiveToDateChanged(value: string) {
        if (value) {
            if (!this.surveyEditor.activeDateRange) {
                this.surveyEditor.activeDateRange = {
                    from: undefined,
                    to: undefined
                }
            }
            this.surveyEditor.activeDateRange.to = new Date(value);
            this.maxDateValue = value;
        } else {
            this.maxDateValue = null;  
            if (this.surveyEditor.activeDateRange.from) {
                this.surveyEditor.activeDateRange.to = undefined;
            } else {                
                this.surveyEditor.activeDateRange = undefined;  
            }
        }        
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }
    
    onAddSectionClicked() {
        this._surveysService.addSection();
    }

    /*
    onAddQuestionClicked(item) {
        console.log('onAddQuestionClicked', item);
        this._surveysService.addQuestion('short-text');
    }

    
   onSurveyNameChanged(value) {
       this.surveyEditor.name = value;
       this._surveysService.updateSurveyFromEditor(this.surveyEditor);
   } */

    onWrapperClicked(event: any) {
        this._surveysService.clearSelected();
    }

    onSaveClick() {
        this._surveysService.saveCurrentSurvey(this._navigationService.addonUUID).pipe(this.destroy$).subscribe(res => {
            const data: PepSnackBarData = {
                title: this.translate.instant('MESSAGES.SURVEY_SAVED'),
                content: '',
            }

            const config = this.pepSnackBarService.getSnackBarConfig({
                duration: 5000,
            });

            this.pepSnackBarService.openDefaultSnackBar(data, config);
        });
    }

    onPublishClick() {
        this._surveysService.publishCurrentSurvey(this._navigationService.addonUUID).pipe(this.destroy$).subscribe(res => {
            const data: PepSnackBarData = {
                title: this.translate.instant('MESSAGES.SURVEY_PUBLISHED'),
                content: '',
            }

            const config = this.pepSnackBarService.getSnackBarConfig({
                duration: 5000,
            });

            this.pepSnackBarService.openDefaultSnackBar(data, config);
        });
    }

    onQuestionDuplicateClick(event) {

    }

    onQuestionDeleteClick(event) { }   

}