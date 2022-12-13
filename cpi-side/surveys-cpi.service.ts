import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEY_TEMPLATES_TABLE_NAME, SurveyTemplateSection, SurveyStatusType, SURVEYS_TABLE_NAME } from 'shared';
import { Survey, Answer } from 'shared';
import { filter } from '@pepperi-addons/pepperi-filters';
import config from '../addon.config.json';
class SurveysService {
    // private readonly SURVEY_ADDON_UUID = 'dd0a85ea-7ef0-4bc1-b14f-959e0372877a';
    // private readonly UDC_ADDON_UUID = '122c0e9d-c240-4865-b446-f37ece866c22';

    constructor() {}

    private async getSurveyModel(client: IClient | undefined, surveyKey: string): Promise<Survey> {
        // const survey = await pepperi.api.adal.get({
        //     addon: this.UDC_ADDON_UUID,
        //     table: SURVEYS_TABLE_NAME,
        //     key: surveyKey
        // });
        // return survey.object as Survey;

        // const survey = await pepperi.resources.resource(SURVEYS_TABLE_NAME).key(surveyKey).get();
        const surveys = await pepperi.resources.resource(SURVEYS_TABLE_NAME).get({});// key(surveyKey).get();
        const survey = surveys.find(s => s.Key === surveyKey);
        return survey as Survey;
    }

    private async setSurveyModel(client: IClient | undefined, survey: Survey): Promise<Survey> {
        // const res = await pepperi.api.adal.upsert({
        //     addon: this.UDC_ADDON_UUID,
        //     table: SURVEYS_TABLE_NAME,
        //     object: survey as any,
        //     indexedField: ''
        // });

        // return res.object as Survey;
        const res = await pepperi.resources.resource(SURVEYS_TABLE_NAME).post(survey);
        return res as Survey;
    }

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<SurveyTemplate> {
        // const survey = await pepperi.api.adal.get({
        //     addon: this.UDC_ADDON_UUID,
        //     table: SURVEY_TEMPLATES_TABLE_NAME,
        //     key: surveyTemplateKey
        // });
        
        // return survey.object as SurveyTemplate;
        
        // const survey = await pepperi.resources.resource(SURVEY_TEMPLATES_TABLE_NAME).key(surveyTemplateKey).get();
        const surveyTemplates = await pepperi.resources.resource(SURVEY_TEMPLATES_TABLE_NAME).get({});// key(surveyKey).get();
        const surveyTemplate = surveyTemplates.find(s => s.Key === surveyTemplateKey);
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

        surveyTemplate.Status = survey.Status && survey.Status.length > 0 ? survey.Status as SurveyStatusType : 'In Creation';

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

    private setSurveyQuestionValue(surveyTemplate: SurveyTemplate, questionKey: string, value: any): boolean {
        let isValueSet = false;

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                
                // Set the value for this question.
                if (question.Key === questionKey) {
                    question.Value = value;
                    isValueSet = true;
                    break;
                }
            }

            if (isValueSet) {
                break;
            }
        }

        return isValueSet;
    }

    private async getSurveyDataInternal(client: IClient | undefined, surveyKey: string, calcShowIf = true): Promise<{ survey: Survey, surveyTemplate: SurveyTemplate | null }> {
        let surveyTemplate: SurveyTemplate | null = null;
        const survey = await this.getSurveyModel(client, surveyKey);
        
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

    async onSurveyFieldChange(client: IClient | undefined, surveyKey: string, propertyName: string, value: any): Promise<SurveyTemplate | null> {

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
                let errorMessage = '';
        
                if (surveyTemplate) {
                    let canChangeProperty = true;

                    // If the survey field is Status
                    if (propertyName === 'Status') {
                        const status: SurveyStatusType = value as SurveyStatusType;

                        // If the status is 'Submitted' (If there is no error navigate back after save).
                        if (status === 'Submitted') {
                            errorMessage = this.validateSurvey(surveyTemplate);
                            canChangeProperty = shouldNavigateBack = errorMessage.length === 0;
                        }
                    }

                    if (canChangeProperty) {
                        survey[propertyName] = surveyTemplate[propertyName] = value;
                        await this.setSurveyModel(client, survey);

                        // if (needToNavigateBack) {
                        //     await client?.navigateBack();
                        // }
                    } else {
                        // Wait for delay.
                        await new Promise((resolve) => setTimeout(resolve, 150));
                        await client?.alert('Notice', errorMessage);
                    }
                }

                return { surveyTemplate, errorMessage, shouldNavigateBack};
            },
        };

        const res = await client?.showHUD(hudOptions);

        // if (res?.result?.errorMessage.length > 0) {
        //     await client?.alert('Notice', res?.result?.errorMessage);
        // } else 
        if (res?.result?.shouldNavigateBack) {
            await client?.navigateBack();
        }

        return res?.result?.surveyTemplate;
    }

    async onSurveyQuestionChange(client: IClient | undefined, surveyKey: string, questionKey: string, value: any): Promise<SurveyTemplate | null> {
        const { survey, surveyTemplate } = await this.getSurveyDataInternal(client, surveyKey, false);
            
        if (surveyTemplate) {
            let isValueSet = this.setSurveyQuestionValue(surveyTemplate, questionKey, value);
    
            if (isValueSet) {
                // Set the new Answers and save in the DB.
                this.setSurveyAnswers(survey, surveyTemplate);
                await this.setSurveyModel(client, survey)
    
                // Calc the show if
                this.calcShowIf(surveyTemplate);
            }
        }

        return surveyTemplate;
    }

    // Temp function 
    // removeShowIfs(surveyTemplate: SurveyTemplate) {
    //     for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
    //         const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

    //         for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
    //             const question = section.Questions[questionIndex];

    //             if (question.ShowIf) {
    //                 delete question.ShowIf;
    //             }
    //         }
    //     }
    // }
}
export default SurveysService;