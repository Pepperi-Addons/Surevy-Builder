import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEYS_TABLE_NAME } from 'shared';
import { Survey, Answer } from 'shared';
import config from '../addon.config.json';
class SurveysService {
    constructor() {}

    private async getSurveyModel(client: IClient | undefined, surveyKey: string): Promise<Survey> {
        // TODO: Implement this - Get the survey object
        // const survey = await pepperi.api.adal.get({
        //     addon: '', // surveys addon
        //     table: 'Surveys',
        //     key: surveyKey
        // }); 
        const SURVEY_ADDON_UUID = 'dd0a85ea-7ef0-4bc1-b14f-959e0372877a';
        const options = {
            url: `addon-cpi/get_surveys_by_key?key=${surveyKey}`, //http://localhost:8088
            client: client
        }
        
        const survey = await pepperi.addons.api.uuid(SURVEY_ADDON_UUID).get(options);
        return survey;

        // return survey.object as any;
        // return { 
        //     Template: 'c018cea0-c63b-426d-b781-e9f766c59565',
        //     Answers: []
        // };
    }

    private async getSurveyTemplate(surveyTemplateKey: string): Promise<SurveyTemplate> {

        const survey = await pepperi.api.adal.get({
            addon: config.AddonUUID,
            table: SURVEYS_TABLE_NAME,
            key: surveyTemplateKey
        });
        
        return survey.object as SurveyTemplate;
    }
    
    // TODO: Here we should calc the survey template object.
    private mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate |any): SurveyTemplate {
        let mergeSurvey: SurveyTemplate = surveyTemplate;

        return mergeSurvey;
    }

    // Load the survey template with the values form the DB.
    async getSurveyData(client: IClient | undefined, surveyKey: string): Promise<SurveyTemplate> {
        const survey = await this.getSurveyModel(client, surveyKey);
        // const surveyTemplate = { Tomer: 'test'};
        const surveyTemplate = await this.getSurveyTemplate(survey?.Template || 'c018cea0-c63b-426d-b781-e9f766c59565');

        const mergedSurvey = this.mergeSurveyIntoTemplateData(survey, surveyTemplate);
        return mergedSurvey;
    }

    async updateSurveyQuestions(surveyTemplate: SurveyTemplate): Promise<any> {
        // TODO: Implement this
    }
   
}
export default SurveysService;