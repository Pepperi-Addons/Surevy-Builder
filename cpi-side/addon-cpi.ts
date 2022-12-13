import '@pepperi-addons/cpi-node'
import SurveysService from './surveys-cpi.service';
import { SURVEY_LOAD_CLIENT_EVENT_NAME, 
    SURVEY_UNLOAD_CLIENT_EVENT_NAME, 
    // SURVEY_FIELD_AFTER_CHANGE_EVENT_NAME, SURVEY_LOAD_BEFORE_MERGE_EVENT_NAME, SURVEY_LOAD_AFTER_MERGE_EVENT_NAME, SURVEY_QUESTION_AFTER_CHANGE_EVENT_NAME,
    SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME,
    SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME, SurveyTemplate } from 'shared';
export const router = Router();

export async function load(configuration: any) {
    // console.log('cpi side works!');
    // Put your cpi side code here

    // Handle on survey load
    pepperi.events.intercept(SURVEY_LOAD_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        // Handle on survey load
        const surveyKey = data.ObjectKey;
        let mergedSurvey: SurveyTemplate | null = null;

        // debugger;
        // Test alert
        // await data.client?.alert('survey load - before', surveyKey);
        
        if (surveyKey) { 
            // Emit server event SURVEY_LOAD_BEFORE_MERGE_EVENT_NAME
            // await pepperi.events.emit(SURVEY_LOAD_BEFORE_MERGE_EVENT_NAME, { ObjectKey: surveyKey });

            const service = new SurveysService();
            mergedSurvey = await service.getSurveyData(data.client, surveyKey);

            // Emit server event SURVEY_LOAD_AFTER_MERGE_EVENT_NAME
            // mergedSurvey = await pepperi.events.emit(SURVEY_LOAD_AFTER_MERGE_EVENT_NAME, { Result: mergedSurvey });
        }

        return mergedSurvey;
    });

    // Handle on survey unload
    pepperi.events.intercept(SURVEY_UNLOAD_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        await data.client?.navigateBack();
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
    
            // Emit server event SURVEY_FIELD_AFTER_CHANGE_EVENT_NAME
            // pepperi.events.emit(SURVEY_FIELD_AFTER_CHANGE_EVENT_NAME, { ChangedFieldID: propertyName, Result: mergedSurvey } );
        }

        return mergedSurvey;
    });

    // Handle on survey question change
    pepperi.events.intercept(SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME as any, {}, async (data): Promise<any> => {
        let mergedSurvey: SurveyTemplate | null = null;
        // debugger;

        const surveyKey = data.ObjectKey;
        const questionKey = data.FieldID;
        const value = data.Value;

        if (surveyKey && questionKey) { 
            const service = new SurveysService();
            mergedSurvey = await service.onSurveyQuestionChange(data.client, surveyKey, questionKey, value);
            
            // Emit server event SURVEY_QUESTION_AFTER_CHANGE_EVENT_NAME
            // pepperi.events.emit(SURVEY_QUESTION_AFTER_CHANGE_EVENT_NAME, { ChangedFieldID: propertyName, Result: mergedSurvey } );
        }

        return mergedSurvey;
    });

}

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

// export async function main(data)  {
//     // your predefined parameters will be properties on data object
//     let accountUUID: string = data.account_uuid || '';
//     let templateKey: string = data.template_key || '';
	
//     // Choose survey template if not supply as parameter
//     if (templateKey.length === 0) {
//         const templateMmodalOptions: any = {
//             addonBlockName: 'ResourcePicker',
//             hostObject: {
//                 resource: 'SurveyTemplates',
//                 view: '23f1a6fa-8983-4a84-b7f3-b022e40c6a44',
//                 selectionMode: 'single', // multi
//                 selectedObjectKeys: [],
//             },
//             title: 'Select template',
//             allowCancel: true,
//         };
//         // const templatesResult = { canceled: false, result: { action: 'on-save', data: { selectedObjectKeys: ['251c629a-d929-4d8b-a010-41534df3cebd'] } } };
//         const templatesResult = await client?.["showModal"](templateMmodalOptions);

//         // If survey template was choosen
//         if (!templatesResult.canceled && templatesResult.result?.action === 'on-save' && templatesResult.result.data?.selectedObjectKeys.length > 0) {
//             templateKey = templatesResult.result.data.selectedObjectKeys[0];
//         }
//     }
    
//     // Choose account if not supply as parameter.
//     if (templateKey.length > 0 && accountUUID.length === 0) {
//         const accountsModalOptions: any = {
//             addonBlockName: 'ResourcePicker',
//             hostObject: {
//                 resource: 'accounts',
//                 view: 'bc2b2abf-6128-4db6-944a-e17a6a919cc9',
//                 selectionMode: 'single', // multi
//                 selectedObjectKeys: [],
//             },
//             title: 'Select account',
//             allowCancel: true,
//         };
//         // const accountsResult = { canceled: false, result: { action: 'on-save', data: { selectedObjectKeys: ['6fc3dd58-6a17-4593-ab8a-fb7a7156eae6'] } } };
//         const accountsResult = await client?.["showModal"](accountsModalOptions);
        
//         // If account was choosen
//         if (!accountsResult.canceled && accountsResult.result?.action === 'on-save' && accountsResult.result.data?.selectedObjectKeys.length > 0) {
//             accountUUID = accountsResult.result.data.selectedObjectKeys[0];
//         }
//     }

//     // Create new survey
//     if (templateKey.length > 0 && accountUUID.length > 0) {
//         const newSurvey = {
//             'Template': templateKey,
//             'AccountUUID': accountUUID
//         };
//         console.log(newSurvey);
//         const res = await pepperi.resources.resource('Surveys').post(newSurvey);
//         console.log(res);
        
//         await client?.navigateTo({ url: 'survey_test?survey_key=' + res.Key});
//     } else {
//         await client?.alert('Info', `Cannot create survey, ${templateKey.length === 0 ? 'template' : 'account'} is not supply.`);
//     }
// }