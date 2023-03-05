import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEY_TEMPLATES_BASE_TABLE_NAME, SurveyTemplateSection, SurveyStatusType, 
    SURVEYS_BASE_TABLE_NAME, SURVEYS_TABLE_NAME, RESOURCE_NAME_PROPERTY, SURVEY_TEMPLATES_TABLE_NAME, DRAFT_SURVEY_TEMPLATES_TABLE_NAME } from 'shared';
import { Survey } from '@pepperi-addons/papi-sdk';
import { filter } from '@pepperi-addons/pepperi-filters';
import config from '../addon.config.json';

class SurveysService {

    constructor() {}

    /***********************************************************************************************/
    //                              Private functions
    /************************************************************************************************/
    
    private async getSurveyModel(surveyKey: string): Promise<Survey> {
        this.printLog(`getSurveyModel with key = ${surveyKey} -> before`);
        const survey = await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).key(surveyKey).get();
        this.printLog(`getSurveyModel with key = ${surveyKey} -> after`);
        return survey as Survey;
    }

    private async setSurveyModel(survey: Survey): Promise<Survey> {
        this.printLog(`setSurveyModel -> before`);
        const res = await pepperi.resources.resource(survey.ResourceName).post(survey);
        this.printLog(`setSurveyModel -> after`);
        return res as Survey;
    }

    private async getSurveyTemplate(surveyTemplateKey: string, resourceName: string = SURVEY_TEMPLATES_BASE_TABLE_NAME): Promise<SurveyTemplate> {
        // const survey = await pepperi.resources.resource(resourceName).key(surveyTemplateKey).get();
        this.printLog(`getSurveyTemplate with key = ${surveyTemplateKey} -> before`);
        const surveyTemplates = await (await pepperi.resources.resource(resourceName).search({ KeyList: [surveyTemplateKey] })).Objects;
        const surveyTemplate = surveyTemplates.length > 0 ? surveyTemplates[0] : null;
        this.printLog(`getSurveyTemplate with key = ${surveyTemplateKey} -> after`);
        return surveyTemplate as SurveyTemplate;
    }
    
    // private async getSurveyTemplateDraft(surveyTemplateKey: string): Promise<SurveyTemplate | null> {
    //     let draftSurveyTemplate = null;

    //     // Try to get the survey template from the draft first.
    //     try {    
    //         const draft = (await pepperi.api.adal.get({
    //             addon: config.AddonUUID,
    //             table: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
    //             key: surveyTemplateKey
    //         })).object;
            
    //         // Set surveyTemplate from the draft.JsonTemplate
    //         if (draft) {
    //             draftSurveyTemplate = JSON.parse(draft.JsonTemplate);
    //         }
    //     } catch {
    //         // Do nothing
    //     }

    //     return draftSurveyTemplate;
    // }

    private mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate): void {
        this.printLog(`mergeSurveyIntoTemplateData -> before`);

        // Calc the merge survey template object.
        if (survey.Answers && survey.Answers?.length > 0) {
            // For each answer set it in the right question.
            for (let answerIndex = 0; answerIndex < survey.Answers.length; answerIndex++) {
                const answer = survey.Answers[answerIndex];
                let valueIsSet = false;

                for (let sectionIndex = 0; sectionIndex < surveyTemplate?.Sections?.length; sectionIndex++) {
                    const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];
    
                    for (let questionIndex = 0; questionIndex < section.Questions?.length; questionIndex++) {
                        const question = section.Questions[questionIndex];
                        
                        // Set the value and break this loop
                        if (question.Key === answer?.Key) {
                            question.Value = answer?.Answer;
                            valueIsSet = true;
                            break;
                        }
                    }

                    // Break this loop for continue to the next answer.
                    if (valueIsSet) {
                        break;
                    }
                }
            }
        }

        surveyTemplate.StatusName = survey.StatusName && survey.StatusName.length > 0 ? survey.StatusName as SurveyStatusType : 'InCreation';
        surveyTemplate.SurveyKey = survey.Key;
        
        this.printLog(`mergeSurveyIntoTemplateData -> after`);
    }

    private createMapQuestionObject(surveyTemplate: SurveyTemplate): any {
        this.printLog(`createMapQuestionObject -> before`);

        const ret = {};

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                ret[question.Key] = question.Value ?? undefined;
            }
        }
        this.printLog(`createMapQuestionObject -> after`);

        return ret;
    }

    private calcShowIf(surveyTemplate: SurveyTemplate): void {
        this.printLog(`calcShowIf -> before`);

        // Prepare the questions value data object
        const questionsObject = this.createMapQuestionObject(surveyTemplate);

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                let shouldBeVisible = true;
                const question = section.Questions[questionIndex];

                if (question.ShowIf) {
                    const showIf = question.ShowIf;
                    
                    // Call pepperi filters to apply this.
                    shouldBeVisible = filter([questionsObject], showIf).length > 0;
                }

                question.Visible = shouldBeVisible;
            }

            // This logic will be in the UI like Ori.M asked.
            // // Set only the visible questions.
            // section.Questions = section.Questions.filter(q => q.Visible);
        }

        this.printLog(`calcShowIf -> after`);
    }

    private setSurveyAnswers(survey: Survey, surveyTemplate: SurveyTemplate): void {
        this.printLog(`setSurveyAnswers -> before`);

        // Remove old answers
        survey.Answers = [];

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];

                if (question.Value?.length > 0) {
                    survey.Answers.push({
                        Key: question.Key, 
                        Answer: question.Value
                    });
                }
            }
        }
        
        this.printLog(`setSurveyAnswers -> after`);
    }

    private validateSurvey(surveyTemplate: SurveyTemplate): string {
        this.printLog(`validateSurvey -> before`);

        let errorMsg = '';

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
            
                // If this questions is mandatory and the value is empty.
                if (question.Visible && question.Mandatory && (question.Value === undefined || question.Value === null || question.Value.length === 0)) {
                    errorMsg = `"${question.Title}" is mandatory`;
                    break;
                }
            }

            if (errorMsg.length > 0) {
                break;
            }
        }
        this.printLog(`validateSurvey -> after`);

        return errorMsg;
    }

    private async getSurveyDataInternal(client: IClient | undefined, surveyKey: string, calcShowIf = true): Promise<{ survey: Survey, surveyTemplate: SurveyTemplate | null }> {
        let surveyTemplate: SurveyTemplate | null = null;
        this.printLog(`getSurveyDataInternal getSurveyModel with key = ${surveyKey} -> before`);
        const survey = await this.getSurveyModel(surveyKey);
        
        if (survey && survey.Template) {
            surveyTemplate = await this.getSurveyTemplate(survey.Template);
    
            if (surveyTemplate) {
                this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
                
                if (calcShowIf) {
                    this.calcShowIf(surveyTemplate);
                }
            }
        } else {
            // TODO: Throw survey has no template.
        }

        this.printLog(`getSurveyDataInternal getSurveyModel with key = ${surveyKey} -> after`);

        return { survey, surveyTemplate };
    }
    
    /***********************************************************************************************/
    //                              Public functions
    /************************************************************************************************/

    printLog(message: string, withMiliseconds: boolean = true) {
        const miliAsString = withMiliseconds ? `, miliseconds - ${new Date().getTime()}` : '';
        console.log(`${message}${miliAsString}`);
    }
    
    async getSurveyData(client: IClient | undefined, surveyKey: string): Promise<SurveyTemplate | null> {
        const { survey, surveyTemplate } = await this.getSurveyDataInternal(client, surveyKey);
        return surveyTemplate;
    }

    // Drafts is not sync so we cannot do this here!!!
    // async getSurveyTemplateData(client: IClient | undefined, surveyTemplateKey: string, resourceName: string): Promise<SurveyTemplate | null> {
    //     let surveyTemplate;
        
    //     // Get the survey template from the drafts.
    //     const draftSurveyTemplate = await this.getSurveyTemplateDraft(surveyTemplateKey);
    
    //     // If draft is hidden or not exist add call to bring the publish survey template.
    //     if (!draftSurveyTemplate || draftSurveyTemplate.Hidden) {
    //         surveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, resourceName);
    //     }
            
    //     // Return the publish survey template if exist (cause we populate it only if the draft is hidden or not exist).
    //     return surveyTemplate ? surveyTemplate : draftSurveyTemplate;
    // }

    async onSurveyFieldChange(client: IClient | undefined, surveyKey: string, changedFields: any): Promise<any> {
        this.printLog(`onSurveyFieldChange with surveyKey = ${surveyKey} -> before`);
        
        const hudOptions = {
            // HUD's message
            message: 'Waiting....', // optional (default value is '')
        
            // adds a button with text to the HUD
            // closeMessage: 'Press to close', // optional - (default is '' and the botton is hidden)
        
            //display the HUD after the delay time (the block runs in the meantime)
            delay: 0.1, //optional - (default value is 0.5)
        
            // block of code that will run in background while the HUD is showing.
            block: async (updateMessage) => {
                const { survey, surveyTemplate } = await this.getSurveyDataInternal(client, surveyKey);
                let shouldNavigateBack = false;
                let isValid = true;
                let errorMessage = '';

                if (surveyTemplate) {
                    for (let index = 0; index < changedFields.length; index++) {
                        const propertyName = changedFields[index].FieldID;
                        const value = changedFields[index].NewValue;
                        
                        // If the survey field is StatusName
                        if (propertyName === 'StatusName') {
                            const status: SurveyStatusType = value as SurveyStatusType;

                            // If the status is 'Submitted' (If there is no error navigate back after save).
                            if (status === 'Submitted') {
                                errorMessage = this.validateSurvey(surveyTemplate);
                                isValid = shouldNavigateBack = errorMessage.length === 0;

                                if (!isValid) {
                                    break;
                                }
                            }
                        }

                        // Set the old value in the changeFields
                        changedFields[index].OldValue = survey[propertyName];

                        // Set the new value.
                        survey[propertyName] = surveyTemplate[propertyName] = value;
                    }

                    // Save the survey
                    if (isValid) {
                        await this.setSurveyModel(survey);
                    }
                } else {
                    errorMessage = `Survey template not exist for surveyKey = ${surveyKey}`;
                    isValid = false;
                }

                return { mergedSurvey: surveyTemplate, changedFields, shouldNavigateBack, isValid, errorMessage};
            },
        };

        const res = await client?.showHUD(hudOptions);
        this.printLog(`onSurveyFieldChange with surveyKey = ${surveyKey} -> after`);

        // If there is an error message show it.
        if (res?.result?.errorMessage.length > 0) {
            // // Wait for delay.
            // await new Promise((resolve) => setTimeout(resolve, 150));
            await client?.alert('Notice', res?.result.errorMessage);
        }

        return res?.result;
    }

    async onSurveyQuestionChange(client: IClient | undefined, surveyKey: string, changedFields: any): Promise<any> {
        this.printLog(`onSurveyQuestionChange with surveyKey = ${surveyKey} -> before`);

        const { survey, surveyTemplate } = await this.getSurveyDataInternal(client, surveyKey, false);
        let isValid = true;

        if (surveyTemplate) {
            let someQuestionChanged = false;

            for (let index = 0; index < changedFields.length; index++) {
                const questionKey = changedFields[index].FieldID;
                const value = changedFields[index].NewValue;
                let isValueSet = false;

                // Set the question value.
                for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
                    const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];
        
                    for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                        const question = section.Questions[questionIndex];
                        
                        if (question.Key === questionKey) {
                            // Set the old value in the changeFields
                            changedFields[index].OldValue = question.Value;
                            
                            // Set the new value for this question.
                            question.Value = value;
                            someQuestionChanged = isValueSet = true;
                            break;
                        }
                    }
        
                    if (isValueSet) {
                        break;
                    }
                }
            }

            if (someQuestionChanged) {
                // Set the new Answers and save in the DB.
                this.setSurveyAnswers(survey, surveyTemplate);
                await this.setSurveyModel(survey)
    
                // Calc the show if
                this.calcShowIf(surveyTemplate);
            }
        } else {
            isValid = false;
        }

        this.printLog(`onSurveyQuestionChange with surveyKey = ${surveyKey} -> after`);

        return { mergedSurvey: surveyTemplate, changedFields, isValid};
    }

    async getObjectPropsForSurveyUserEvent(surveyKey: string) {
        this.printLog(`getObjectPropsForSurveyUserEvent with surveyKey = ${surveyKey} -> before`);

        const surveys = await (await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).search({
            KeyList: [surveyKey],
            Fields: [RESOURCE_NAME_PROPERTY]
        })).Objects;
        
        const objectPropsToAddEventData = {
            ObjectType: surveys?.length > 0 ? surveys[0][RESOURCE_NAME_PROPERTY] : SURVEYS_TABLE_NAME
        }

        this.printLog(`getObjectPropsForSurveyUserEvent with surveyKey = ${surveyKey} -> after`);

        return objectPropsToAddEventData;
    }
}
export default SurveysService;