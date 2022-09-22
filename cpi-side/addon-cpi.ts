import '@pepperi-addons/cpi-node'
import SurveysService from './surveys-cpi.service';
import { SURVEY_LOAD_EVENT_NAME, SURVEY_LOAD_CLIENT_EVENT_NAME, SURVEY_FIELD_CHANGE_EVENT_NAME, SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME } from 'shared';
export const router = Router();

export async function load(configuration: any) {
    // console.log('cpi side works!');
    // Put your cpi side code here

    pepperi.events.intercept(SURVEY_LOAD_CLIENT_EVENT_NAME as any, {}, async (data): Promise<void> => {
        // Handle on survey load
        const surveyKey = data.surveyKey;
        let survey = {};

        // Test alert
        await data.client?.alert('survey load - before', data.surveyKey);
        
        // if (surveyKey) { 
            const service = new SurveysService();
            survey = await service.getSurveyData(data.client, surveyKey);
        // }
        
        // Test alert
        await data.client?.alert('survey load - after', `${JSON.stringify(survey)}`);
        
        // TODO: Throw server event SURVEY_LOAD_EVENT_NAME

        return survey as any;
    });

    pepperi.events.intercept(SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME as any, {}, async (data): Promise<void> => {
        // Handle on survey field change
        const survey = data.survey;

        // Test alert
        data.client?.alert('survey field change', `${JSON.stringify(survey)}`);
        
        // Save the survey model in the db.

        // TODO: Throw server event SURVEY_FIELD_CHANGE_EVENT_NAME

        return survey as any;
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