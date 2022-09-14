import { SurveyTemplate } from 'shared';

class SurveysService {
    async getSurveyData(surveyKey: string): Promise<any> {
        let result = {};
        const survey = await this.getSurvey(surveyKey);

        result = {
            survey,           
        }
        return result;
    }
    
    async getSurvey(surveyKey: string): Promise<any> {
        const survey = await pepperi.api.adal.get({
            addon: 'cf17b569-1af4-45a9-aac5-99f23cae45d8', // surveys addon
            table: 'Surveys',
            key: surveyKey
        }); 
        
        return survey.object as SurveyTemplate;
    }
}
export default SurveysService;