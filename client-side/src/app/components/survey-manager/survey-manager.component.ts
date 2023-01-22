import { Component, OnInit, OnDestroy, ViewContainerRef } from "@angular/core";
import { PepAddonService, PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { ValidationService } from '../../services/validation.service';
import { NavigationService } from '../../services/navigation.service';
import { AdditionalField, ISurveyEditor } from "../../model/survey.model";
import { SurveyTemplate, SurveyTemplateQuestionType } from "shared";
import { DestoyerDirective } from '../../model/destroyer';
import { PepSnackBarData, PepSnackBarService } from "@pepperi-addons/ngx-lib/snack-bar";
import { DIMXService } from "../../../app/services/dimx.service";
import { IPepMenuItemClickEvent, PepMenuItem } from "@pepperi-addons/ngx-lib/menu";

@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss', './survey-manager.component.theme.scss'],
    providers: [DIMXService]
})
export class ServeyManagerComponent extends DestoyerDirective implements OnInit, OnDestroy {
    private readonly IMPORT_KEY = 'import';
    private readonly EXPORT_KEY = 'export';

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

    additionalFields: Record<string,AdditionalField>;
    menuItems: Array<PepMenuItem>;
    currentSurveyTemplate: SurveyTemplate;

    constructor(
        public layoutService: PepLayoutService,
        private pepAddonService: PepAddonService,
        private _surveysService: SurveysService,
        private validationService: ValidationService,
        private _navigationService: NavigationService,
        private pepSnackBarService: PepSnackBarService,        
        private viewContainerRef: ViewContainerRef,
        private dimxService: DIMXService,
        public translate: TranslateService
    ) {
        super();

        this.pepAddonService.setShellRouterData({ showSidebar: false, addPadding: false});
        this.dimxService.register(this.viewContainerRef, this.onDIMXProcessDone.bind(this));
    }

    private subscribeEvents() {

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

        this._surveysService.additionalFieldsChange$.subscribe((addFields: any) => {
            this.additionalFields = addFields || [];
        });

        // For update the survey template data
        this._surveysService.surveyDataChange$.subscribe((surveyTemplate: SurveyTemplate) => {
            if (surveyTemplate) {
                this.currentSurveyTemplate = surveyTemplate;
            }
        });
    }

    ngOnInit() {
        console.log('loading ServeyManagerComponent');

        this.menuItems = [
            // TODO: { key: this.IMPORT_KEY, text: this.translate.instant('ACTIONS.IMPORT') },
            { key: this.EXPORT_KEY, text: this.translate.instant('ACTIONS.EXPORT') }
        ];

        this.subscribeEvents();
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

    onMenuItemClick(action: IPepMenuItemClickEvent) {
        // Import survey template
        if (action.source.key === this.IMPORT_KEY) { 
            // TODO: Should work only for the same survey template Key (override this survey template).
            // this.dimxService.import();
        } else if (action.source.key === this.EXPORT_KEY) { // Export survey template
            this.dimxService.export(this.currentSurveyTemplate.Key, this.currentSurveyTemplate.Name);
        }
    }

    onSaveClicked() {
        //validate mandatory fields
        if(this.validationService.validateSurvey()){
            this._surveysService.saveCurrentSurveyTemplate(this._navigationService.addonUUID, true).pipe(this.destroy$).subscribe(res => {
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
        this._surveysService.publishCurrentSurveyTemplate(this._navigationService.addonUUID).pipe(this.destroy$).subscribe(res => {
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

    onDIMXProcessDone(dimxEvent: any) {
        console.log(`DIMXProcessDone: ${JSON.stringify(dimxEvent)}`);
    }
}