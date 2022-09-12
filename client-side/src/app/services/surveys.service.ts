import { CdkDragDrop, CdkDragEnd, CdkDragStart, copyArrayItem, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Injectable, ɵɵresolveBody } from "@angular/core";
import { Params } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PepGuid, PepHttpService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { Observable, BehaviorSubject, from } from 'rxjs';
import { NavigationService } from "./navigation.service";
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ISurveyEditor, ISurveyRowModel, Survey, SurveySection, ISurveyBuilderData, SurveyQuestion, SurveyQuestionType, SurveyObjValidator } from "../model/survey.model";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { PepQueryBuilderComponent, IPepQueryBuilderField } from "@pepperi-addons/ngx-lib/query-builder";
import { ShowIfDialogComponent } from '../components/dialogs/show-if-dialog/show-if-dialog.component';

import * as _ from 'lodash';


@Injectable({
    providedIn: 'root',
})
export class SurveysService {

    public mandaitoryfields: Array<SurveyObjValidator>;
    public failedOnValidation: Array<string> = [];
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
    private _sectionsSubject: BehaviorSubject<SurveySection[]> = new BehaviorSubject<SurveySection[]>([]);
    get sectionsChange$(): Observable<SurveySection[]> {
        return this._sectionsSubject.asObservable();
    }

