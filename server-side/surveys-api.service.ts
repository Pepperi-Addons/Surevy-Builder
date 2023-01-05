import { PapiClient, InstalledAddon, AddonDataScheme, Relation, FindOptions } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { DEFAULT_BLANK_SURVEY_DATA, ISurveyTemplateBuilderData, SurveyTemplate, SurveyTemplateRowProjection, 
    SURVEYS_BASE_TABLE_NAME, SURVEY_TEMPLATES_BASE_TABLE_NAME,
    SURVEY_TEMPLATES_TABLE_NAME, DRAFT_SURVEY_TEMPLATES_TABLE_NAME, SURVEYS_TABLE_NAME,
    USER_ACTION_ON_SURVEY_DATA_LOAD, USER_ACTION_ON_SURVEY_VIEW_LOAD, USER_ACTION_ON_SURVEY_FIELD_CHANGED, 
    USER_ACTION_ON_SURVEY_QUESTION_CHANGED, 
    USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD} from 'shared';

import { v4 as uuidv4 } from 'uuid';
import { SurveysValidatorService } from './surveys-validator.service';

const bundleFileName = 'survey_builder';
const TEMPLATE_SCHEME_NAME_PROPERTY = 'TemplateSchemaName';

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
                Sync: true
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
            Type: 'meta_data',
            ...udcTempObject
        };
        const createSurveyTemplateTable = await this.papiClient.userDefinedCollections.schemes.upsert(schemaTemplate as any);
        
        // Create draft Survey template table
        const schemaDraftTemplate = {
            Name: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
            Type: 'indexed_data',
            Fields: {
                TemplateSchemaName: {
                    Type: 'String',
                    Indexed: true
                }
            }
        };
        const createSurveyDraftTemplateTable = await this.papiClient.addons.data.schemes.post(schemaDraftTemplate as any);
        // const createSurveyDraftTemplateTable = await this.papiClient.userDefinedCollections.schemes.upsert(schemaDraftTemplate as any);

        // promises.push(createSurveyTable);
        // promises.push(createSurveyTemplateTable);
        // promises.push(createSurveyDraftTemplateTable);
        // return Promise.all(promises);
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
            // Prepare the object
            const draftToUpsert = {
                Key: surveyTemplate.Key,
                JsonTemplate: JSON.stringify(surveyTemplate)
            }
            
            draftToUpsert[TEMPLATE_SCHEME_NAME_PROPERTY] = templateResourceName;
            
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

            // Set surveyTemplate from the draft.JsonTemplate
            if (draft) {
                surveyTemplate = JSON.parse(draft.JsonTemplate);
            }
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
                surveyTemplates.push(JSON.parse(draft.JsonTemplate));
            }

            return surveyTemplates;
        }
    }
    
    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    async upsertRelationsAndScheme(install = true): Promise<void> {
        if (install) {
            await this.createSchemeTables();
        }

        await this.upsertUserEventsRelation();
        await this.upsertAddonBlockRelation();
        await this.upsertPageBlockRelation();
        await this.upsertSettingsRelation();
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
            let surveyTemplate;
            
            // Try to get the survey template from the draft first.
            try {
                // Get the survey template from the drafts.
                draftSurveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, templateResourceName, true);
            } catch {
                // Do nothing
            }

            // If draft is hidden or not exist add call to bring the publish survey template.
            if (!draftSurveyTemplate || draftSurveyTemplate.Hidden) {
                surveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, templateResourceName);
            }
                
            res = {
                surveyTemplate: surveyTemplate ? surveyTemplate : draftSurveyTemplate, // Get the publish survey template if exist in the array cause we populate it only if the draft is hidden or not exist.
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
                    //     "FieldID": "Status",
                    //     "Title": "Survey Status"
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
}

export default SurveyApiService;