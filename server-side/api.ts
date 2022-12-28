import SurveyApiService from './surveys-api.service'
import { Client, Request } from '@pepperi-addons/debug-server'

// export async function surveyTemplates(client: Client, request: Request): Promise<any> {
//     try {
//         const service = new SurveyApiService(client);
//         let res;

//         if (request.method === 'POST') {
//             res = service.publishSurvey(request.body);
//         } else if (request.method === 'GET') {
//             res = service.getSurveyTemplates(request.query);
//         } else {
//             throw new Error(`Method ${request.method} is not supported.`);
//         }

//         return res;
//     } catch(err) {
//         throw err;
//     }
// }


export async function survey_user_events(client:Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        let res;
        
        if (request.method === 'GET') {
            res = service.getSurveyUserEvents(request.query);
        } else {
            throw new Error(`Method ${request.method} is not supported.`);
        }

        return res;
    } catch(err) {
        throw err;
    }
}
