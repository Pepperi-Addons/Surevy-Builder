import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEYS_TABLE_NAME, SurveyTemplateSection } from 'shared';
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

    private async saveSurveyModel(client: IClient | undefined, surveyKey: string): Promise<boolean> {
        const options = {
            url: `addon-cpi/save_surveys_by_key?key=${surveyKey}`,
            client: client
        }
        
        const survey = await pepperi.addons.api.uuid(this.SURVEY_ADDON_UUID).get(options);
        return survey.object ? true : false;
    }

    private async cancelSurveyModel(client: IClient | undefined, surveyKey: string): Promise<boolean> {
        const options = {
            url: `addon-cpi/cancel_surveys_by_key?key=${surveyKey}`,
            client: client
        }
        
        const survey = await pepperi.addons.api.uuid(this.SURVEY_ADDON_UUID).get(options);
        return survey.object ? true : false;
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

    private calcShowIf(surveyTemplate: SurveyTemplate) {
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

    private setSurveyAnswers(survey: Survey, surveyTemplate: SurveyTemplate) {
        // Remove old answers
        survey.Answers = [];

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];

                if (question.Value) {
                    survey.Answers.push({
                        QuestionKey: question.Key, 
                        Value: question.Value
                    })
                }
            }
        }
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

    async updateSurveyQuestions(client: IClient | undefined, surveyKey: string, surveyTemplate: SurveyTemplate): Promise<any> {
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
   
    async saveSurveyData(client: IClient | undefined, surveyKey: string): Promise<boolean> {
        return await this.saveSurveyModel(client, surveyKey);
    }

    async cancelSurveyData(client: IClient | undefined, surveyKey: string): Promise<boolean> {
        return await this.cancelSurveyModel(client, surveyKey);
    }
}
export default SurveysService;