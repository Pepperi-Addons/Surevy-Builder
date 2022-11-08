import '@pepperi-addons/cpi-node'
import SurveysService from './surveys-cpi.service';
import { SURVEY_LOAD_EVENT_NAME, SURVEY_LOAD_CLIENT_EVENT_NAME, SURVEY_FIELD_CHANGE_EVENT_NAME, SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME,
    SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME, SURVEY_QUESTION_CHANGE_EVENT_NAME, SurveyTemplate } from 'shared';
export const router = Router();

export async function load(configuration: any) {
    // console.log('cpi side works!');
    // Put your cpi side code here

    pepperi.events.intercept(SURVEY_LOAD_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        // Handle on survey load
        const surveyKey = data.ObjectKey;
        let mergedSurvey: SurveyTemplate | null = null;

        // debugger;
        // Test alert
        await data.client?.alert('survey load - before', data.surveyKey);
        
        if (surveyKey) { 
            const service = new SurveysService();
            mergedSurvey = await service.getSurveyData(data.client, surveyKey);

            // Test alert
            await data.client?.alert('survey load - after', `${JSON.stringify(mergedSurvey)}`);
            
            // Emit server event SURVEY_LOAD_EVENT_NAME
            pepperi.events.emit(SURVEY_LOAD_EVENT_NAME, mergedSurvey);
        }

        return mergedSurvey;
    });

    // Handle on survey field change
    pepperi.events.intercept(SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        let mergedSurvey: SurveyTemplate | null = null;
        const surveyKey = data.ObjectKey;
        const propertyName = data.FieldID;
        const value = data.Value;
        
        if (surveyKey && propertyName) { 
            const service = new SurveysService();
            mergedSurvey = await service.onSurveyFieldChange(data.client, surveyKey, propertyName, value);
    
            if (mergedSurvey) {
                // Emit server event SURVEY_STATUS_CHANGE_EVENT_NAME
                pepperi.events.emit(SURVEY_FIELD_CHANGE_EVENT_NAME, data);
            }
        }

        return mergedSurvey;
    });

    // Handle on survey question change
    pepperi.events.intercept(SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        let mergedSurvey: SurveyTemplate | null = null;

        const surveyKey = data.ObjectKey;
        const questionKey = data.FieldID;
        const value = data.Value;

        if (surveyKey && questionKey) { 
            const service = new SurveysService();
            mergedSurvey = await service.onSurveyQuestionChange(data.client, surveyKey, questionKey, value);

            if (mergedSurvey) {
                // Emit server event SURVEY_QUESTION_CHANGE_EVENT_NAME
                pepperi.events.emit(SURVEY_QUESTION_CHANGE_EVENT_NAME, mergedSurvey);
            }
        }

        return mergedSurvey;
    });

}

// router.get('/get_survey_data', async (req, res, next) => {
//     let result = {};

//     try {
//         const surveyKey = req.query['survey_key']?.toString();
//         if (surveyKey) {
//             const service = new SurveysService();
//             result = await service.getSurveyData(surveyKey);
//         }
//     } catch (err) {
//         console.log(err);
//         next(err)
//     }

//     res.json(result);
// });

// router.get('/get_survey', async (req, res) => {
//     let resObj = {}
    
    
//     res.json(resObj);
// });

// router.post('/update_survey', async (req, res) => {
//     // debugger;
//     let resObj = {}
    
//     res.json(resObj);

// });