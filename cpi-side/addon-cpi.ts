import '@pepperi-addons/cpi-node'
import SurveysService from './surveys-cpi.service';
import { SURVEY_LOAD_EVENT_NAME, SURVEY_LOAD_CLIENT_EVENT_NAME, SURVEY_UNLOAD_CLIENT_EVENT_NAME, SURVEY_FIELD_CHANGE_EVENT_NAME, SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME,
    SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME, SURVEY_QUESTION_CHANGE_EVENT_NAME, SurveyTemplate } from 'shared';
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
            const service = new SurveysService();
            mergedSurvey = await service.getSurveyData(data.client, surveyKey);

            // Test alert
            // await data.client?.alert('survey load - after', `${JSON.stringify(mergedSurvey)}`);
            
            if (mergedSurvey) {
                // TODO: Remove this.
                service.removeShowIfs(mergedSurvey);

                // Emit server event SURVEY_LOAD_EVENT_NAME
                // pepperi.events.emit(SURVEY_LOAD_EVENT_NAME, mergedSurvey);
            }
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
    
            // Test alert
            // await data.client?.alert('field change - after', `${JSON.stringify(mergedSurvey)}`);

            if (mergedSurvey) {
                // TODO: Remove this.
                service.removeShowIfs(mergedSurvey);

                // Emit server event SURVEY_STATUS_CHANGE_EVENT_NAME
                // pepperi.events.emit(SURVEY_FIELD_CHANGE_EVENT_NAME, data);
            }
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
            
            // Test alert
            // await data.client?.alert('question change - after', `${JSON.stringify(mergedSurvey)}`);
            
            if (mergedSurvey) {
                // TODO: Remove this.
                service.removeShowIfs(mergedSurvey);

                // Emit server event SURVEY_QUESTION_CHANGE_EVENT_NAME
                // pepperi.events.emit(SURVEY_QUESTION_CHANGE_EVENT_NAME, mergedSurvey);
            }
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
//     // let accountUUID: string = data.account_uuid || '';
//     // let templateKey: string = data.template_key || '';
	
// 	const templateMmodalOptions: any = {
// 		addonBlockName: 'ResourcePicker',
// 		hostObject: {
//             resource: 'SurveyTemplates',
//             view: '23f1a6fa-8983-4a84-b7f3-b022e40c6a44',
//             selectionMode: 'single', // multi
//             selectedObjectKeys: [],
//         },
// 		title: 'Select template',
// 		allowCancel: true,
// 	};
//     const templatesResult = await client?.["showModal"](templateMmodalOptions);
	
//     // If survey template was choosen
//     if(!templatesResult.canceled && templatesResult.result?.action === 'on-save') {

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
//         const accountsResult = await client?.["showModal"](accountsModalOptions);
//         // await client?.alert('', JSON.stringify(accountsResult.result));

//         // If account was choosen
//         if(!accountsResult.canceled && accountsResult.result?.action === 'on-save') {
//             const selectedTemplateKey = templatesResult.result.data.selectedObjectKeys[0];
//             const selectedAccountKey = accountsResult.result.data.selectedObjectKeys[0];

//             // Create new survey
//             const res = await pepperi.api.adal.upsert({
//                 addon: '122c0e9d-c240-4865-b446-f37ece866c22',
//                 table: 'Surveys',
//                 object: {
//                     'Key': '',
//                     'Template': selectedTemplateKey,
//                     'AccountUUID': selectedAccountKey
//                 },
//                 indexedField: ''
//             });
            
//             await client?.alert('', JSON.stringify(res));

//             const surveyKey = res.object['Key']?.toString();
//             await data.client?.navigateTo({ url: 'survey_test?survey_key=' + surveyKey});
//         } else {
//             // TODO: If cancel ??
//         }
//     } else {
//         // TODO: If cancel ??
//     }
// }