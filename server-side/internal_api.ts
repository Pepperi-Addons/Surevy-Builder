import { SurveyApiService } from './surveys-api.service'
import { Client, Request } from '@pepperi-addons/debug-server'

export async function create_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.createTemplateSurvey(request.query);
    } catch(err) {
        throw new Error(`Failed to create survey. error - ${err}`);
    }
}

export async function remove_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.removeSurvey(request.query);
    } catch(err) {
        throw new Error(`Failed to remove survey. error - ${err}`);
    }
}

export async function get_survey_templates_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveysData(request.query);
    } catch(err) {
        throw new Error(`Failed to get surveys data. error - ${err}`);
    }
};

export async function get_survey_template_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveyData(request?.query);
    } catch(err) {
        throw new Error(`Failed to get survey data. error - ${err}`);
    }
}

export async function get_survey_template_builder_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveyData(request?.query, true);
    } catch(err) {
        throw new Error(`Failed to get survey builder data. error - ${err}`);
    }
};

export async function save_draft_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.saveDraftSurvey(request.body);
    } catch(err) {
        throw new Error(`Failed to save survey. error - ${err}`);
    }
}

// export async function restore_to_last_publish(client: Client, request: Request): Promise<any> {
//     try {
//         const service = new SurveyApiService(client);
//         return service.restoreToLastPublish(request.query);
//     } catch(err) {
//         throw new Error(`Failed to restore to last publish. error - ${err}`);
//     }
// }

export async function publish_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.publishSurvey(request.body);
    } catch(err) {
        throw new Error(`Failed to publish survey. error - ${err}`);
    }
};
