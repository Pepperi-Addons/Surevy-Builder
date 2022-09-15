import { SurveyTemplate, SURVEYS_TABLE_NAME } from 'shared';
import { Survey, Answer } from 'shared';

class SurveysService {
    private currentSurvey: Survey | null = null;
    private currentSurveyTemplate: SurveyTemplate | null = null;

    constructor() {

    }

    private async getSurvey(surveyKey: string): Promise<Survey> {
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

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<any> {
        const survey = await pepperi.api.adal.get({
            addon: 'cf17b569-1af4-45a9-aac5-99f23cae45d8', // this (survey-builder) addon
            table: SURVEYS_TABLE_NAME,
            key: surveyTemplateKey
        }); 
        
        return survey.object as SurveyTemplate;
    }

    async loadSurveyData(surveyKey: string): Promise<any> {
        let result = {};

        this.currentSurvey = await this.getSurvey(surveyKey);
        const surveyTemplate = await this.getSurveyTemplate(this.currentSurvey?.Template || 'c018cea0-c63b-426d-b781-e9f766c59565');

        // TODO: Here we should calc the survey template object.
        result = {
            // survey: this.currentSurvey,
            survey: surveyTemplate,
        }

        return result;
    }

    async updateSurveyQuestions(surveyTemplate: SurveyTemplate): Promise<any> {
        // TODO: Implement this
    }
   
}
export default SurveysService;