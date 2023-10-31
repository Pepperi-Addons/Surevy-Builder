import { Client, Request } from '@pepperi-addons/debug-server'
import { CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHANGE, CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE, CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CLICK } from 'shared';
import { SurveyApiService } from './surveys-api.service'

// TODO: Add Journey code when needed.
// export async function get_filter_by_event(client: Client, request: Request): Promise<any> {

//     if (request.method === 'GET') {
//         const service = new SurveyApiService(client);
//         const surveysOptionalValues: {Key: string, Value: any}[] = await service.getSurveysOptionalValues(request.query);

//         const eventString = request.query.event;
//         const fields: any[] = [{
//             FieldID: "SurveyKey",
//             FieldType: "MultipleStringValues",
//             Title: "Survey key",
//             OptionalValues: surveysOptionalValues
//         }];

//         if ((eventString === CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHANGE) || 
//             (eventString === CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE)) {
//             fields.push({
//                 FieldID: "ChangedFields.FieldID",
//                 FieldType: "String",
//                 Title: "Change field id",
//             });
//         } else if (eventString === CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CLICK) {
//             fields.push({
//                 FieldID: "FieldID",
//                 FieldType: "String",
//                 Title: "Field id",
//             });
//         }
        
//         return {
//             Fields: fields
//         };

//     } else {
//         throw new Error('Method not supported')
//     }
// }