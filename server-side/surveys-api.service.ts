import { PapiClient, InstalledAddon, AddonDataScheme, Relation, FindOptions, FileImportInput, FileExportInput, AddonData } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { DEFAULT_BLANK_SURVEY_DATA, ISurveyTemplateBuilderData, SurveyTemplate, SurveyTemplateRowProjection, 
    SURVEYS_BASE_TABLE_NAME, SURVEY_TEMPLATES_BASE_TABLE_NAME,
    SURVEY_TEMPLATES_TABLE_NAME, DRAFT_SURVEY_TEMPLATES_TABLE_NAME, SURVEYS_TABLE_NAME,
    USER_ACTION_ON_SURVEY_DATA_LOAD, USER_ACTION_ON_SURVEY_VIEW_LOAD, USER_ACTION_ON_SURVEY_FIELD_CHANGED, 
    USER_ACTION_ON_SURVEY_QUESTION_CHANGED, SURVEY_PFS_TABLE_NAME,
    USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD,
    CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD,
    CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHANGE,
    CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE,
    CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CLICK} from 'shared';

import { v4 as uuidv4 } from 'uuid';
import { SurveysValidatorService } from './surveys-validator.service';
import semver from 'semver';

const bundleFileName = 'survey_builder';
const TEMPLATE_SCHEME_NAME_PROPERTY = 'TemplateSchemaName';
export const JOURNEY_EVENTS_RELATION_NAME = 'JourneyEvent'

export class SurveyApiService {
    addonUUID: string;
    papiClient: PapiClient
    surveysValidatorService: SurveysValidatorService;
    private readonly SURVEY_ADDON_UUID = 'dd0a85ea-7ef0-4bc1-b14f-959e0372877a';

