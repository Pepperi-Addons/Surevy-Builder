import { CdkDragDrop, CdkDragEnd, CdkDragStart, copyArrayItem, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Injectable } from "@angular/core";
import { Params } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PepGuid, PepHttpService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { Observable, BehaviorSubject, from } from 'rxjs';
import { NavigationService } from "./navigation.service";
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ISurveyEditor, ISurveyRowModel, Survey, SurveySection, ISurveyBuilderData, SurveyQuestion, SurveyQuestionType } from "../model/survey.model";

// import * as _ from 'lodash';

@Injectable({
    providedIn: 'root',
})
export class SurveysService {
    
    private _defaultSectionTitle = '';
    set defaultSectionTitle(value: string) {
        if (this._defaultSectionTitle === '') {
            this._defaultSectionTitle = value;
        }
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
    private _selectedSectionChangeSubject: BehaviorSubject<SurveySection> = new BehaviorSubject<SurveySection>(null);
    get selectedSectionChange$(): Observable<SurveySection> {
        return this._selectedSectionChangeSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This is the selected question subject
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

    // This subject is for edit mode when question is dragging now or not.
    private _draggingQuestionKey: BehaviorSubject<string> = new BehaviorSubject('');
    get draggingQuestionKey(): Observable<string> {
        return this._draggingQuestionKey.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for edit mode when section is dragging now or not.
    private _draggingSectionKey: BehaviorSubject<string> = new BehaviorSubject('');
    get draggingSectionKey(): Observable<string> {
        return this._draggingSectionKey.asObservable().pipe(distinctUntilChanged());
    }

    // This subject is for lock or unlock the screen (Usage only in edit mode).
    private _lockScreenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    get lockScreenChange$(): Observable<boolean> {
        return this._lockScreenSubject.asObservable().pipe(distinctUntilChanged());
    }

    constructor(
        private translate: TranslateService,
        private sessionService: PepSessionService,
        private httpService: PepHttpService,
        private navigationService: NavigationService,
    ) {
        this.surveyLoad$.subscribe((survey: Survey) => {
            this.loadSurveyEditor(survey);
            this.notifySectionsChange(survey?.Sections ?? []);
            // this.loadQuestions(survey);
        });
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

    private notifySectionsChange(sections: SurveySection[]) {
        const survey = this._surveySubject.getValue();

        if (survey) {
            survey.Sections = sections;
            
            this._sectionsSubject.next(survey.Sections);
            this.notifySurveyChange(survey);
        }
    }

    private notifySelectedSectionChange(section: SurveySection) {
        this._selectedSectionChangeSubject.next(section);
    }

    private notifySelectedQuestionChange(question: SurveyQuestion) {
        this._selectedQuestionChangeSubject.next(question);
    }

    private getBaseUrl(addonUUID: string): string {
        // For devServer run server on localhost.
        if(this.navigationService.devServer) {
            return `http://localhost:4500/internal_api`;
        } else {
            const baseUrl = this.sessionService.getPapiBaseUrl();
            return `${baseUrl}/addons/api/${addonUUID}/internal_api`;
        }
    }
    
    private changeCursorOnDragStart() {
        document.body.classList.add('inheritCursors');
        document.body.style.cursor = 'grabbing';
    }

    private changeCursorOnDragEnd() {
        document.body.classList.remove('inheritCursors');
        document.body.style.cursor = 'unset';
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

    setSelected(sectionIndex: number, questionIndex: number = -1) {
        const sections = this._sectionsSubject.getValue();
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            const section = sections[sectionIndex];
            this.notifySelectedSectionChange(section);

            const questions = section.Questions;
            if (questionIndex >= 0 && questionIndex < questions.length) {
                const question = questions[questionIndex];
                this.notifySelectedQuestionChange(question);
            } else {
                this.notifySelectedQuestionChange(null);
            }
        } else {
            this.notifySelectedQuestionChange(null);
            this.notifySelectedSectionChange(null);
        }
    }

    clearSelected() {
        this.setSelected(-1);
    }

    addSection(section: SurveySection = null) {
        // Create new section
        if (!section) {
            section = {
                Name: '',
                Questions: []
            }
        }
        
        // Add the new section to survey layout.
        const sections = this._surveySubject.getValue().Sections;
        sections.push(section);
        this.notifySectionsChange(sections);
    }

    removeSection(sectionId: string) {
        const sections = this._sectionsSubject.getValue();
        const index = sections.findIndex(section => section.Key === sectionId);

        // Remove section.
        if (index > -1) {
            sections.splice(index, 1);
            this.notifySectionsChange(sections);
        }
    }

    onSectionDropped(event: CdkDragDrop<any[]>) {
        const sections = this._sectionsSubject.getValue();
        moveItemInArray(sections, event.previousIndex, event.currentIndex);
        this.notifySectionsChange(sections);
    }

    onSectionDragStart(event: CdkDragStart) {
        this.changeCursorOnDragStart();
        this._draggingSectionKey.next(event.source.data);
    }

    onSectionDragEnd(event: CdkDragEnd) {
        this.changeCursorOnDragEnd();
        this._draggingSectionKey.next('');
    }

    removeQuestion(questionId: string) {
        // Remove the question from section.
        const sections = this._sectionsSubject.getValue();

        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];
            
            // Remove the question.
            const questionsIndex = section.Questions.findIndex(question => question?.Key === questionId);
            if (questionsIndex > -1) {
                section.Questions.splice(questionsIndex, 1);
                this.notifySectionsChange(sections);
                return;
            }
        }
    }

    addQuestion(questionType: SurveyQuestionType, sectionIndex = -1, questionIndex = -1) {
        // Create new question
        const question: SurveyQuestion = {
            Type: questionType,
        }
        
        // Get the sections.
        const sections = this._surveySubject.getValue().Sections;
        const currentSection = (sectionIndex >= 0 && sectionIndex < sections.length) ? sections[sectionIndex] : sections[sections.length - 1];
        
        if (questionIndex >= 0 && questionIndex < currentSection.Questions.length) {
            currentSection.Questions.splice(questionIndex, 0, question);
        } else {
            currentSection.Questions.push(question);
        }

        this.notifySectionsChange(sections);
    }

    onQuestionDropped(event: CdkDragDrop<any[]>, sectionIndex: number) {
        const sections = this._sectionsSubject.getValue();
        const currentSection = sections[sectionIndex];
        
        // If the question moved between columns in the same section or between different sections but not in the same column.
        if (event.container.id !== event.previousContainer.id) {
            // Get the previous section.
            const previuosSection = this.getSectionByIndex(event.previousContainer.id);
            
            transferArrayItem(previuosSection.Questions, currentSection.Questions, event.previousIndex, event.currentIndex);
        } else {
            moveItemInArray(currentSection.Questions, event.previousIndex, event.currentIndex);
        }

        this.notifySectionsChange(sections);
    }
    
    onQuestionDragStart(event: CdkDragStart) {
        this.changeCursorOnDragStart();
        // Take the question key if exist, else take the available question key (relation key).
        const questionKey = event.source.data?.QuestionKey || event.source.data?.Key;
        this._draggingQuestionKey.next(questionKey);
    }

    onQuestionDragEnd(event: CdkDragEnd) {
        this.changeCursorOnDragEnd();
        this._draggingQuestionKey.next('');
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
        return this.httpService.getHttpCall(`${baseUrl}/create_survey?surveyNum=${totalSurveys+1}`);
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
        this.notifySectionsChange([]);
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

    // Publish the current survey.
    publishCurrentSurvey(addonUUID: string): Observable<Survey> {
        const survey: Survey = this._surveySubject.getValue();
        const body = JSON.stringify(survey);
        const baseUrl = this.getBaseUrl(addonUUID);
        return this.httpService.postHttpCall(`${baseUrl}/publish_survey`, body);
    }
}
