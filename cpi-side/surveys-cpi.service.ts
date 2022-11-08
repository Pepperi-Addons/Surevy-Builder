import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEYS_TABLE_NAME, SurveyTemplateSection, SurveyStatusType } from 'shared';
import { Survey, Answer } from 'shared';
import { filter } from '@pepperi-addons/pepperi-filters';
import config from '../addon.config.json';
class SurveysService {
    private readonly SURVEY_ADDON_UUID = 'dd0a85ea-7ef0-4bc1-b14f-959e0372877a';

    constructor() {}

    private async getSurveyModel(client: IClient | undefined, surveyKey: string): Promise<Survey> {
        // TODO: Implement this - Get the survey object
        // const survey = await pepperi.api.adal.get({
        //     addon: '', // surveys addon
        //     table: 'Surveys',
        //     key: surveyKey
        // }); 
        
        const options = {
            url: `addon-cpi/get_surveys_by_key?key=${surveyKey}`, //http://localhost:8088
            client: client
        }
        
        const survey = await pepperi.addons.api.uuid(this.SURVEY_ADDON_UUID).get(options);
        return survey.object;
    }

    private async setSurveyModel(client: IClient | undefined, survey: Survey): Promise<Survey> {
        const options = {
            url: `addon-cpi/surveys`,
            body: survey,
            client: client
        }
        
        survey = await pepperi.addons.api.uuid(this.SURVEY_ADDON_UUID).post(options);
        return survey;
    }

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<SurveyTemplate> {
        const survey = await pepperi.api.adal.get({
            addon: config.AddonUUID,
            table: SURVEYS_TABLE_NAME,
            key: surveyTemplateKey
        });
        
        return survey.object as SurveyTemplate;
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
                        
                        // Set the value is break this loop
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

                if (question.ShowIf && question.ShowIf.length > 0) {
                    const showIf = JSON.parse(question.ShowIf);
                    
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
                    })
                }
            }
        }
    }

    private async validateSurvey(survey: Survey): Promise<boolean> {
        let isValid = true;

        const surveyTemplate = await this.getSurveyTemplate(survey.Template);
        this.mergeSurveyIntoTemplateData(survey, surveyTemplate);

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
            
                // If this questions is mandatory and the value is empty.
                if (question.Mandatory && (question.Value === undefined || question.Value === null || question.Value.length === 0)) {
                    isValid = false;
                    break;
                }
            }

            if (!isValid) {
                break;
            }
        }

        return isValid;
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

    private async updateSurveyQuestions(client: IClient | undefined, surveyKey: string, surveyTemplate: SurveyTemplate): Promise<any> {
        let survey = await this.getSurveyModel(client, surveyKey);

        if (surveyTemplate && survey?.Template === surveyTemplate?.Key) {
            // Set the new Answers and save in the DB.
            this.setSurveyAnswers(survey, surveyTemplate);
            this.setSurveyModel(client, survey)

            // Calc the show if
            this.calcShowIf(surveyTemplate);
        } else {
            // Template is different.
        }

        return surveyTemplate;
    }

    // Load the survey template with the values form the DB.
    async getSurveyData(client: IClient | undefined, surveyKey: string): Promise<SurveyTemplate | null> {
        let surveyTemplate: SurveyTemplate | null = null;
        const survey = await this.getSurveyModel(client, surveyKey);
        
        if (survey && survey.Template) {
            surveyTemplate = await this.getSurveyTemplate(survey.Template);
    
            if (surveyTemplate) {
                this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
                this.calcShowIf(surveyTemplate);
            }
        } else {
            // TODO: Throw survey has no template.
        }

        return surveyTemplate;
    }

    async onSurveyFieldChange(client: IClient | undefined, surveyKey: string, propertyName: string, value: any): Promise<SurveyTemplate | null> {
        let surveyTemplate: SurveyTemplate | null = null;
        const survey = await this.getSurveyModel(client, surveyKey);
        
        if (survey && survey.Template) {
            surveyTemplate = await this.getSurveyTemplate(survey.Template);
    
            if (surveyTemplate) {
                this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
                let isValueSet = false;

                // If the field name is status check if valid in case that the status is 'Submitted', else, set other property on survey.
                if (propertyName === 'Status') {
                    const status: SurveyStatusType = value as SurveyStatusType;
                    const canChangeStatus = (status === 'Submitted') ? await this.validateSurvey(survey) : true;
                    
                    if (canChangeStatus) {
                        survey.Status = status;
                        isValueSet = true;
                    } else {
                        // TODO: Throw invalid survey
                    }
                } else {
                    if (survey.hasOwnProperty(propertyName)) {
                        survey[propertyName] = propertyName;
                        isValueSet = true;
                    }
                }

                if (isValueSet) {
                    await this.setSurveyModel(client, survey);
                    // TODO: Maybe need to calc show if when the survey field change??
                    // this.calcShowIf(surveyTemplate);
                }
            } else {
                // TODO: Throw survey has no template.
            }
        }

        return surveyTemplate;
    }

    async onSurveyQuestionChange(client: IClient | undefined, surveyKey: string, questionKey: string, value: any): Promise<SurveyTemplate | null> {
        let surveyTemplate: SurveyTemplate | null = null;
        const survey = await this.getSurveyModel(client, surveyKey);
        
        if (survey && survey.Template) {
            surveyTemplate = await this.getSurveyTemplate(survey.Template);
            
            if (surveyTemplate) {
                this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
                let isValueSet = this.setSurveyQuestionValue(surveyTemplate, questionKey, value);

                if (isValueSet) {
                    // Set the new Answers and save in the DB.
                    this.setSurveyAnswers(survey, surveyTemplate);
                    await this.setSurveyModel(client, survey)

                    // Calc the show if
                    this.calcShowIf(surveyTemplate);
                }
            } else {
                // TODO: Throw survey has no template.
            }
        }

        return surveyTemplate;
    }
}
export default SurveysService;