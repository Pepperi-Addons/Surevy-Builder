import { SurveyApiService } from './surveys-api.service'
import { Client, Request } from '@pepperi-addons/debug-server'

export async function create_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.createDraftSurveyTemplate(request.query);
    } catch(err) {
        throw new Error(`Failed to create survey. error - ${err}`);
    }
}

export async function remove_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.removeSurveyTemplate(request.query);
    } catch(err) {
        throw new Error(`Failed to remove survey. error - ${err}`);
    }
}

export async function duplicate_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.duplicateSurveyTemplate(request.query);
    } catch(err) {
        throw new Error(`Failed to duplicate survey. error - ${err}`);
    }
}

export async function get_survey_templates_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveyTemplatesData(request.query);
    } catch(err) {
        throw new Error(`Failed to get surveys data. error - ${err}`);
    }
};

export async function get_survey_template_builder_data(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.getSurveyTemplateData(request.query);
    } catch(err) {
        throw new Error(`Failed to get survey builder data. error - ${err}`);
    }
};

export async function save_draft_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.saveDraftSurveyTemplate(request.body);
    } catch(err) {
        throw new Error(`Failed to save survey. error - ${err}`);
    }
}

export async function publish_survey_template(client: Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return service.publishSurveyTemplate(request.body);
    } catch(err) {
        throw new Error(`Failed to publish survey. error - ${err}`);
    }
};

/***********************************************************************************************/
//                              Import & Export functions
/************************************************************************************************/
  
export async function draft_survey_templates_import(client:Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        console.log('@@@@@@@@ draft_pages_import - before importPages ', JSON.stringify(request.body));
        const res = await service.importSurveyTemplates(request.body);
        console.log('@@@@@@@@ draft_pages_import - after importPages ', JSON.stringify(res));
        return res;
    } catch(err) {
        throw err;
    }
}

export async function draft_survey_templates_export(client:Client, request: Request): Promise<any> {
    try {
        const service = new SurveyApiService(client);
        return await service.exportSurveyTemplates(request.body);
    } catch(err) {
        throw err;
    }
}
