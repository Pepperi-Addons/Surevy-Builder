import '@pepperi-addons/cpi-node'
import SurveysService from './surveys-cpi.service';
import { USER_ACTION_ON_SURVEY_DATA_LOAD, USER_ACTION_ON_SURVEY_VIEW_LOAD, CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD, 
    CLIENT_ACTION_ON_CLIENT_SURVEY_UNLOAD, USER_ACTION_ON_SURVEY_FIELD_CHANGED, CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHAGE,
    CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE, USER_ACTION_ON_SURVEY_QUESTION_CHANGED, SurveyTemplate, CLIENT_ACTION_ON_CLIENT_SURVEY_TEMPLATE_LOAD, USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD } from 'shared';
export const router = Router();

export async function load(configuration: any) {
    /***********************************************************************************************/
    //                              Client Events for survey
    /************************************************************************************************/
    
    // Handle on survey load
    pepperi.events.intercept(CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD as any, {}, async (data): Promise<any> => {
        const surveyKey = data.SurveyKey || undefined;
        let mergedSurvey: SurveyTemplate | null = null;
        
        // debugger;
        // Test alert
        // await data.client?.alert('survey load - before', surveyKey);
        
        if (surveyKey) { 
            const service = new SurveysService();
            const objectPropsToAddEventData = await service.getObjectPropsForSurveyUserEvent(data.SurveyKey);

            // Emit server event USER_ACTION_ON_SURVEY_DATA_LOAD
            await pepperi.events.emit(USER_ACTION_ON_SURVEY_DATA_LOAD, {
                SurveyKey: surveyKey,
                ...objectPropsToAddEventData
            }, data);

            mergedSurvey = await service.getSurveyData(data.client, surveyKey);

            // Emit server event USER_ACTION_ON_SURVEY_VIEW_LOAD
            const userEventResult: any = await pepperi.events.emit(USER_ACTION_ON_SURVEY_VIEW_LOAD, {
                SurveyView: mergedSurvey,
                ...objectPropsToAddEventData
            }, data);

            if (userEventResult?.data?.SurveyView) {
                mergedSurvey = userEventResult.data.SurveyView;
            }
        }

        return mergedSurvey;
    });

    // Handle on survey unload
    pepperi.events.intercept(CLIENT_ACTION_ON_CLIENT_SURVEY_UNLOAD as any, {}, async (data): Promise<any> => {
        // Emit server event USER_ACTION_ON_SURVEY_VIEW_UNLOAD
        // const objectPropsToAddEventData = await service.getObjectPropsForUserEvent(data.SurveyKey);
        // await pepperi.events.emit(USER_ACTION_ON_SURVEY_VIEW_UNLOAD, { ...objectPropsToAddEventData }, data);

        await data.client?.navigateBack();
    });

    // Handle on survey field change
    pepperi.events.intercept(CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHAGE as any, {}, async (data): Promise<any> => {
        let mergedSurvey: SurveyTemplate | null = null;
        const surveyKey = data.SurveyKey || undefined;
        
        if (surveyKey && data.ChangedFields?.length > 0) { 
            const service = new SurveysService();
            const objectPropsToAddEventData = await service.getObjectPropsForSurveyUserEvent(data.SurveyKey);
            const res: { mergedSurvey, changedFields, shouldNavigateBack, isValid} = await service.onSurveyFieldChange(data.client, surveyKey, data.ChangedFields);
    
            if (res.isValid) {
                mergedSurvey = res.mergedSurvey;
                
                // Emit server event USER_ACTION_ON_SURVEY_FIELD_CHANGED
                const userEventResult: any = await pepperi.events.emit(USER_ACTION_ON_SURVEY_FIELD_CHANGED, {
                    SurveyView: res.mergedSurvey,
                    ChangedFields: res.changedFields,
                    ...objectPropsToAddEventData
                }, data);

                if (userEventResult?.data?.SurveyView) {
                    mergedSurvey = userEventResult.data.SurveyView;
                }

                // If we should navigate back.
                if (res.shouldNavigateBack) {
                    await data.client?.navigateBack();
                }
            }
        }

        return mergedSurvey;
    });

    // Handle on survey question change
    pepperi.events.intercept(CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE as any, {}, async (data): Promise<any> => {
        let mergedSurvey: SurveyTemplate | null = null;
        const surveyKey = data.SurveyKey || undefined;
        // debugger;
        
        if (surveyKey && data.ChangedFields?.length > 0) { 
            const service = new SurveysService();
            const objectPropsToAddEventData = await service.getObjectPropsForSurveyUserEvent(data.SurveyKey);
            const res: { mergedSurvey, changedFields, isValid} = await service.onSurveyQuestionChange(data.client, surveyKey, data.ChangedFields);
            
            if (res.isValid) {
                mergedSurvey = res.mergedSurvey;

                // Emit server event USER_ACTION_ON_SURVEY_QUESTION_CHANGED
                const userEventResult: any = await pepperi.events.emit(USER_ACTION_ON_SURVEY_QUESTION_CHANGED, {
                    SurveyView: res.mergedSurvey,
                    ChangedFields: res.changedFields,
                    ...objectPropsToAddEventData
                }, data);
                
                if (userEventResult?.data?.SurveyView) {
                    mergedSurvey = userEventResult.data.SurveyView;
                }
            }
        }

        return mergedSurvey;
    });

    /***********************************************************************************************/
    //                              Client Events for survey template
    /************************************************************************************************/
    
     // Handle on survey template load
     pepperi.events.intercept(CLIENT_ACTION_ON_CLIENT_SURVEY_TEMPLATE_LOAD as any, {}, async (data): Promise<any> => {
        const surveyTemplateKey = data.SurveyTemplateKey || undefined;
        const resourceName = data.ResourceName || undefined;
        
        let surveyTemplate: SurveyTemplate | null = null;
        let additionalFields = [];
        // debugger;
        
        if (surveyTemplateKey) { 
            const service = new SurveysService();
            
            surveyTemplate = await service.getSurveyTemplateData(data.client, surveyTemplateKey);
            
            // Emit server event USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD
            const objectPropsToAddEventData = await service.getObjectPropsForSurveyTemplateUserEvent(surveyTemplateKey);
            const userEventResult: any = await pepperi.events.emit(USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD, {
                SurveyTemplateKey: surveyTemplateKey,
                ResourceName: resourceName,
                ...objectPropsToAddEventData
            }, data);

            if (userEventResult?.data?.AdditionalFields) {
                additionalFields = userEventResult.data.AdditionalFields;
            }
        }

        return {
            surveyTemplate,
            additionalFields
        };
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
