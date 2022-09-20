import { SurveyTemplate, SURVEYS_TABLE_NAME } from 'shared';
import { Survey, Answer } from 'shared';

class SurveysService {
    constructor() {}

    private async getSurveyModel(surveyKey: string): Promise<Survey> {
        // TODO: Implement this - Get the survey object
        // const survey = await pepperi.api.adal.get({
        //     addon: '', // surveys addon
        //     table: 'Surveys',
        //     key: surveyKey
        // }); 
        
        // return survey.object as any;
        return { 
            Template: 'c018cea0-c63b-426d-b781-e9f766c59565',
            Answers: []
        };
    }

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<SurveyTemplate> {
        const survey = await pepperi.api.adal.get({
            addon: 'cf17b569-1af4-45a9-aac5-99f23cae45d8', // this (survey-builder) addon
            table: SURVEYS_TABLE_NAME,
            key: surveyTemplateKey
        }); 
        
        return survey.object as SurveyTemplate;
    }
    
    // TODO: Here we should calc the survey template object.
    private mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate): SurveyTemplate {
        let mergeSurvey: SurveyTemplate = surveyTemplate;

        return mergeSurvey;
    }

    // Load the survey template with the values form the DB.
    async getSurveyData(surveyKey: string): Promise<SurveyTemplate> {
        const survey = await this.getSurveyModel(surveyKey);
        const surveyTemplate = await this.getSurveyTemplate(survey?.Template || 'c018cea0-c63b-426d-b781-e9f766c59565');

        const mergedSurvey = this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
        return mergedSurvey;
    }

    async updateSurveyQuestions(surveyTemplate: SurveyTemplate): Promise<any> {
        // TODO: Implement this
    }
   
}
export default SurveysService;