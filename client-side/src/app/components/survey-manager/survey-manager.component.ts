import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
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

    get activeFromDate() {
        if (this.surveyEditor && this.surveyEditor.activeDateRange) {
            return this.surveyEditor.activeDateRange.from ? this.surveyEditor.activeDateRange.from : null;
        } else {
            return null;
        }
    }

    get activeToDate() {
        if (this.surveyEditor && this.surveyEditor.activeDateRange) {
            return this.surveyEditor.activeDateRange.to ? this.surveyEditor.activeDateRange.to : null;
        } else {
            return null;
        }
    }

    showEditor = true;
    screenSize: PepScreenSizeType;
    sectionsQuestionsDropList = [];
    surveyEditor: ISurveyEditor;    
    activeDateRangeOptions: any[] = [{ key: 'Active', value: 'Active date range' }];
    selectedDateRangeValue = '';
    isActiveDateRangeSelected = false;

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
        private _surveysService: SurveysService,
        private _navigationService: NavigationService,
        private _activatedRoute: ActivatedRoute,
        private pepSnackBarService: PepSnackBarService,
        public translate: TranslateService
    ) {
        super();

        this.layoutService.onResize$.pipe(this.destroy$).subscribe(size => {
            this.screenSize = size;
        });

        // For update editor.
        this._surveysService.surveyEditorLoad$.pipe(this.destroy$).subscribe((editor) => {
            this.surveyEditor = editor;
            if (this.isActive && this.surveyEditor.activeDateRange) {
                this.isActiveDateRangeSelected = true;    
                this.selectedDateRangeValue = 'Active'           

                //TODO
            }
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

    onActiveStateChanged(state: any) {
        console.log('onActiveStateChanged', state);        
        this.surveyEditor.active = state.value === 'true';
        if (!this.surveyEditor.active) {
            this.isActiveDateRangeSelected = null;
        }
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onActiveDateRangeChanged(value: string) {        
        this.isActiveDateRangeSelected = value === 'Active';
        if (this.isActiveDateRangeSelected) {
            this.surveyEditor.activeDateRange = {
                from: undefined,
                to: undefined
            }
        }  else {
            this.surveyEditor.activeDateRange = undefined;
            this._surveysService.updateSurveyFromEditor(this.surveyEditor);
        }      
    }

    onActiveDateChanged(property: string, value: string) {        
        this.surveyEditor.activeDateRange[property] = value;
        //in case both dates deleted
        if (!this.surveyEditor.activeDateRange.from && !this.surveyEditor.activeDateRange.to) {
            this.surveyEditor.activeDateRange = undefined;
        }
        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onAddSectionClicked() {
        this._surveysService.addSection();
    }

    onAddQuestionClicked(item) {        
        this._surveysService.addQuestion('short-text');
    }

    /*
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

}