import { CdkDragDrop, CdkDragEnd, CdkDragStart, copyArrayItem, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Injectable, ɵɵresolveBody } from "@angular/core";
import { Params } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PepGuid, PepHttpService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { Observable, BehaviorSubject, from } from 'rxjs';
import { NavigationService } from "./navigation.service";
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ISurveyEditor, SurveyObjValidator } from "../model/survey.model";
import { SurveyTemplateRowProjection, SurveyTemplate, SurveyTemplateSection, ISurveyTemplateBuilderData, SurveyClientEventResult, SurveyTemplateClientEventResult,
    SurveyTemplateQuestion, SurveyTemplateQuestionType, CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD, CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHAGE, CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE,
    SurveyStatusType, CLIENT_ACTION_ON_CLIENT_SURVEY_UNLOAD, SURVEY_TEMPLATES_TABLE_NAME, CLIENT_ACTION_ON_CLIENT_SURVEY_TEMPLATE_LOAD } from 'shared';
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { MatDialogRef } from "@angular/material/dialog";
    
import * as _ from 'lodash';
@Injectable({
    providedIn: 'root',
})
export class SurveysService {
    private _surveyModelKey = '';
    private _processingSurvey = false;
    private readonly _maxMilisecondsToWait = 3000;

    private _defaultSectionTitle = '';
    set defaultSectionTitle(value: string) {
        if (this._defaultSectionTitle === '') {
            this._defaultSectionTitle = value;
        }
    }

