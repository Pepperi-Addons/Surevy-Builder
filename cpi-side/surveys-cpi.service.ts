import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEY_TEMPLATES_BASE_TABLE_NAME, SurveyTemplateSection, SurveyStatusType, 
    SURVEYS_BASE_TABLE_NAME, SURVEYS_TABLE_NAME, RESOURCE_NAME_PROPERTY } from 'shared';
import { Survey, Answer } from 'shared';
import { filter } from '@pepperi-addons/pepperi-filters';
// import { FindOptions } from '@pepperi-addons/papi-sdk';

class SurveysService {

    constructor() {}

    private async getSurveyModel(surveyKey: string): Promise<Survey> {
        const survey = await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).key(surveyKey).get();
        // const surveys = await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).get(findOptions);
        // const survey = surveys.find(s => s.Key === surveyKey);
        return survey as Survey;
    }

    private async setSurveyModel(survey: Survey): Promise<Survey> {
        const res = await pepperi.resources.resource(survey.ResourceName).post(survey);
        return res as Survey;
    }

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<SurveyTemplate> {
        // const survey = await pepperi.resources.resource(SURVEY_TEMPLATES_BASE_TABLE_NAME).key(surveyTemplateKey).get();
        const surveyTemplates = await (await pepperi.resources.resource(SURVEY_TEMPLATES_BASE_TABLE_NAME).search({ KeyList: [surveyTemplateKey] })).Objects;
        const surveyTemplate = surveyTemplates.length > 0 ? surveyTemplates[0] : null;
        return surveyTemplate as SurveyTemplate;
    }
    
    // Calc the merge survey template object.
    private mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate): void {
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
                        if (question.Key === answer?.QuestionKey) {
                            question.Value = answer?.Value;
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

        surveyTemplate.Status = survey.Status && survey.Status.length > 0 ? survey.Status as SurveyStatusType : 'InCreation';

        // TODO: Add other fields if needed.
    }

    private createMapQuestionObject(surveyTemplate: SurveyTemplate): any {
        const ret = {};

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                ret[question.Key] = question.Value ?? undefined;
            }
        }

        return ret;
    }

    private calcShowIf(surveyTemplate: SurveyTemplate): void {
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

            // Set only the visible questions.
            section.Questions = section.Questions.filter(q => q.Visible);
        }
    }

    private setSurveyAnswers(survey: Survey, surveyTemplate: SurveyTemplate): void {
        // Remove old answers
        survey.Answers = [];

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];

                if (question.Value?.length > 0) {
                    survey.Answers.push({
                        QuestionKey: question.Key, 
                        Value: question.Value
                    });
                }
            }
        }
    }

    private validateSurvey(surveyTemplate: SurveyTemplate): string {
        let errorMsg = '';

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
            
                // If this questions is mandatory and the value is empty.
                if (question.Mandatory && (question.Value === undefined || question.Value === null || question.Value.length === 0)) {
                    errorMsg = `"${question.Title}" is mandatory`;
                    break;
                }
            }

            if (errorMsg.length > 0) {
                break;
            }
        }

        return errorMsg;
    }

    private async getSurveyDataInternal(client: IClient | undefined, surveyKey: string, calcShowIf = true): Promise<{ survey: Survey, surveyTemplate: SurveyTemplate | null }> {
        let surveyTemplate: SurveyTemplate | null = null;
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

        return { survey, surveyTemplate };
    }

    // Load the survey template with the values form the DB.
    async getSurveyData(client: IClient | undefined, surveyKey: string): Promise<SurveyTemplate | null> {
        const { survey, surveyTemplate } = await this.getSurveyDataInternal(client, surveyKey);
        return surveyTemplate;
    }

    async onSurveyFieldChange(client: IClient | undefined, surveyKey: string, changedFields: any): Promise<any> {

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

                if (surveyTemplate) {
                    for (let index = 0; index < changedFields.length; index++) {
                        const propertyName = changedFields[index].FieldID;
                        const value = changedFields[index].NewValue;
                        
                        // If the survey field is Status
                        if (propertyName === 'Status') {
                            const status: SurveyStatusType = value as SurveyStatusType;

                            // If the status is 'Submitted' (If there is no error navigate back after save).
                            if (status === 'Submitted') {
                                const errorMessage = this.validateSurvey(surveyTemplate);
                                isValid = shouldNavigateBack = errorMessage.length === 0;

                                if (!isValid) {
                                    // Wait for delay.
                                    await new Promise((resolve) => setTimeout(resolve, 150));
                                    await client?.alert('Notice', errorMessage);
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
                    isValid = false;
                }

                return { mergedSurvey: surveyTemplate, changedFields, shouldNavigateBack, isValid};
            },
        };

        const res = await client?.showHUD(hudOptions);
        return res?.result;
    }

    async onSurveyQuestionChange(client: IClient | undefined, surveyKey: string, changedFields: any): Promise<any> {
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

        return { mergedSurvey: surveyTemplate, changedFields, isValid};
    }

    async getObjectPropsForUserEvent(surveyKey: string) {
        // TODO: Remove the SURVEYS_TABLE_NAME hard coded.
        const surveys = await (await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).search({
            KeyList: [surveyKey],
            Fields: [RESOURCE_NAME_PROPERTY]
        })).Objects;
        
        // get({
        //     where: `Key='${surveyKey}'`,
        //     fields: [RESOURCE_NAME_PROPERTY]
        // });
        
        const objectPropsToAddEventData = {
            ObjectType: surveys?.length > 0 ? surveys[0][RESOURCE_NAME_PROPERTY] : SURVEYS_TABLE_NAME
        }

        return objectPropsToAddEventData;
    }
}
export default SurveysService;