import { Component, OnInit, OnDestroy } from "@angular/core";
import { PepAddonService, PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { ValidationService } from '../../services/validation.service';
import { NavigationService } from '../../services/navigation.service';
import { ISurveyEditor } from "../../model/survey.model";
import { SurveyTemplateQuestionType } from "shared";
import { DestoyerDirective } from '../../model/destroyer';
import { PepSnackBarData, PepSnackBarService } from "@pepperi-addons/ngx-lib/snack-bar";


@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss', './survey-manager.component.theme.scss']
})
export class ServeyManagerComponent extends DestoyerDirective implements OnInit, OnDestroy {
    get isActive() {
        if (this.surveyEditor) {            
            return this.surveyEditor.active !== undefined ? this.surveyEditor.active : false;
        } else {
            return null;
        }
    }

    get isActiveDateRangeSelected() {
        return this.isActive && this.surveyEditor && this.surveyEditor.activeDateRange;
    }

    get activeFromDate() {
        return this.isActive && this.surveyEditor?.activeDateRange?.from ? this.surveyEditor.activeDateRange.from : null;
    }

    get activeToDate() {
        return this.isActive && this.surveyEditor?.activeDateRange?.to ? this.surveyEditor.activeDateRange.to : null;
    }

    showEditor = true;
    screenSize: PepScreenSizeType;
    sectionsQuestionsDropList = [];
    surveyEditor: ISurveyEditor;
    minDateValue: string = null;
    maxDateValue: string = null;    

    constructor(
        public layoutService: PepLayoutService,
        private pepAddonService: PepAddonService,
        private _surveysService: SurveysService,
        private validationService: ValidationService,
        private _navigationService: NavigationService,
        private pepSnackBarService: PepSnackBarService,        
        public translate: TranslateService
    ) {
        super();

        this.pepAddonService.setShellRouterData({ showSidebar: false, addPadding: false});

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

    onSidebarEndStateChange(state) {
        console.log('onSidebarEndStateChange', state);
    }

    onNavigateBackFromEditor() {
        this._navigationService.back();
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
            this.surveyEditor.activeDateRange.from = value;
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
            this.surveyEditor.activeDateRange.to = value;
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

    onQuestionTypeClick(type: SurveyTemplateQuestionType) {
        this._surveysService.addQuestion(type);
    }

    /*    
   onSurveyNameChanged(value) {
       this.surveyEditor.name = value;
       this._surveysService.updateSurveyFromEditor(this.surveyEditor);
   } */

    onWrapperClicked(event: any) {
        //this._surveysService.clearSelected();
    }

    onSaveClicked() {
        //validate mandatory fields
        if(this.validationService.validateSurvey()){
            this._surveysService.saveCurrentSurvey(this._navigationService.addonUUID, true).pipe(this.destroy$).subscribe(res => {
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
        else{
            //validation failed 
            this.validationService.showValidationInfo();
        }
    }

    onPublishClicked() {
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