    // This subject is for is grabbing mode.
    private _isGrabbingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    get isGrabbingChange$(): Observable<boolean> {
        return this._isGrabbingSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for load the current survey editor (Usage only in edit mode).
    private _surveyEditorSubject: BehaviorSubject<ISurveyEditor> = new BehaviorSubject<ISurveyEditor>(null);
    get surveyEditorLoad$(): Observable<ISurveyEditor> {
        return this._surveyEditorSubject.asObservable().pipe(distinctUntilChanged((prevSurveyEditor, nextSurveyEditor) => prevSurveyEditor?.key === nextSurveyEditor?.key));
    }

    // This is the sections subject
    private _sectionsSubject: BehaviorSubject<SurveyTemplateSection[]> = new BehaviorSubject<SurveyTemplateSection[]>([]);
    get sectionsChange$(): Observable<SurveyTemplateSection[]> {
        return this._sectionsSubject.asObservable();
    }

    // This is the selected section index
    private _selectedSectionIndex = -1;
    get selectedSectionIndex(): number {
        return this._selectedSectionIndex;
    }
    // This is the selected section subject
    private _selectedSectionChangeSubject: BehaviorSubject<SurveyTemplateSection> = new BehaviorSubject<SurveyTemplateSection>(null);
    get selectedSectionChange$(): Observable<SurveyTemplateSection> {
        return this._selectedSectionChangeSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This is the selected question index
    private _selectedQuestionIndex = -1;
    get selectedQuestionIndex(): number {
        return this._selectedQuestionIndex;
    }
    // This is the selected question subject
    private _selectedQuestionChangeSubject: BehaviorSubject<SurveyTemplateQuestion> = new BehaviorSubject<SurveyTemplateQuestion>(null);
    get selectedQuestionChange$(): Observable<SurveyTemplateQuestion> {
        return this._selectedQuestionChangeSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for survey change.
    private _surveySubject: BehaviorSubject<SurveyTemplate> = new BehaviorSubject<SurveyTemplate>(null);
    get surveyLoad$(): Observable<SurveyTemplate> {
        return this._surveySubject.asObservable().pipe(distinctUntilChanged((prevSurvey, nextSurvey) => prevSurvey?.Key === nextSurvey?.Key));
    }
    get surveyDataChange$(): Observable<SurveyTemplate> {
        return this._surveySubject.asObservable().pipe(filter(survey => !!survey));
    }

    // This is the additional fields subject
    private _additionalFieldsSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
    get additionalFieldsChange$(): Observable<any> {
        return this._additionalFieldsSubject.asObservable();
    }

    // // This subject is for edit mode when question is dragging now or not.
    // private _draggingQuestionKey: BehaviorSubject<string> = new BehaviorSubject('');
    // get draggingQuestionKey(): Observable<string> {
    //     return this._draggingQuestionKey.asObservable().pipe(distinctUntilChanged());
    // }

    // This subject is for edit mode when section is dragging now or not.
    private _draggingSectionIndex: BehaviorSubject<string> = new BehaviorSubject('');
    get draggingSectionIndex(): Observable<string> {
        return this._draggingSectionIndex.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for lock or unlock the screen (Usage only in edit mode).
    private _lockScreenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    get lockScreenChange$(): Observable<boolean> {
        return this._lockScreenSubject.asObservable().pipe(distinctUntilChanged());
    }

    get selectedItemType(): 'section' | 'question' | 'none' {
        return this._selectedQuestionIndex > -1 ? 'question' : (this._selectedSectionIndex > -1 ? 'section' : 'none');
    }

    constructor(
        private translate: TranslateService,
        private sessionService: PepSessionService,
        private httpService: PepHttpService,
        private navigationService: NavigationService,
        private dialog: PepDialogService,
    ) {

        this.surveyLoad$.subscribe((survey: SurveyTemplate) => {
            this.loadSurveyEditor(survey);
            this.notifySectionsChange(survey?.Sections ?? []);
            this.setSelected(false, 0);
            // this.loadQuestions(survey);
        });
    }    

    private  getNewSection() {
        
        let section: SurveyTemplateSection = null;

        this.translate.get('SURVEY_MANAGER.SECTION_TITLE_PLACEHOLDER').subscribe((res: string) => {
            section = {
                Key: PepGuid.newGuid(),
                Title: res,
                Questions: []
            };
        });

        return section;

    }

    private loadSurveyEditor(survey: SurveyTemplate) {
        if (survey) {
            const surveyEditor: ISurveyEditor = {
                key: survey?.Key,
                name: survey?.Name,
                description: survey?.Description,
                active: survey?.Active,
            };

            if (survey?.ActiveDateRange) {
                surveyEditor.activeDateRange = {
                    from: survey.ActiveDateRange.From,
                    to: survey.ActiveDateRange.To,
                }
            }

            this._surveyEditorSubject.next(surveyEditor);
        } else {
            this._surveyEditorSubject.next(null);
        }
    }

    private notifySurveyChange(survey: SurveyTemplate) {
        this._surveySubject.next(survey);
    }

    private notifySectionsChange(sections: SurveyTemplateSection[], addDefualtSection = true) {
        const survey = this._surveySubject.getValue();

        if (survey) {
            survey.Sections = sections;
            
            if (addDefualtSection && sections.length === 0) {
                const section = this.getNewSection();
                survey.Sections.push(section);
            }

            this._sectionsSubject.next(survey.Sections);
            this.notifySurveyChange(survey);
        }
    }

    private notifySelectedSectionChange(section: SurveyTemplateSection, index: number) {
        this._selectedSectionIndex = index;
        this._selectedSectionChangeSubject.next(section);
    }

    private notifySelectedQuestionChange(question: SurveyTemplateQuestion, index: number) {
        this._selectedQuestionIndex = index;
        this._selectedQuestionChangeSubject.next(question);
    }

    private notifyAdditionalFieldsChange(additionalFields: any) {
        this._additionalFieldsSubject.next(additionalFields);
    }

    private getBaseUrl(addonUUID: string): string {
        // For devServer run server on localhost.
        if (this.navigationService.devServer) {
            return `http://localhost:4500/internal_api`;
        } else {
            const baseUrl = this.sessionService.getPapiBaseUrl();
            return `${baseUrl}/addons/api/${addonUUID}/internal_api`;
        }
    }

    private changeCursorOnDragStart() {
        document.body.classList.add('inheritCursors');
        document.body.style.cursor = 'grabbing';
        this._isGrabbingSubject.next(true);
    }

    private changeCursorOnDragEnd() {
        document.body.classList.remove('inheritCursors');
        document.body.style.cursor = 'unset';
        this._isGrabbingSubject.next(false);
    }

    private getSectionByIndex(sectionIndex: string): SurveyTemplateSection {
        let currentSection = null;

        // Get the section and column array by the pattern of the section column key.
        const sectionPatternSeparator = this.getSectionContainerKey();
        const sectionArr = sectionIndex.split(sectionPatternSeparator);

        if (sectionArr.length === 2) {
            const sections = this._sectionsSubject.getValue();

            // Get the section by the section index.
            currentSection = sections[sectionArr[1]];
        }

        return currentSection;
    }

    private duplicateSelectedSection() {
        if (this._selectedSectionIndex > -1) {
            const sections = this._sectionsSubject.getValue();
            const duplicated: SurveyTemplateSection = _.cloneDeep(sections[this._selectedSectionIndex]);
            duplicated.Key = PepGuid.newGuid();
            const newSelectedIndex = this._selectedSectionIndex > -1 && this._selectedSectionIndex < sections.length ?
                this._selectedSectionIndex + 1 : sections.length;
            sections.splice(newSelectedIndex, 0, duplicated);
            this.notifySectionsChange(sections);
            this.notifySelectedSectionChange(duplicated, newSelectedIndex);
        }
    }

    private deleteSelectedSection() {
        if (this._selectedSectionIndex > -1) {
            const sections = this._sectionsSubject.getValue();
            if (sections.length > 1 && sections.length > this._selectedSectionIndex) {
                sections.splice(this._selectedSectionIndex, 1);
                this.notifySectionsChange(sections);
                const newSelectedIndex = this._selectedSectionIndex === 0 ? 0 : this._selectedSectionIndex - 1;
                this.notifySelectedSectionChange(sections[newSelectedIndex], newSelectedIndex);
            }
        }
    }

    private duplicateSelectedQuestion() {        
        if (this._selectedSectionIndex > -1 && this._selectedQuestionIndex > -1) {
            const sections = this._sectionsSubject.getValue();
            const currentSection = sections[this._selectedSectionIndex];
            if (currentSection?.Questions?.length > this._selectedQuestionIndex) {
                const duplicated: SurveyTemplateQuestion = _.clone(currentSection.Questions[this._selectedQuestionIndex]);
                duplicated.Key = PepGuid.newGuid();
                const newSelectedIndex = this._selectedQuestionIndex > -1 && this._selectedQuestionIndex < currentSection.Questions.length ?
                    this._selectedQuestionIndex + 1 : currentSection.Questions.length;
                currentSection.Questions.splice(newSelectedIndex, 0, duplicated);
                this.notifySectionsChange(sections);
                this.notifySelectedQuestionChange(duplicated, newSelectedIndex);
            }
        } 
    }

    private deleteSelectedQuestion() {
        if (this._selectedSectionIndex > -1 && this._selectedQuestionIndex > -1) {
            const sections = this._sectionsSubject.getValue();
            const currentSection = sections[this._selectedSectionIndex];
            if (currentSection?.Questions?.length > this._selectedQuestionIndex) {
                const newSelectedIndex = this._selectedQuestionIndex > -1 && this._selectedQuestionIndex < currentSection.Questions.length ?
                    (this._selectedQuestionIndex === 0 && currentSection.Questions.length > 1 ? 0 : this._selectedQuestionIndex - 1) : -1;
                currentSection.Questions.splice(this._selectedQuestionIndex, 1);
                this.notifySectionsChange(sections);
                this.notifySelectedQuestionChange(newSelectedIndex > -1 ? currentSection.Questions[newSelectedIndex] : null, newSelectedIndex);
            }
        }
    }

    private getCurrentResourceName() {
        return SURVEY_TEMPLATES_TABLE_NAME;
    }

    private showErrorDialog(err: string = ''): MatDialogRef<any> {
        const title = this.translate.instant('MESSAGES.TITLE_NOTICE');
        const dataMsg = new PepDialogData({title, actionsType: "close", content: err || this.translate.instant('MESSAGES.FAILED_TO_GET_SURVEY_VIEW_ERROR')});

        return this.dialog.openDefaultDialog(dataMsg);
    }

    private async waitWhileProccessing(): Promise<void> {
        const milisecondsToWait = 50;
        let waitingTimes = 0;

        // Wait for delay while this._processingSurvey is true and the time is not pass the _maxMilisecondsToWait.
        while (this._processingSurvey && (waitingTimes * milisecondsToWait < this._maxMilisecondsToWait)) {
            await new Promise((resolve) => setTimeout(resolve, milisecondsToWait));
            waitingTimes++;
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/

    getSurvey(): SurveyTemplate {
        return this._surveySubject.getValue();
    }
    
    getSectionContainerKey(sectionIndex: string = '') {
        return `section_${sectionIndex}`;
    }

    updateSurveyFromEditor(surveyData: ISurveyEditor) {
        console.log('surveyData', surveyData);
        const currentSurvey = this._surveySubject.getValue();

        if (currentSurvey) {
            currentSurvey.Name = surveyData.name;
            currentSurvey.Description = surveyData.description;
            currentSurvey.Active = surveyData.active;

            // Set the active date range.
            if (surveyData.activeDateRange) {
                currentSurvey.ActiveDateRange = {
                    From: surveyData.activeDateRange.from,
                    To: surveyData.activeDateRange.to,
                }
            } else {
                currentSurvey.ActiveDateRange = null;
            }

            this.notifySurveyChange(currentSurvey);
        }
    }

    updateSectionFromEditor(surveySection: SurveyTemplateSection) {
        const sections = this._sectionsSubject.getValue();

        if (this._selectedSectionIndex >= 0 && this._selectedSectionIndex < sections.length) {
            sections[this._selectedSectionIndex] = surveySection;
            this.notifySectionsChange(sections);
        }
    }

    updateQuestionFromEditor(surveyQuestion: SurveyTemplateQuestion) {
        const sections = this._sectionsSubject.getValue();

        if (this._selectedSectionIndex >= 0 && this._selectedSectionIndex < sections.length) {
            const currentSection = sections[this._selectedSectionIndex];

            if (this._selectedQuestionIndex >= 0 && this._selectedQuestionIndex < currentSection.Questions.length) {
                currentSection.Questions[this._selectedQuestionIndex] = surveyQuestion;
                this.notifySectionsChange(sections);
            }
        }
    }

    async setSelected(waitForDelay: boolean, sectionIndex: number, questionIndex: number = -1) {
        if (waitForDelay) {
            // Wait for delay to update properties in the last chosen and not this.
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const sections = this._sectionsSubject.getValue();
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            const section = sections[sectionIndex];
            this.notifySelectedSectionChange(section, sectionIndex);

            const questions = section.Questions;
            if (questionIndex >= 0 && questionIndex < questions.length) {
                const question = questions[questionIndex];
                this.notifySelectedQuestionChange(question, questionIndex);
            } else {
                this.notifySelectedQuestionChange(null, questionIndex);
            }
        } else {
            this.notifySelectedQuestionChange(null, questionIndex);
            this.notifySelectedSectionChange(null, sectionIndex);
        }
    }

    clearSelected() {
        this.setSelected(false, -1);
    }

    addSection(sectionIndex: number = -1, section: SurveyTemplateSection = null) {
        // Create new section
        if (!section) {
            section = this.getNewSection();
        }

        // Get the sections.
        const sections = this._surveySubject.getValue().Sections;

        const newSelectedIndex = sectionIndex > -1 && sectionIndex < sections.length ? sectionIndex :
            (this._selectedSectionIndex > -1 && this._selectedSectionIndex < sections.length ? this._selectedSectionIndex + 1 : sections.length);
        sections.splice(newSelectedIndex, 0, section);

        this.notifySectionsChange(sections);
        this.notifySelectedSectionChange(section, newSelectedIndex);
        this.notifySelectedQuestionChange(null, -1);
    }

    onSectionDropped(event: CdkDragDrop<any[]>) {
        const sections = this._sectionsSubject.getValue();
        moveItemInArray(sections, event.previousIndex, event.currentIndex);
        this.notifySectionsChange(sections);
    }

    onSectionDragStart(event: CdkDragStart) {
        this.changeCursorOnDragStart();
        this._draggingSectionIndex.next(event.source.data);
    }

    onSectionDragEnd(event: CdkDragEnd) {
        this.changeCursorOnDragEnd();
        this._draggingSectionIndex.next('');
    }

    addQuestion(questionType: SurveyTemplateQuestionType, sectionIndex = -1, questionIndex = -1) {
        // Create new question
        const title = this.translate.get('SURVEY_MANAGER.QUESTION_TITLE_PLACEHOLDER').subscribe((title: string) => {

            const question: SurveyTemplateQuestion = {
                Name: PepGuid.newGuid(),
                Key: PepGuid.newGuid(),
                Title: title.toString() || '',
                Type: questionType,
            }

            // Get the sections.
            const sections = this._surveySubject.getValue().Sections;
            const currentSection = (sectionIndex > -1 && sectionIndex < sections.length) ? sections[sectionIndex] : sections[this._selectedSectionIndex];

            const newSelectedIndex = questionIndex > -1 && questionIndex < currentSection.Questions.length ? questionIndex :
                (this._selectedQuestionIndex > -1 && this._selectedQuestionIndex < currentSection.Questions.length ? this._selectedQuestionIndex + 1 : currentSection.Questions.length);
            currentSection.Questions.splice(newSelectedIndex, 0, question);

            this.notifySectionsChange(sections);
            this.notifySelectedQuestionChange(question, newSelectedIndex);
        });
    }

    onQuestionDropped(event: CdkDragDrop<any[]>, sectionIndex: number) {
        const sections = this._sectionsSubject.getValue();
        const currentSection = sections[sectionIndex];

        // If the question moved between columns in the same section or between different sections but not in the same column.
        if (event.container.id !== event.previousContainer.id) {
            // Get the previous section.
            const previuosSection = this.getSectionByIndex(event.previousContainer.id);

            transferArrayItem(previuosSection.Questions, currentSection.Questions, event.previousIndex, event.currentIndex);

            // Update the selected index.
            this.setSelected(false, sectionIndex, event.currentIndex);
        } else {
            moveItemInArray(currentSection.Questions, event.previousIndex, event.currentIndex);
        }

        this.notifySectionsChange(sections);
    }

    onQuestionDragStart(event: CdkDragStart) {
        this.changeCursorOnDragStart();
    }

    onQuestionDragEnd(event: CdkDragEnd) {
        this.changeCursorOnDragEnd();
    }

    
    duplicateSelectedItem() {                        
        if (this.selectedItemType === 'section') {
            this.duplicateSelectedSection();
        } else if (this.selectedItemType === 'question') {
            this.duplicateSelectedQuestion();
        } 
    }

    deleteSelectedItem() {
        if (this.selectedItemType === 'section') {
            this.deleteSelectedSection();
        } else if (this.selectedItemType === 'question') {
            this.deleteSelectedQuestion();
        }
    }

    dispatchEvent(eventData: CustomEventInit<any>) {
        const customEvent = new CustomEvent('emit-event', eventData);
        window.dispatchEvent(customEvent);
    }

    /**************************************************************************************/
    /*                            CPI & Server side calls.
    /**************************************************************************************/

    // Get the surveys (distinct with the drafts)
    getSurveyTemplates(addonUUID: string, options: any): Observable<SurveyTemplateRowProjection[]> {
        // Get the surveys from the server.
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/get_survey_templates_data?resourceName=${this.getCurrentResourceName()}&${options}`);
    }

    createNewSurveyTemplate(addonUUID: string, totalSurveys: number = 0): Observable<SurveyTemplate> {
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/create_survey_template?resourceName=${this.getCurrentResourceName()}&surveyNum=${totalSurveys + 1}`);
    }

    deleteSurveyTemplate(addonUUID: string, surveyTemplateKey: string): Observable<any> {
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/remove_survey_template?resourceName=${this.getCurrentResourceName()}&key=${surveyTemplateKey}`);
    }

    duplicateSurveyTemplate(addonUUID: string, surveyTemplateKey: string): Observable<any> {
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/duplicate_survey_template?resourceName=${this.getCurrentResourceName()}&key=${surveyTemplateKey}`);
    }
    
    loadSurveyTemplateBuilder(addonUUID: string, key: string, queryParameters: Params): void {
        const baseUrl = this.getBaseUrl(addonUUID);
        const resourceName = this.getCurrentResourceName();
        
        // Get the survey template (sections and the questions data) from the server.
        this.httpService.getHttpCall(`${baseUrl}/get_survey_template_builder_data?key=${key}&resourceName=${resourceName}`)
            .subscribe({
                next: (res: ISurveyTemplateBuilderData) => {
                    if (res && res.surveyTemplate) {
                        // Load the survey template.
                        this.notifySurveyChange(res.surveyTemplate);

                        // Load the additional fields.
                        this.loadSurveyTemplateBuilderAdditionalFields(key);
                    }
                },
                error: (err) => {
                    // debugger;
                    const dialogRef = this.showErrorDialog(err);
                    dialogRef.afterClosed().subscribe((res) => {
                        this.navigationService.back();
                    });
                },
                complete: () => {

                }
            });
    }

    loadSurveyTemplateBuilderAdditionalFields(templateKey: string): void {
        // Get the resource name.
        const resourceName = this.getCurrentResourceName();

        const eventData = {
            detail: {
                eventKey: CLIENT_ACTION_ON_CLIENT_SURVEY_TEMPLATE_LOAD,
                eventData: {
                    SurveyTemplateKey: templateKey,
                    ResourceName: resourceName
                },
                completion: (res: SurveyTemplateClientEventResult) => {
                    if (res.Success) {
                        // TODO: currently the SurveyTemplate draft is not sync so we cannot do this here.
                        // this.notifySurveyChange(res.SurveyTemplate);
                        this.notifyAdditionalFieldsChange(res?.AdditionalFields || {});
                    } else {
                        // Show default error.
                        this.showErrorDialog(this.translate.instant('MESSAGES.FAILED_TO_GET_SURVEY_TEMPLATE_ERROR'));
                    }
                }
            }
        };

        this.dispatchEvent(eventData);
    }

    unloadSurveyData() {
        this.notifySectionsChange([], false);
        this.notifySurveyChange(null);
        this._surveyModelKey = '';
        this.notifyAdditionalFieldsChange({});
    }

    // Restore the survey to tha last publish
    // restoreToLastPublish(addonUUID: string): Observable<SurveyTemplate> {
    //     const survey = this._surveySubject.getValue();
    //     const baseUrl = this.getBaseUrl(addonUUID);

    //     return this.httpService.getHttpCall(`${baseUrl}/restore_to_last_publish?key=${survey.Key}`);
    // }

    // Save the current survey template in drafts.
    saveCurrentSurveyTemplate(addonUUID: string, editable: boolean): Observable<SurveyTemplate> {
        const surveyTemplate: SurveyTemplate = this._surveySubject.getValue();
        
        const body = {
            resourceName: this.getCurrentResourceName(),
            surveyTemplate: surveyTemplate
        };

        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.postHttpCall(`${baseUrl}/save_draft_survey_template`, body);
    } 

    // Publish the current survey.
    publishCurrentSurveyTemplate(addonUUID: string): Observable<SurveyTemplate> {
        const surveyTemplate: SurveyTemplate = this._surveySubject.getValue();
        // const body = JSON.stringify(survey);
        const body = {
            resourceName: this.getCurrentResourceName(),
            surveyTemplate: surveyTemplate
        };

        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.postHttpCall(`${baseUrl}/publish_survey_template`, body);
    }

    loadSurvey(surveyKey: string): void {
        // Save the survey model key.
        this._surveyModelKey = surveyKey;

        const eventData = {
            detail: {
                eventKey: CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD,
                eventData: {
                    SurveyKey: this._surveyModelKey,
                },
                completion: (res: SurveyClientEventResult) => {
                    if (res.Success) {
                        this.notifySurveyChange(res.SurveyView);
                    } else {
                        // Show default error.
                        this.showErrorDialog();
                    }
                }
            }
        };

        this.dispatchEvent(eventData);
    }

    unloadSurvey(): void {
        if (this._surveyModelKey.length > 0) {
            const eventData = {
                detail: {
                    eventKey: CLIENT_ACTION_ON_CLIENT_SURVEY_UNLOAD,
                    eventData: {
                        SurveyKey: this._surveyModelKey,
                    },
                    completion: (res) => {
                        // debugger;
                    }
                }
            };
        
            this.dispatchEvent(eventData);
        }
    }

    async changeSurveyStatus(status: SurveyStatusType): Promise<void> {
        if (this._surveyModelKey.length > 0) {
            await this.waitWhileProccessing();

            // Now after wait set the processing flag to true and back to false in the completion function.
            this._processingSurvey = true;

            const eventData = {
                detail: {
                    eventKey: CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHAGE,
                    eventData: {
                        SurveyKey: this._surveyModelKey,
                        ChangedFields: [{ FieldID: 'StatusName', NewValue: status }],
                    },
                    completion: (res: SurveyClientEventResult) => {
                        this._processingSurvey = false;

                        // debugger;
                        if (res.Success) {
                            // Notify survey change to update survey object with all changes (like show if questions if added or removed).
                            this.notifySurveyChange(res.SurveyView);
                        } else {
                            // Show default error.
                            this.showErrorDialog();
                        }
                    }
                }
            };
        
            this.dispatchEvent(eventData);
        }
    }

    async changeSurveyQuestionValue(questionKey: string, value: any): Promise<void> {
        if (this._surveyModelKey.length > 0) {
            await this.waitWhileProccessing();

            // Now after wait set the processing flag to true and back to false in the completion function.
            this._processingSurvey = true;

            const eventData = {
                detail: {
                    eventKey: CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE,
                    eventData: {
                        SurveyKey: this._surveyModelKey,
                        ChangedFields: [{ FieldID: questionKey, NewValue: value }],
                    },
                    completion: (res: SurveyClientEventResult) => {
                        this._processingSurvey = false;

                        // debugger;
                        if (res.Success) {
                            // Notify survey change to update survey object with all changes (like show if questions if added or removed).
                            this.notifySurveyChange(res.SurveyView);

                            // Notify sections change to update UI.
                            this.notifySectionsChange(res.SurveyView?.Sections);
                        } else {
                            // Show default error.
                            this.showErrorDialog();
                        }
                    }
                }
            };
        
            this.dispatchEvent(eventData);
        }
    }
}
