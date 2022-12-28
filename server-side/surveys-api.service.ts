import { PapiClient, InstalledAddon, AddonDataScheme, Relation, FindOptions } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { DEFAULT_BLANK_SURVEY_DATA, ISurveyTemplateBuilderData, SurveyTemplate, SurveyTemplateRowProjection, 
    SURVEYS_BASE_TABLE_NAME, SURVEY_TEMPLATES_BASE_TABLE_NAME, 
    SURVEY_TEMPLATES_TABLE_NAME, DRAFT_SURVEY_TEMPLATES_TABLE_NAME, SURVEYS_TABLE_NAME,
    USER_ACTION_ON_SURVEY_DATA_LOAD, USER_ACTION_ON_SURVEY_VIEW_LOAD, USER_ACTION_ON_SURVEY_FIELD_CHANGED, USER_ACTION_ON_SURVEY_QUESTION_CHANGED } from 'shared';

import { v4 as uuidv4 } from 'uuid';
import { SurveysValidatorService } from './surveys-validator.service';

const bundleFileName = 'survey_builder';

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

    private async createSurveyTablesSchemes(): Promise<void> {
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
        const createSurveyDraftTemplateTable = await this.papiClient.userDefinedCollections.schemes.upsert(schemaDraftTemplate as any);
        // const createSurveyDraftTemplateTable = await this.papiClient.addons.data.schemes.post(schemaDraftTemplate as any);

        // promises.push(createSurveyTable);
        // promises.push(createSurveyTemplateTable);
        // promises.push(createSurveyDraftTemplateTable);
        // return Promise.all(promises);
    }

    // For survey block template
    private async upsertRelation(relation): Promise<any> {
        return await this.papiClient.addons.data.relations.upsert(relation);
    }
    
    private async upsertUserEventsRelation() {
        const userEventsRelation: Relation = {
            RelationName: "UDCEvents",
            Name: SURVEYS_BASE_TABLE_NAME,
            Description: `The user events`,
            Type: "AddonAPI",
            AddonUUID: this.addonUUID,
            AddonRelativeURL: '/api/survey_user_events',
        }; 
        
        await this.upsertRelation(userEventsRelation);
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
    
    private async hideSurvey(survey: SurveyTemplate, tableName: string): Promise<boolean> {
        if (!survey) {
            return Promise.reject(null);
        }

        survey.Hidden = true;
        const res = await this.upsertSurveyTemplateInternal(survey, tableName);
        return Promise.resolve(res != null);
    }

    private async validateAndOverrideSurveyTemplateAccordingInterface(surveyTemplate: SurveyTemplate, validateSurveysLimit: boolean): Promise<SurveyTemplate> {
        // Validate survey template object before upsert.
        this.surveysValidatorService.validateSurveyTemplateProperties(surveyTemplate);
        
        // Validate survey template data.
        this.surveysValidatorService.validateSurveyTemplateData(surveyTemplate);

        // Override the survey template according the interface.
        return this.surveysValidatorService.getSurveyTemplateCopyAccordingInterface(surveyTemplate);
    }

    private async upsertSurveyTemplateInternal(survey: SurveyTemplate, tableName = SURVEY_TEMPLATES_TABLE_NAME): Promise<SurveyTemplate> {
        if (!survey) {
            return Promise.reject(null);
        }

        if (!survey.Key) {
            survey.Key = uuidv4();
        }

        // Validate survey object before upsert.
        survey = await this.validateAndOverrideSurveyTemplateAccordingInterface(survey, tableName === SURVEY_TEMPLATES_TABLE_NAME);
        
        return this.papiClient.userDefinedCollections.documents(tableName).upsert(survey) as Promise<SurveyTemplate>;
        // return this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).upsert(survey) as Promise<SurveyTemplate>;
    }

    /***********************************************************************************************/
    /*                                  Protected functions
    /***********************************************************************************************/

    protected async getSurveysFrom(tableName: string, options: FindOptions | undefined = undefined): Promise<SurveyTemplate[]> {
        return await this.papiClient.userDefinedCollections.documents(tableName).find(options) as SurveyTemplate[];
        // return await this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).find(options) as SurveyTemplate[];
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    async getSurvey(surveyTemplatekey: string, tableName: string = SURVEY_TEMPLATES_TABLE_NAME): Promise<SurveyTemplate> {
        const surveys = await this.papiClient.userDefinedCollections.documents(tableName).find();
        const survey = surveys.find(s => s.Key === surveyTemplatekey);
        if (survey) {
            return survey as SurveyTemplate;
        }
        else {
            throw new Error(`survey with Key ${surveyTemplatekey} not found`);
        }
        // return (await this.papiClient.userDefinedCollections.documents(tableName).find({ where: "Key=" + surveyTemplatekey}))[0] as SurveyTemplate;

        // return await this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).key(surveyTemplatekey).get() as SurveyTemplate;
    }

    async upsertRelationsAndScheme(install = true): Promise<void> {
        if (install) {
            await this.createSurveyTablesSchemes();
        }

        await this.upsertUserEventsRelation();
        await this.upsertAddonBlockRelation();
        await this.upsertPageBlockRelation();
        await this.upsertSettingsRelation();
    }

    async getSurveyTemplates(options: FindOptions | undefined = undefined): Promise<SurveyTemplate[]> {
        return await this.getSurveysFrom(SURVEY_TEMPLATES_TABLE_NAME, options);
    }
    
    saveDraftSurvey(survey: SurveyTemplate): Promise<SurveyTemplate>  {
        survey.Hidden = false;
        return this.upsertSurveyTemplateInternal(survey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
    }

    async createTemplateSurvey(query: any): Promise<SurveyTemplate> {
        const surveyNum = query['surveyNum'] || '0';
        
        let survey = JSON.parse(JSON.stringify(DEFAULT_BLANK_SURVEY_DATA)) ;
        survey.Name = `${survey.Name} ${surveyNum}`;
        survey.Description = `${survey.Description} ${surveyNum}`;

        if (survey.Sections.length === 1) {
            survey.Sections[0].Key = uuidv4();
            survey.Sections[0].Title = 'Section 1';
        }

        survey.Key = '';
        return this.upsertSurveyTemplateInternal(survey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
    }

    async removeSurvey(query: any): Promise<boolean> {
        const surveyTemplatekey = query['key'] || '';
        
        let draftRes = false;
        let res = false;

        if (surveyTemplatekey.length > 0) {
            try {
                let survey = await this.getSurvey(surveyTemplatekey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
                draftRes = await this.hideSurvey(survey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
            } catch (e) {
            }
    
            try {
                let survey = await this.getSurvey(surveyTemplatekey, SURVEY_TEMPLATES_TABLE_NAME);
                res = await this.hideSurvey(survey, SURVEY_TEMPLATES_TABLE_NAME);
            } catch (e) {
            }
        }

        return Promise.resolve(draftRes || res);
    }

    async getSurveysData(options: FindOptions | undefined = undefined): Promise<SurveyTemplateRowProjection[]> {
        let surveys: SurveyTemplate[] = await this.getSurveysFrom(SURVEY_TEMPLATES_TABLE_NAME);
        let draftSurveys: SurveyTemplate[] = await this.getSurveysFrom(DRAFT_SURVEY_TEMPLATES_TABLE_NAME);

        //  Add the surveys into map for distinct them.
        const distinctSurveysMap = new Map<string, SurveyTemplate>();
        surveys.forEach(survey => {
            if (survey.Key) {
                distinctSurveysMap.set(survey.Key, survey);
            }
        });
        draftSurveys.forEach(draftSurvey => {
            if (draftSurvey.Key) {
                distinctSurveysMap.set(draftSurvey.Key, draftSurvey);
            }
        });

        // Convert the map values to array.
        let distinctSurveysArray = Array.from(distinctSurveysMap.values());
        
        // Filter.
        if (options?.where !== undefined && options?.where?.length > 0) {
            const searchString = options?.where;
            distinctSurveysArray = distinctSurveysArray.filter(survey => survey.Name?.includes(searchString) || survey.Description?.includes(searchString))
        }

        const promise = new Promise<any[]>((resolve, reject): void => {
            let allSurveys = distinctSurveysArray.map((survey: SurveyTemplate) => {
                const isPublished = surveys.some(published => published.Key === survey.Key);
                const draftSurvey = draftSurveys.find(draft => draft.Key === survey.Key);
                const isDraft = draftSurvey != null && !draftSurvey.Hidden;

                // Return projection object.
                const prp: SurveyTemplateRowProjection = {
                    Key: survey.Key,
                    Name: survey.Name,
                    Description: survey.Description,
                    Active: survey.Active,
                    ActiveDateRange: survey.ActiveDateRange,
                    Draft: isDraft,
                    Published: isPublished,
                    ModificationDate: survey.ModificationDateTime,
                };

                return prp;
            });

            // Sort.
            if (options?.order_by !== undefined && options?.order_by?.length > 0) {
                const orderByArr = options?.order_by.split(' ');
                const orderBy = orderByArr[0] || 'Name';
                const isAsc = orderByArr.length === 2 ? orderByArr[1] === 'ASC' : true;

                allSurveys = allSurveys.sort((p1, p2) =>
                    p1[orderBy] > p2[orderBy] ? 
                        (isAsc ? 1 : -1) : 
                        (p1[orderBy] < p2[orderBy] ? (isAsc ? -1 : 1) : 0)
                );
            }

            resolve(allSurveys);
        });

        return promise;
    }

    async getSurveyData(query: any, lookForDraft = false): Promise<ISurveyTemplateBuilderData> {
        let res: any;
        const surveyTemplateKey = query['key'] || '';
        
        if (surveyTemplateKey) {
            let survey;
            
            // If lookForDraft try to get the survey from the draft first (for runtime the lookForDraft will be false).
            if (lookForDraft) {
                try {
                    // Get the survey from the drafts.
                    survey = await this.getSurvey(surveyTemplateKey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
                } catch {
                    // Do nothing
                }
            }

            const dataPromises: Promise<any>[] = [];
            
            // If draft is hidden or not exist add call to bring the publish survey.
            if (!survey || survey.Hidden) {
                dataPromises.push(this.getSurvey(surveyTemplateKey, SURVEY_TEMPLATES_TABLE_NAME));
            }
                
            const arr = await Promise.all(dataPromises).then(res => res);

            res = {
                survey: arr.length > 0 ? arr[0] : survey, // Get the publish survey if exist in the array cause we populate it only if the draft is hidden or not exist.
            }
        }

        const promise = new Promise<ISurveyTemplateBuilderData>((resolve, reject): void => {
            resolve(res);
        });

        return promise;
    }
    
    // async restoreToLastPublish(query: any): Promise<SurveyTemplate> {
    //     const surveyTemplatekey = query['key'];

    //     if (surveyTemplatekey) {
    //         let survey = await this.getSurvey(surveyTemplatekey, SURVEY_TEMPLATES_TABLE_NAME);

    //         // In case that the survey was never published.
    //         if (!survey) {
    //             survey = await this.getSurvey(surveyTemplatekey, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
    //             return this.publishSurvey(survey);
    //         } else {
    //             const surveyCopy = JSON.parse(JSON.stringify(survey));
    //             await this.hideSurvey(surveyCopy, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
    //             return surveyCopy;
    //         }
    //     }
        
    //     return Promise.reject(null);
    // }

    async publishSurvey(survey: SurveyTemplate): Promise<SurveyTemplate> {
        let res: SurveyTemplate | null = null;

        if (survey) {
            // Save the current survey in surveys table
            res = await this.upsertSurveyTemplateInternal(survey, SURVEY_TEMPLATES_TABLE_NAME);

            // Update the draft survey and hide it.
            if (res != null) {
                const surveyCopy = JSON.parse(JSON.stringify(survey));
                this.hideSurvey(surveyCopy, DRAFT_SURVEY_TEMPLATES_TABLE_NAME);
            }
            
            return Promise.resolve(res);
        }

        return Promise.reject(null);
    }

    getSurveyUserEvents(query: any) {
        const events = {
            "Events": [{
                Title: 'On survey data load',
                EventKey: USER_ACTION_ON_SURVEY_DATA_LOAD
            }, {
                Title: 'On survey view load',
                EventKey: USER_ACTION_ON_SURVEY_VIEW_LOAD
            }, {
                Title: 'On survey field changed',
                EventKey: USER_ACTION_ON_SURVEY_FIELD_CHANGED,
                // Fields: [{
                //     "FieldID": "Status",
                //     "Title": "Survey Status"
                // }],
            }, {
                Title: 'On survey question changed',
                EventKey: USER_ACTION_ON_SURVEY_QUESTION_CHANGED,
                // Fields: [{
                //     "FieldID": "QuestionKey",
                //     "Title": "Question Key"
                // }],
            }]
        }

        return events;
    }
}

export default SurveyApiService;