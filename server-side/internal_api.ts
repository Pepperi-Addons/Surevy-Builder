import { SurveyApiService } from './surveys-api.service'
import { Client, Request } from '@pepperi-addons/debug-server'

export async function create_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        const templateResourceName: string = request.query['resourceName'];

        if (templateResourceName) {
            return service.createDraftSurveyTemplate(templateResourceName, request.query);
        }
    } catch(err) {
        throw new Error(`Failed to create survey. error - ${err}`);
    }
}

export async function remove_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        const templateResourceName: string = request.query['resourceName'];

        if (templateResourceName) {
            return service.removeSurveyTemplate(templateResourceName, request.query);
        }
    } catch(err) {
        throw new Error(`Failed to remove survey. error - ${err}`);
    }
}

export async function get_survey_templates_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        const templateResourceName: string = request.query['resourceName'];

        if (templateResourceName) {
            return service.getSurveyTemplatesData(templateResourceName, request.query);
        }
    } catch(err) {
        throw new Error(`Failed to get surveys data. error - ${err}`);
    }
};

export async function get_survey_template_builder_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveyTemplateData(request?.query, true);
    } catch(err) {
        throw new Error(`Failed to get survey builder data. error - ${err}`);
    }
};

export async function save_draft_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        const resourceName = request.body['resourceName'];
        const surveyTemplate = request.body['surveyTemplate'];

        return service.saveDraftSurveyTemplate(resourceName, surveyTemplate);
    } catch(err) {
        throw new Error(`Failed to save survey. error - ${err}`);
    }
}

export async function publish_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        const resourceName = request.body['resourceName'];
        const surveyTemplate = request.body['surveyTemplate'];

        return service.publishSurveyTemplate(resourceName, surveyTemplate);
    } catch(err) {
        throw new Error(`Failed to publish survey. error - ${err}`);
    }
};
