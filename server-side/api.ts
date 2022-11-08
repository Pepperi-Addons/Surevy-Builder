import SurveyApiService from './surveys-api.service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function get_survey(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurvey(request?.query['key']);
    } catch(err) {
        throw new Error(`Failed to get survey. error - ${err}`);
    }
}

export async function surveys(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        let res;

        if (request.method === 'POST') {
            res = service.publishSurvey(request.body);
        } else if (request.method === 'GET') {
            res = service.getSurveys(request.query);
        } else {
            throw new Error(`Method ${request.method} is not supported.`);
        }

        return res;
    } catch(err) {
        throw err;
    }
}