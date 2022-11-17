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

// export async function main(data)  {
//     // your predefined parameters will be properties on data object
//     let accountUUID: string = data.account_uuid || '';
//     let templateKey: string = data.template_key || '';
//     // TODO: Create new survey
	
// 	const hostObj = {
// 		resource: 'surveyTemplates',
// 		view: '23f1a6fa-8983-4a84-b7f3-b022e40c6a44',
// 		selectionMode: 'single', // multi
// 		selectedObjectKeys: [],
// 	};
// 	const modalOptions: any = {
// 		addonBlockName: 'ResourcePicker',
// 		hostObject: hostObj,
// 		title: 'Select template',
// 		allowCancel: true,
// 	};
//     const {canceled, result} = await client?.["showModal"](modalOptions);
	
//     await client?.alert('', JSON.stringify(accountUUID));
//     await client?.alert('', JSON.stringify(result));

//     if(!canceled) { 
//         // If object choosen
//         if (result.action === 'on-save') {
//             const selectedItem = result.selectedObjectKeys[0];
//             const res = await pepperi.api.adal.upsert({
//                 addon: '122c0e9d-c240-4865-b446-f37ece866c22',
//                 table: 'surveys',
//                 object: {
//                     'Key': '',
//                     'Template': '824e9a23-3ac7-4c38-97a8-0fe46070ac12',
//                     // 'AccountUUID': '123'
//                 },
//                 indexedField: ''
//             });
    
//             const surveyKey = res.object['Key']?.toString();
            
//             await data.client?.navigateTo({ url: 'survey_test?survey_key=' + surveyKey});

//         } else {
//     		// TODO: If cancel ??
//         }
//     } else {
// 		// TODO: If cancel ??
//     }

//     // const SURVEY_ADDON_UUID = 'dd0a85ea-7ef0-4bc1-b14f-959e0372877a';
//     // const options = {
//     //     url: `addon-cpi/surveys`,
//     //     body: {

//     //     },
//     //     client: client
//     // }
        
    
//     // const survey = null;//await pepperi.addons.api.uuid(SURVEY_ADDON_UUID).post(options);

//     // // pepperi.api.
//     // const surveyKey = '2d333a42-e1cd-4aa0-b17f-59c5555f2999';

//     // await client.navigateTo({ url: 'survey_test?survey_key=' + surveyKey});
// }

// router.get('/get_survey_template_data', async (req, res, next) => {
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