    // This is the selected section subject
    private _selectedSectionIndex = -1;
    private _selectedSectionChangeSubject: BehaviorSubject<SurveySection> = new BehaviorSubject<SurveySection>(null);
    get selectedSectionChange$(): Observable<SurveySection> {
        return this._selectedSectionChangeSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This is the selected question subject
    private _selectedQuestionIndex = -1;
    private _selectedQuestionChangeSubject: BehaviorSubject<SurveyQuestion> = new BehaviorSubject<SurveyQuestion>(null);
    get selectedQuestionChange$(): Observable<SurveyQuestion> {
        return this._selectedQuestionChangeSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for survey change.
    private _surveySubject: BehaviorSubject<Survey> = new BehaviorSubject<Survey>(null);
    get surveyLoad$(): Observable<Survey> {
        return this._surveySubject.asObservable().pipe(distinctUntilChanged((prevSurvey, nextSurvey) => prevSurvey?.Key === nextSurvey?.Key));
    }
    get surveyDataChange$(): Observable<Survey> {
        return this._surveySubject.asObservable().pipe(filter(survey => !!survey));
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
        private dialog: PepDialogService
    ) {

        this.surveyLoad$.subscribe((survey: Survey) => {
            this.loadSurveyEditor(survey);
            this.notifySectionsChange(survey?.Sections ?? []);
            this.setSelected(0);
            // this.loadQuestions(survey);
        });
    }

    private getNewSection() {

        let section: SurveySection = null;

        this.translate.get('SURVEY_MANAGER.SECTION_TITLE_PLACEHOLDER').subscribe((res: string) => {
            section = {
                Key: PepGuid.newGuid(),
                Title: res,
                Questions: []
            };
        });

        return section;

    }

    private loadSurveyEditor(survey: Survey) {
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

    private notifySurveyChange(survey: Survey) {
        this._surveySubject.next(survey);
    }

    private notifySectionsChange(sections: SurveySection[], addDefualtSection = true) {
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

    private notifySelectedSectionChange(section: SurveySection, index: number) {
        this._selectedSectionIndex = index;
        this._selectedSectionChangeSubject.next(section);
    }

    private notifySelectedQuestionChange(question: SurveyQuestion, index: number) {
        this._selectedQuestionIndex = index;
        this._selectedQuestionChangeSubject.next(question);
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

    private getSectionByIndex(sectionIndex: string): SurveySection {
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
            const duplicated: SurveySection = _.cloneDeep(sections[this._selectedSectionIndex]);
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
                const duplicated: SurveyQuestion = _.clone(currentSection.Questions[this._selectedQuestionIndex]);
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

    /**
     * create a question-key array from all questions prior to the selected question with type boolean or select
     * @returns array of questions key
     */
    private getShowIfFields() {
        let fields: Array<IPepQueryBuilderField> = new Array<IPepQueryBuilderField>();

        const sections = this._sectionsSubject.getValue();
        for (let i = 0; i <= this._selectedSectionIndex; i++) {
            const currentSection = sections[i];
            if (currentSection) {
                const sectionQuestionsLength = i === this._selectedSectionIndex ? this._selectedQuestionIndex : currentSection.Questions.length;
                for (let j = 0; j < sectionQuestionsLength; j++) {
                    const currentQuestion = currentSection.Questions[j];
                    if (currentQuestion &&
                        (currentQuestion.Type === 'single-selection-dropdown' ||
                            currentQuestion.Type === 'multiple-selection-dropdown' ||
                            currentQuestion.Type === 'boolean-toggle')) {
                                fields.push({
                                    FieldID: currentQuestion.Key,
                                    Title: currentQuestion.Title,
                                    FieldType: this.getShowIfQuestionType(currentQuestion.Type),
                                    OptionalValues: currentQuestion.OptionalValues || []
                                } as IPepQueryBuilderField);
                    }
    
                }
            }            
        }       

        console.log('getShowIfFields', fields);
        return fields;
    }

    private getShowIfQuestionType(type: string) {
        switch (type) {
            case 'short-text':
            case 'long-text':
                return 'String';
            case 'single-selection-dropdown':
            case 'multiple-selection-dropdown':
                return 'MultipleStringValues';
            case 'boolean-toggle':
                return 'Bool'
            case 'number':
            case 'decimal':
            case 'currency':
            case 'percentage':
                return 'Integer';
            case 'date':
                return 'Date';
            case 'datetime':
                return 'DateTime';
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/

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

    updateSectionFromEditor(surveySection: SurveySection) {
        const sections = this._sectionsSubject.getValue();

        if (this._selectedSectionIndex >= 0 && this._selectedSectionIndex < sections.length) {
            sections[this._selectedSectionIndex] = surveySection;
            this.notifySectionsChange(sections);
        }
    }

    updateQuestionFromEditor(surveyQuestion: SurveyQuestion) {
        const sections = this._sectionsSubject.getValue();

        if (this._selectedSectionIndex >= 0 && this._selectedSectionIndex < sections.length) {
            const currentSection = sections[this._selectedSectionIndex];

            if (this._selectedQuestionIndex >= 0 && this._selectedQuestionIndex < currentSection.Questions.length) {
                currentSection.Questions[this._selectedQuestionIndex] = surveyQuestion;
                this.notifySectionsChange(sections);
            }
        }
    }

    setSelected(sectionIndex: number, questionIndex: number = -1) {
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
        this.setSelected(-1);
    }

    addSection(sectionIndex: number = -1, section: SurveySection = null) {
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

    // removeSection(sectionId: string) {
    //     const sections = this._sectionsSubject.getValue();
    //     const index = sections.findIndex(section => section.Key === sectionId);

    //     // Remove section.
    //     if (index > -1) {
    //         sections.splice(index, 1);
    //         this.notifySectionsChange(sections);
    //     }
    // }

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

    // removeQuestion(questionId: string) {
    //     // Remove the question from section.
    //     const sections = this._sectionsSubject.getValue();

    //     for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    //         const section = sections[sectionIndex];

    //         // Remove the question.
    //         const questionsIndex = section.Questions.findIndex(question => question?.Key === questionId);
    //         if (questionsIndex > -1) {
    //             section.Questions.splice(questionsIndex, 1);
    //             this.notifySectionsChange(sections);
    //             return;
    //         }
    //     }
    // }

    addQuestion(questionType: SurveyQuestionType, sectionIndex = -1, questionIndex = -1) {
        // Create new question
        const title = this.translate.get('SURVEY_MANAGER.QUESTION_TITLE_PLACEHOLDER').subscribe((title: string) => {

            const question: SurveyQuestion = {
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
            this.setSelected(sectionIndex, event.currentIndex);
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

    /**************************************************************************************/
    /*                            CPI & Server side calls.
    /**************************************************************************************/

    // Get the surveys (distinct with the drafts)
    getSurveys(addonUUID: string, options: any): Observable<ISurveyRowModel[]> {
        // Get the surveys from the server.
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/get_surveys_data?${options}`);
    }

    createNewSurvey(addonUUID: string, totalSurveys: number = 0): Observable<Survey> {
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/create_survey?surveyNum=${totalSurveys + 1}`);
    }

    // Delete the survey
    deleteSurvey(addonUUID: string, surveyKey: string): Observable<any> {
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.getHttpCall(`${baseUrl}/remove_survey?key=${surveyKey}`);
    }

    loadSurveyBuilder(addonUUID: string, surveyKey: string, editable: boolean, queryParameters: Params): void {
        //  If is't not edit mode get the survey from the CPI side.
        const baseUrl = this.getBaseUrl(addonUUID);

        if (!editable) {
            // Get the survey (sections and the questions data) from the server.
            this.httpService.getHttpCall(`${baseUrl}/get_survey_data?key=${surveyKey}`)
                .subscribe((res: ISurveyBuilderData) => {
                    if (res && res.survey) {
                        // Load the survey.
                        this.notifySurveyChange(res.survey);
                    }
                });
        } else { // If is't edit mode get the data of the survey and the relations from the Server side.
            // Get the survey (sections and the questions data) from the server.
            this.httpService.getHttpCall(`${baseUrl}/get_survey_builder_data?key=${surveyKey}`)
                .subscribe((res: ISurveyBuilderData) => {
                    if (res && res.survey) {
                        // Load the survey.
                        this.notifySurveyChange(res.survey);
                    }
                });
        }
    }

    unloadSurveyBuilder() {
        this.notifySectionsChange([], false);
        this.notifySurveyChange(null);
    }

    // Restore the survey to tha last publish
    restoreToLastPublish(addonUUID: string): Observable<Survey> {
        const survey = this._surveySubject.getValue();
        const baseUrl = this.getBaseUrl(addonUUID);

        return this.httpService.getHttpCall(`${baseUrl}/restore_to_last_publish?key=${survey.Key}`);
    }

    // Save the current survey in drafts.
    saveCurrentSurvey(addonUUID: string): Observable<Survey> {
        const survey: Survey = this._surveySubject.getValue();
        const body = JSON.stringify(survey);
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.postHttpCall(`${baseUrl}/save_draft_survey`, body);
    }

    validateSurvey(): boolean {
        this.failedOnValidation = [];
        //TODO: NEED TO CHECK FOR DUPLICATE KEYS AND THROW ERROR WHEN NEED
        const survey: Survey = this._surveySubject.getValue();
        this.mandaitoryfields = [];
        const mandetoryFieldsArr = ['multiple-selection-dropdown', 'boolean-toggle']
        survey.Sections.forEach((section, secIndex) => {
            //Checking the name & Title of the section
            this.keyAndTitleValidator(section, secIndex);

            section.Questions.forEach((question, quesIndex) => {
                //Checking the name & Title of the section
                this.keyAndTitleValidator(question, secIndex, quesIndex);
                //Check if question type has mandatory fields
                if (mandetoryFieldsArr.includes(question.Type)) {
                    this.checkQuestionMandatoryFields(question, secIndex, quesIndex);
                }
            });
        });

        return this.mandaitoryfields.length ? false : true;
    }

    checkQuestionMandatoryFields(question: SurveyQuestion, secIndex, quesIndex) {
        secIndex++;
        quesIndex++;
        switch (question.Type) {
            case 'multiple-selection-dropdown': {
                question.OptionalValues.forEach((opt, optIndex) => {
                    const index = `${secIndex.toString()}.${quesIndex.toString()}`; // .${(optIndex+1).toString()}
                    if (opt.key.trim() == '') {
                        this.mandaitoryfields.push((new SurveyObjValidator('question', 'Key', index, this.translate.instant('VALIDATION.KEY_MISSING'))));

                    }
                    if (opt.value.trim() == '') {
                        this.mandaitoryfields.push(new SurveyObjValidator('question', 'Value', index, this.translate.instant('VALIDATION.VALUE_MISSING')));
                    }
                });
                break;
            }
        }
    }

    keyAndTitleValidator(obj, secIndex, quesIndex = 1) {
        secIndex++;
        quesIndex++;
        const type = "Type" in obj ? 'question' : 'section';
        const index = type == 'section' ? `${secIndex.toString()}` : `${secIndex.toString()}.${quesIndex.toString()}`;

        if (obj.Key.trim() == '') {
            this.mandaitoryfields.push(new SurveyObjValidator(type, 'Key', index, this.translate.instant('VALIDATION.KEY_MISSING')));
        }

        if (obj.Title.trim() == '') {
            this.mandaitoryfields.push((new SurveyObjValidator(type, 'Title', index, type == 'section' ? this.translate.instant('VALIDATION.NAME_MISSING') : this.translate.instant('VALIDATION.QUESTION_MISSING'))));
        }
    }

    showValidationInfo() {
        let content = '';

        this.mandaitoryfields.forEach((field, index) => {
            if (!this.failedOnValidation.includes((field.type) + (field.index))) {
                this.failedOnValidation.push((field.type) + (field.index));
            }
            content += `${field.type} ${field.index} ${(field.error)}.`;
            content += index < (this.mandaitoryfields.length - 1) ? '</br>' : '';
        });

        const title = this.translate.instant('VALIDATION.FAILED_MSG');
        const dataMsg = new PepDialogData({ title, actionsType: "close", content });

        this.dialog.openDefaultDialog(dataMsg);
    }

    openShowIfDialog() {        
        const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'large');
        const data = new PepDialogData({ actionsType: 'cancel-ok', content: { query: null, fields: this.getShowIfFields() }, showClose: true });
        const dialogRef = this.dialog.openDialog(ShowIfDialogComponent, data, config);        
        dialogRef.afterClosed().subscribe({
            next: (res) => {
                console.log('res', res);
                //TODO save filter
            }
        });
    }

    // Publish the current survey.
    publishCurrentSurvey(addonUUID: string): Observable<Survey> {
        const survey: Survey = this._surveySubject.getValue();
        const body = JSON.stringify(survey);
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.postHttpCall(`${baseUrl}/publish_survey`, body);
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


}