    constructor(private client: Client) {
        this.addonUUID = client.AddonUUID;
        this.surveysValidatorService = new SurveysValidatorService();

        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.ActionUUID
        });
    }

    private async createSchemeTables(): Promise<void> {
        // const promises: AddonDataScheme[] = [];

        const udcTempObject = {
            "DocumentKey":{"Delimiter":"@","Type":"AutoGenerate","Fields":[]},
            // "Fields":{"test":{"Description":"","Mandatory":false,"Type":"String","OptionalValues":[],"Items":{"Type":"String","Mandatory":false,"Description":""},"Resource":"","AddonUUID":"","Indexed":false}},
            // "ListView":{"Type":"Grid","Fields":[{"FieldID":"test","Mandatory":false,"ReadOnly":true,"Title":"test","Type":"TextBox"}],"Columns":[{"Width":10}]},
            "GenericResource":true
        };

        // Create Survey table
        const schema = {
            Name: SURVEYS_TABLE_NAME,
            Extends: {
                AddonUUID: this.SURVEY_ADDON_UUID,
                Name: SURVEYS_BASE_TABLE_NAME
            },
            SyncData: {
                Sync: true,
                PushLocalChanges: true,
            },
            Type: 'data',
            ...udcTempObject
        };
        const createSurveyTable = await this.papiClient.userDefinedCollections.schemes.upsert(schema as any);
        
        // Create Survey template table
        const schemaTemplate = {
            Name: SURVEY_TEMPLATES_TABLE_NAME,
            Extends: {
                AddonUUID: this.SURVEY_ADDON_UUID,
                Name: SURVEY_TEMPLATES_BASE_TABLE_NAME
            },
            SyncData: {
                Sync: true
            },
            Type: 'data',
            ...udcTempObject
        };
        const createSurveyTemplateTable = await this.papiClient.userDefinedCollections.schemes.upsert(schemaTemplate as any);
        
        // Create draft Survey template table
        const schemaDraftTemplate: AddonDataScheme = {
            Name: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
            Type: 'indexed_data',
            Fields: {
                TemplateSchemaName: {
                    Type: 'String',
                    Indexed: true
                }
            }
        };
        const createSurveyDraftTemplateTable = await this.papiClient.addons.data.schemes.post(schemaDraftTemplate);
        // const createSurveyDraftTemplateTable = await this.papiClient.userDefinedCollections.schemes.upsert(schemaDraftTemplate as any);
    }

    private async createPfsSchemeTables(): Promise<void> {
        // Create pfs table
        const schemaPfs: AddonDataScheme = {
            Name: SURVEY_PFS_TABLE_NAME,
            Type: 'pfs',
            SyncData: {
                Sync: true,
                PushLocalChanges: true,
            }
        };

        await this.papiClient.addons.data.schemes.post(schemaPfs);
    }

    private async upsertRelation(relation): Promise<any> {
        return await this.papiClient.addons.data.relations.upsert(relation);
    }
    
    private async upsertUserEventsRelation() {
        const surveyUserEventsRelation: Relation = {
            RelationName: "UDCEvents",
            Name: SURVEYS_BASE_TABLE_NAME,
            Description: `The user events for survey`,
            Type: "AddonAPI",
            AddonUUID: this.addonUUID,
            AddonRelativeURL: '/api/survey_user_events',
        }; 
        
        await this.upsertRelation(surveyUserEventsRelation);

        const surveyTemplateUserEventsRelation: Relation = {
            RelationName: "UDCEvents",
            Name: SURVEY_TEMPLATES_BASE_TABLE_NAME,
            Description: `The user events for survey template`,
            Type: "AddonAPI",
            AddonUUID: this.addonUUID,
            AddonRelativeURL: '/api/survey_template_user_events',
        }; 
        
        await this.upsertRelation(surveyTemplateUserEventsRelation);
    }

    private async upsertAddonBlockRelation() {
        const name = 'Surveys';
        const blockName = 'SurveyBuilder';

        const addonBlockRelation: Relation = {
            RelationName: "AddonBlock",
            Name: name,
            Description: `${name} addon block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: this.addonUUID,
            AddonRelativeURL: bundleFileName,
            ComponentName: `${blockName}Component`,
            ModuleName: `${blockName}Module`,
            ElementsModule: 'WebComponents',
            ElementName: `survey-element-${this.addonUUID}`,
        }; 
        
        await this.upsertRelation(addonBlockRelation);
    }

    private async upsertPageBlockRelation() {
        const blockRelationName = 'Survey';
        const blockName = 'Block';

        const blockRelation: Relation = {
            RelationName: 'PageBlock',
            Name: blockRelationName,
            Description: `${blockRelationName} block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: this.client.AddonUUID,
            AddonRelativeURL: bundleFileName,
            ComponentName: `${blockName}Component`, // This is should be the block component name (from the client-side)
            ModuleName: `${blockName}Module`, // This is should be the block module name (from the client-side)
            EditorComponentName: `${blockName}EditorComponent`, // This is should be the block editor component name (from the client-side)
            EditorModuleName: `${blockName}EditorModule`, // This is should be the block editor module name (from the client-side)}
            ElementsModule: 'WebComponents',
            ElementName: `${blockName.toLocaleLowerCase()}-element-${this.client.AddonUUID}`,
            EditorElementName: `${blockName.toLocaleLowerCase()}-editor-element-${this.client.AddonUUID}`
        };

        return await this.upsertRelation(blockRelation);
    }

    private async upsertSettingsRelation() {
        const blockName = 'Settings';
        const name = 'Surveys';

        const addonBlockRelation: Relation = {
            RelationName: "SettingsBlock",
            GroupName: name,
            SlugName: 'surveys',
            Name: name,
            Description: 'Survey Builder (Beta)',
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: this.addonUUID,
            AddonRelativeURL: bundleFileName,
            ComponentName: `${blockName}Component`,
            ModuleName: `${blockName}Module`,
            ElementsModule: 'WebComponents',
            ElementName: `settings-element-${this.addonUUID}`,
        }; 
        
        await this.upsertRelation(addonBlockRelation);
    }
    
    private async hideSurveyTemplate(templateResourceName: string, surveyTemplate: SurveyTemplate, isDraft: boolean = false): Promise<boolean> {
        if (!surveyTemplate) {
            return Promise.reject(null);
        }

        surveyTemplate.Hidden = true;
        const res = await this.upsertSurveyTemplateInternal(templateResourceName, surveyTemplate, isDraft);
        return Promise.resolve(res != null);
    }

    private async validateAndOverrideSurveyTemplateAccordingInterface(surveyTemplate: SurveyTemplate): Promise<SurveyTemplate> {
        // Validate survey template object before upsert.
        this.surveysValidatorService.validateSurveyTemplateProperties(surveyTemplate);
        
        // Validate survey template data.
        this.surveysValidatorService.validateSurveyTemplateData(surveyTemplate);

        // Override the survey template according the interface.
        return this.surveysValidatorService.getSurveyTemplateCopyAccordingInterface(surveyTemplate);
    }

    private getSurveyTemplateFromDraft(draft: AddonData) {
        let surveyTemplate;

        // Set surveyTemplate from the draft.JsonTemplate
        if (draft) {
            surveyTemplate = JSON.parse(draft.JsonTemplate);
            surveyTemplate['CreationDateTime'] = draft.CreationDateTime;
            surveyTemplate['ModificationDateTime'] = draft.ModificationDateTime;
        }
        
        return surveyTemplate;
    }

    private prepareDraftForUpsert(surveyTemplate: SurveyTemplate, templateResourceName: string): any {
        const draftToUpsert = {
            Key: surveyTemplate.Key,
            Hidden: surveyTemplate.Hidden,
            JsonTemplate: JSON.stringify(surveyTemplate)
        }

        draftToUpsert[TEMPLATE_SCHEME_NAME_PROPERTY] = templateResourceName || SURVEY_TEMPLATES_TABLE_NAME;

        return draftToUpsert;
    }

    private async upsertSurveyTemplateInternal(templateResourceName: string, surveyTemplate: SurveyTemplate, isDraft: boolean = false): Promise<SurveyTemplate> {
        if (!surveyTemplate) {
            return Promise.reject(null);
        }

        if (!surveyTemplate.Key) {
            surveyTemplate.Key = uuidv4();
        }

        // Validate survey template object before upsert.
        surveyTemplate = await this.validateAndOverrideSurveyTemplateAccordingInterface(surveyTemplate);
        
        if (!isDraft) {
            return await this.papiClient.resources.resource(templateResourceName).post(surveyTemplate) as Promise<SurveyTemplate>;
        } else {
            const draftToUpsert = this.prepareDraftForUpsert(surveyTemplate, templateResourceName);
            return await this.papiClient.addons.data.uuid(this.addonUUID).table(DRAFT_SURVEY_TEMPLATES_TABLE_NAME).upsert(draftToUpsert) as Promise<SurveyTemplate>;
        }
    }

    private async getSurveyTemplate(surveyTemplatekey: string, templateResourceName: string, isDraft: boolean = false): Promise<SurveyTemplate> {
        let surveyTemplate;
        
        if (!isDraft) {
            const surveyTemplates = (await this.papiClient.resources.resource(templateResourceName).search({ KeyList: [surveyTemplatekey] })).Objects;
            surveyTemplate = surveyTemplates.length > 0 ? surveyTemplates[0] : null;
        } else {
            const draft = await this.papiClient.addons.data.uuid(this.addonUUID).table(DRAFT_SURVEY_TEMPLATES_TABLE_NAME).key(surveyTemplatekey).get();
            surveyTemplate = this.getSurveyTemplateFromDraft(draft);
        }

        return surveyTemplate;
    }

    private async getSurveyTemplatesByResourceName(templateResourceName: string, isDraft: boolean = false): Promise<SurveyTemplate[]> {
        if (!isDraft) {
            // return await this.papiClient.resources.resource(templateResourceName).search({}) as SurveyTemplate[];
            return await this.papiClient.userDefinedCollections.documents(templateResourceName).find() as SurveyTemplate[];
        } else {
            const surveyTemplates: SurveyTemplate[] = [];
            const drafts = await this.papiClient.addons.data.uuid(this.addonUUID).table(DRAFT_SURVEY_TEMPLATES_TABLE_NAME).find({ where: `TemplateSchemaName='${templateResourceName}'`});
            
            // Build the drafts array.
            for (let index = 0; index < drafts.length; index++) {
                const draft = drafts[index];
                surveyTemplates.push(this.getSurveyTemplateFromDraft(draft));
            }

            return surveyTemplates;
        }
    }
    
    private getSurveyTemplateDataInternal(draftSurveyTemplate: SurveyTemplate, surveyTemplate: SurveyTemplate): SurveyTemplate {
        // Get the draft survey template if exist and not hidden, Else get the published survey template.
        const templateToReturn = draftSurveyTemplate && !draftSurveyTemplate.Hidden ? draftSurveyTemplate : surveyTemplate;
            
        // If there is published template, then set KeyDisabled to true on the questions that already published.
        if (surveyTemplate != null) {
            // Create a map of the published questions keys.
            const publishedQuestionsKeys = new Map<string, string>();
            
            for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
                const section = surveyTemplate.Sections[sectionIndex];
                
                for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                    const question = section.Questions[questionIndex];
                    publishedQuestionsKeys.set(question.Key, question.Key);
                }
            }
            
            // Set KeyDisabled to true on the questions that already published.
            for (let sectionIndex = 0; sectionIndex < templateToReturn.Sections.length; sectionIndex++) {
                const section = templateToReturn.Sections[sectionIndex];
                
                for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                    const question = section.Questions[questionIndex];
                    question.KeyDisabled = publishedQuestionsKeys.has(question.Key);
                }

            }
        }

        return templateToReturn;
    }

    private async migrateToV0_7_40(fromVersion: string) {
        // check if the upgrade is from versions before 0.7.41
        console.log('semver comperation' + semver.lt(fromVersion, '0.7.41') + ' fromVersion: ' + fromVersion);
        if (fromVersion && semver.lt(fromVersion, '0.7.41')) {
            await this.createSchemeTables();
        }
    }

    // TODO: Add Journey code when needed.
    // private async upsertEventsRelation(eventName, displayEventName, fields) {
    //     const relation = {
    //         Type: "AddonAPI",
    //         AddonUUID: this.addonUUID,
    //         DisplayEventName: displayEventName,
    //         RelationName: JOURNEY_EVENTS_RELATION_NAME,
    //         Name: eventName,
    //         Description: "",
    //         AddonRelativeURL: `/event_filters/get_filter_by_event?event=${eventName}&resourceName=${SURVEY_TEMPLATES_TABLE_NAME}`,
    //         Fields: fields,
    //     };

    //     await this.upsertRelation(relation);
    // }

    // TODO: Add Journey code when needed.
    // private async upsertJourneyEventsRelation() {
    //     const promises = [
    //         this.upsertEventsRelation(CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD, "Survey load", [{"FieldID": "SurveyKey"}]),
    //         this.upsertEventsRelation(CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHANGE, "Survey field change", [{"FieldID": "SurveyKey"}, {"FieldID": "ChangedFields"}]),
    //         this.upsertEventsRelation(CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE, "Survey question change", [{"FieldID": "SurveyKey"}, {"FieldID": "ChangedFields"}]),
    //         this.upsertEventsRelation(CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CLICK, "Survey question click", [{"FieldID": "SurveyKey"}, {"FieldID": "FieldID"}, {"FieldID": "Action"}]),
    //     ];
    //     Promise.all(promises);
    // }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    async performMigration(fromVersion, toVersion) {
        await this.migrateToV0_7_40(fromVersion);
    }

    async upsertRelationsAndScheme(install = true): Promise<void> {
        if (install) {
        }
        
        await this.createSchemeTables();
        await this.createPfsSchemeTables();

        await this.upsertImportRelation();
        await this.upsertExportRelation();
        await this.upsertUserEventsRelation();
        await this.upsertAddonBlockRelation();
        await this.upsertPageBlockRelation();
        await this.upsertSettingsRelation();

        // TODO: Add Journey code when needed.
        // await this.upsertJourneyEventsRelation();
    }
    
    async saveDraftSurveyTemplate(body: any): Promise<SurveyTemplate>  {
        const templateResourceName = body['resourceName'] || '';
        const surveyTemplate: SurveyTemplate = body['surveyTemplate'] || null;

        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else if (surveyTemplate === null) {
            throw new Error('surveyTemplate is not supplied.');
        } else {
            surveyTemplate.Hidden = false;
            return await this.upsertSurveyTemplateInternal(templateResourceName, surveyTemplate, true);
        }
    }

    async createDraftSurveyTemplate(query: any): Promise<SurveyTemplate> {
        const surveyNum = query['surveyNum'] || '0';
        const templateResourceName: string = query['resourceName'] || '';
        
        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else {
            let surveyTemplate = JSON.parse(JSON.stringify(DEFAULT_BLANK_SURVEY_DATA)) ;
            surveyTemplate.Name = `${surveyTemplate.Name} ${surveyNum}`;
            surveyTemplate.Description = `${surveyTemplate.Description} ${surveyNum}`;
    
            if (surveyTemplate.Sections.length === 1) {
                surveyTemplate.Sections[0].Key = uuidv4();
                surveyTemplate.Sections[0].Title = 'Section 1';
            }
    
            surveyTemplate.Key = '';
            return await this.upsertSurveyTemplateInternal(templateResourceName, surveyTemplate, true);
        }
    }

    async removeSurveyTemplate(query: any): Promise<boolean> {
        const surveyTemplatekey = query['key'] || '';
        const templateResourceName: string = query['resourceName'] || '';
        
        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else {
            let draftRes = false;
            let res = false;

            if (surveyTemplatekey.length > 0) {
                try {
                    let surveyTemplate = await this.getSurveyTemplate(surveyTemplatekey, templateResourceName, true);
                    draftRes = await this.hideSurveyTemplate(templateResourceName, surveyTemplate, true);
                } catch (e) {
                }
        
                try {
                    let surveyTemplate = await this.getSurveyTemplate(surveyTemplatekey, templateResourceName);
                    res = await this.hideSurveyTemplate(templateResourceName, surveyTemplate);
                } catch (e) {
                }
            }

            return Promise.resolve(draftRes || res);
        }
    }
    
    async duplicateSurveyTemplate(query: any): Promise<SurveyTemplate> {
        const templateResourceName: string = query['resourceName'] || '';

        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else {
            const surveyTemplateData: ISurveyTemplateBuilderData = await this.getSurveyTemplateData(query);

            const dupplicateTemplate: SurveyTemplate = JSON.parse(JSON.stringify(surveyTemplateData.surveyTemplate));
            dupplicateTemplate.Name = `${dupplicateTemplate.Name} copy`;
            delete dupplicateTemplate.Key;
            return await this.upsertSurveyTemplateInternal(templateResourceName, dupplicateTemplate, true);
        }
    }

    async getSurveyTemplatesData(query: any): Promise<SurveyTemplateRowProjection[]> {
        const templateResourceName: string = query['resourceName'] || '';

        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else {
            let surveyTemplates: SurveyTemplate[] = await this.getSurveyTemplatesByResourceName(templateResourceName);
            let draftSurveyTemplates: SurveyTemplate[] = await this.getSurveyTemplatesByResourceName(templateResourceName, true);

            //  Add the survey templates into map for distinct them.
            const distinctSurveyTemplatesMap = new Map<string, SurveyTemplate>();
            surveyTemplates.forEach(surveyTemplate => {
                if (surveyTemplate.Key) {
                    distinctSurveyTemplatesMap.set(surveyTemplate.Key, surveyTemplate);
                }
            });
            draftSurveyTemplates.forEach(draftSurveyTemplate => {
                if (draftSurveyTemplate.Key) {
                    distinctSurveyTemplatesMap.set(draftSurveyTemplate.Key, draftSurveyTemplate);
                }
            });

            // Convert the map values to array.
            let distinctSurveyTemplatesArray = Array.from(distinctSurveyTemplatesMap.values());
            
            // Filter.
            if (query?.where !== undefined && query?.where?.length > 0) {
                const searchString = query?.where;
                distinctSurveyTemplatesArray = distinctSurveyTemplatesArray.filter(surveyTemplate => surveyTemplate.Name?.includes(searchString) || surveyTemplate.Description?.includes(searchString))
            }

            const promise = new Promise<any[]>((resolve, reject): void => {
                let allSurveyTemplates = distinctSurveyTemplatesArray.map((surveyTemplate: SurveyTemplate) => {
                    const isPublished = surveyTemplates.some(published => published.Key === surveyTemplate.Key);
                    const draftSurvey = draftSurveyTemplates.find(draft => draft.Key === surveyTemplate.Key);
                    const isDraft = draftSurvey != null && !draftSurvey.Hidden;

                    // Return projection object.
                    const prp: SurveyTemplateRowProjection = {
                        Key: surveyTemplate.Key,
                        Name: surveyTemplate.Name,
                        Description: surveyTemplate.Description,
                        Active: surveyTemplate.Active,
                        ActiveDateRange: surveyTemplate.ActiveDateRange,
                        Draft: isDraft,
                        Published: isPublished,
                        ModificationDate: surveyTemplate.ModificationDateTime,
                    };

                    return prp;
                });

                // Sort.
                if (query?.order_by !== undefined && query?.order_by?.length > 0) {
                    const orderByArr = query?.order_by.split(' ');
                    const orderBy = orderByArr[0] || 'Name';
                    const isAsc = orderByArr.length === 2 ? orderByArr[1] === 'ASC' : true;

                    allSurveyTemplates = allSurveyTemplates.sort((p1, p2) =>
                        p1[orderBy] > p2[orderBy] ? 
                            (isAsc ? 1 : -1) : 
                            (p1[orderBy] < p2[orderBy] ? (isAsc ? -1 : 1) : 0)
                    );
                }

                resolve(allSurveyTemplates);
            });

            return promise;
        }
    }

    async getSurveyTemplateData(query: any): Promise<ISurveyTemplateBuilderData> {
        const templateResourceName: string = query['resourceName'] || '';
        const surveyTemplateKey = query['key'] || '';

        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else if (surveyTemplateKey === '') {
            throw new Error('key is not supplied.');
        } else {
            let res: any;
            let draftSurveyTemplate;
            
            // Try to get the survey template from the draft first.
            try {
                draftSurveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, templateResourceName, true);
            } catch {
                // Do nothing
            }

            // Get the publish survey template.
            const surveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, templateResourceName);
            
            res = {
                surveyTemplate: this.getSurveyTemplateDataInternal(draftSurveyTemplate, surveyTemplate),
                // published: surveyTemplate != null,
            }

            const promise = new Promise<ISurveyTemplateBuilderData>((resolve, reject): void => {
                resolve(res);
            });

            return promise;
        }
    }
    
    async publishSurveyTemplate(body: any): Promise<SurveyTemplate> {
        const templateResourceName = body['resourceName'] || '';
        const surveyTemplate: SurveyTemplate = body['surveyTemplate'] || null;

        if (templateResourceName === '') {
            throw new Error('resourceName is not supplied.');
        } else if (surveyTemplate === null) {
            throw new Error('surveyTemplate is not supplied.');
        } else {
            let res: SurveyTemplate | null = null;

            if (surveyTemplate) {
                // Save the current survey template.
                res = await this.upsertSurveyTemplateInternal(templateResourceName, surveyTemplate);

                // Update the draft survey template and hide it.
                if (res != null) {
                    const surveyTemplateCopy = JSON.parse(JSON.stringify(surveyTemplate));
                    this.hideSurveyTemplate(templateResourceName, surveyTemplateCopy, true);
                }
                
                return Promise.resolve(res);
            }

            return Promise.reject(null);
        }
    }

    /***********************************************************************************************/
    //                              Import & Export functions
    /************************************************************************************************/
    
    private async upsertImportRelation(): Promise<void> {
        const importRelation: Relation = {
            RelationName: 'DataImportResource',
            Name: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
            Description: 'Survey templates import',
            Type: 'AddonAPI',
            AddonUUID: this.addonUUID,
            AddonRelativeURL: '/internal_api/draft_survey_templates_import',
            MappingRelativeURL: ''
        };                

        await this.upsertRelation(importRelation);
    }

    private async upsertExportRelation(): Promise<void> {
        const exportRelation: Relation = {
            RelationName: 'DataExportResource',
            Name: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
            Description: 'Survey templates export',
            Type: 'AddonAPI',
            AddonUUID: this.addonUUID,
            AddonRelativeURL: '/internal_api/draft_survey_templates_export',
        };

        await this.upsertRelation(exportRelation);
    }

    private async getDIMXResultForImport(body: any): Promise<any> {
        // Validate the templates.
        if (body.DIMXObjects?.length > 0) {
            console.log('@@@@@@@@ getDIMXResultForImport - enter ', JSON.stringify(body));
            
            for (let index = 0; index < body.DIMXObjects.length; index++) {
                const dimxObject = body.DIMXObjects[index];
                try {
                    // Get the template for validate and set some properties.
                    const draft = dimxObject['Object'];
                    const surveyTemplate = await this.validateAndOverrideSurveyTemplateAccordingInterface(draft.JsonTemplate);

                    // Validate that the resource exist.
                    const scheme = await this.papiClient.userDefinedCollections.schemes.name(draft[TEMPLATE_SCHEME_NAME_PROPERTY]).get();
                    console.log('@@@@@@@@ getDIMXResultForImport - scheme ', scheme ? JSON.stringify(scheme) : 'null');
                    if (!scheme) {
                        throw new Error(`The scheme ${draft[TEMPLATE_SCHEME_NAME_PROPERTY]} does not exist.`);
                    }
                    
                    // For import generate new Key if not exist and set the Hidden to false.
                    surveyTemplate.Key = surveyTemplate.Key && surveyTemplate.Key.length > 0 ? surveyTemplate.Key : uuidv4();
                    surveyTemplate.Hidden = false;

                    draft.Key = surveyTemplate.Key;
                    draft.Hidden = surveyTemplate.Hidden;
                    draft.JsonTemplate = JSON.stringify(surveyTemplate);

                    // dimxObject['Object'] = draft;
                } catch (err) {
                    // Set the error on the page.
                    dimxObject['Status'] = 'Error';
                    dimxObject['Details'] = err;
                }
            }

            console.log('@@@@@@@@ getDIMXResultForImport - exit ', JSON.stringify(body));
        }
        
        return body;
    }

    private async getDIMXResultForExport(body: any): Promise<any> {
        // Validate the templates.
        if (body.DIMXObjects?.length > 0) {
            console.log('@@@@@@@@ getDIMXResultForExport - enter ', JSON.stringify(body));
            
            for (let index = 0; index < body.DIMXObjects.length; index++) {
                const dimxObject = body.DIMXObjects[index];
                try {
                    // Get the template from the draft for validate and set some properties.
                    const draft = dimxObject['Object'];
                    const draftTemplate = JSON.parse(draft.JsonTemplate);
                    await this.validateAndOverrideSurveyTemplateAccordingInterface(draftTemplate);
                    draft.JsonTemplate = draftTemplate; // Set the parsed template as object.

                    // Do not touch the dimxObject['Object'] keep the draft as is.
                    // ***********************************************************************************************
                    // const surveyTemplate = await this.validateAndOverrideSurveyTemplateAccordingInterface(JSON.parse(draft.JsonTemplate));
                    // // Copy the template scheme to set it later in the import.
                    // surveyTemplate[TEMPLATE_SCHEME_NAME_PROPERTY] = draft[TEMPLATE_SCHEME_NAME_PROPERTY];
                    // dimxObject['Object'] = surveyTemplate;
                } catch (err) {
                    // Set the error on the page.
                    dimxObject['Status'] = 'Error';
                    dimxObject['Details'] = err;
                }
            }

            console.log('@@@@@@@@ getDIMXResultForExport - exit ', JSON.stringify(body));
        }
        
        return body;
    }

    async importSurveyTemplates(body: any, draft = true): Promise<any> {
        console.log('@@@@@@@@ importSurveyTemplates - before getDIMXResult');
        const res = await this.getDIMXResultForImport(body);
        console.log('@@@@@@@@ importSurveyTemplates - after getDIMXResult');
        return res;
    }
    
    async exportSurveyTemplates(body: any, draft = true): Promise<any> {
        const res = await this.getDIMXResultForExport(body);
        return res;
    }

    // async importSurveyTemplateFile(body: FileImportInput) {
    //     return await this.papiClient.addons.data.import.file.uuid(this.addonUUID).table(DRAFT_SURVEY_TEMPLATES_TABLE_NAME).upsert(body);
    // }

    // async exportSurveyTemplateFile(body: FileExportInput) {
    //     return await this.papiClient.addons.data.export.file.uuid(this.addonUUID).table(DRAFT_SURVEY_TEMPLATES_TABLE_NAME).get(body);
    // }

    /***********************************************************************************************/
    //                              User Events functions
    /************************************************************************************************/
    
    getSurveyUserEvents(query: any) {
        const changedFieldsSchema = {
            Type: 'Array',
            Items: {
                Type: "Object",
                Fields: {
                    FieldID: {
                        Type: "String"
                    },
                    NewValue: {
                        Type: "String"
                    },
                    OldValue: {
                        Type: "String"
                    }
                }
            }
        };

        const events = {
            "Events": [
                {
                    Title: 'On survey data load',
                    EventKey: USER_ACTION_ON_SURVEY_DATA_LOAD,
                    EventData: {
                        SurveyKey: {
                            Type: 'String'
                        }
                    }
                }, {
                    Title: 'On survey view load',
                    EventKey: USER_ACTION_ON_SURVEY_VIEW_LOAD,
                    EventData: {
                        SurveyView: {
                            Type: 'Object'
                        }
                    }
                }, {
                    Title: 'On survey field changed',
                    EventKey: USER_ACTION_ON_SURVEY_FIELD_CHANGED,
                    EventData: {
                        SurveyView: {
                            Type: 'Object'
                        },
                        ChangedFields: changedFieldsSchema 
                    },
                    // Fields: [{
                    //     "FieldID": "StatusName",
                    //     "Title": "Survey StatusName"
                    // }],
                }, {
                    Title: 'On survey question changed',
                    EventKey: USER_ACTION_ON_SURVEY_QUESTION_CHANGED,
                    EventData: {
                        SurveyView: {
                            Type: 'Object'
                        },
                        ChangedFields: changedFieldsSchema 
                    },
                    // Fields: [{
                    //     "FieldID": "QuestionKey",
                    //     "Title": "Question Key"
                    // }],
                }
            ]
        }

        return events;
    }
    
    getSurveyTemplatesUserEvents(query: any) {
        const events = {
            "Events": [{
                Title: 'On survey template data load',
                EventKey: USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD,
                EventData: {
                    SurveyTemplateKey: {
                        Type: 'String'
                    },
                    ResourceName: {
                        Type: 'String'
                    }
                }
            }]
        }

        return events;
    }


    /***********************************************************************************************/
    //                              Journey functions
    /************************************************************************************************/
    
    // TODO: Add Journey code when needed.
    // async getSurveysOptionalValues(query: any): Promise<{Key: string, Value: any}[]> {
    //     let res: {Key: string, Value: any}[] = [];
    //     const templateResourceName: string = query['resourceName'] || SURVEY_TEMPLATES_TABLE_NAME;
    //     const drafts = await this.getSurveyTemplatesByResourceName(templateResourceName, true);

    //     if (drafts?.length > 0) {
    //         res = drafts.map(draft => {
    //             return { Key: draft.Key || '', Value: draft.Name }
    //         });
    //     }

    //     return res;
    // }
}

export default SurveyApiService;