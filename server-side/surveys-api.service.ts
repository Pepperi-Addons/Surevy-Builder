import { PapiClient, InstalledAddon, AddonDataScheme, Relation, FindOptions } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { DEFAULT_BLANK_SURVEY_DATA, ISurveyTemplateBuilderData, SurveyTemplate, SurveyTemplateRowProjection, SURVEYS_TABLE_NAME, DRAFT_SURVEYS_TABLE_NAME } from 'shared';
import { v4 as uuidv4 } from 'uuid';
import { SurveysValidatorService } from './surveys-validator.service';

const bundleFileName = 'survey_builder';

export class SurveyApiService {
    addonUUID: string;
    papiClient: PapiClient
    surveysValidatorService: SurveysValidatorService;

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

    private async createSurveyTablesSchemes(): Promise<AddonDataScheme[]> {
        const promises: AddonDataScheme[] = [];

        // Create Survey table
        const createSurveyTable = await this.papiClient.addons.data.schemes.post({
            Name: SURVEYS_TABLE_NAME,
            Type: 'meta_data',
            SyncData: {
                Sync: true
            }
        });
        
        // Create Survey draft table
        const createSurveyDraftTable = await this.papiClient.addons.data.schemes.post({
            Name: DRAFT_SURVEYS_TABLE_NAME,
            Type: 'meta_data',
        });

        promises.push(createSurveyTable);
        promises.push(createSurveyDraftTable);
        return Promise.all(promises);
    }


    // For survey block template
    private upsertRelation(relation): Promise<any> {
        return this.papiClient.post('/addons/data/relations', relation);
    }
    
    private upsertAddonBlockRelation() {
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
        
        this.upsertRelation(addonBlockRelation);
    }

    private upsertPageBlockRelation() {
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

        return this.upsertRelation(blockRelation);
    }

    private upsertSettingsRelation() {
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
        
        this.upsertRelation(addonBlockRelation);
    }
    
    private async hideSurvey(survey: SurveyTemplate, tableName: string): Promise<boolean> {
        if (!survey) {
            return Promise.reject(null);
        }

        survey.Hidden = true;
        const res = await this.upsertSurveyInternal(survey, tableName);
        return Promise.resolve(res != null);
    }

    private async validateAndOverrideSurveyAccordingInterface(survey: SurveyTemplate, validateSurveysLimit: boolean): Promise<SurveyTemplate> {
        // Validate survey object before upsert.
        this.surveysValidatorService.validateSurveyProperties(survey);
        
        // Validate survey data.
        this.surveysValidatorService.validateSurveyData(survey);

        // Override the survey according the interface.
        return this.surveysValidatorService.getSurveyCopyAccordingInterface(survey);
    }

    private async upsertSurveyInternal(survey: SurveyTemplate, tableName = SURVEYS_TABLE_NAME): Promise<SurveyTemplate> {
        if (!survey) {
            return Promise.reject(null);
        }

        if (!survey.Key) {
            survey.Key = uuidv4();
        }

        // Validate survey object before upsert.
        survey = await this.validateAndOverrideSurveyAccordingInterface(survey, tableName === SURVEYS_TABLE_NAME);
        
        return this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).upsert(survey) as Promise<SurveyTemplate>;
    }

    /***********************************************************************************************/
    /*                                  Protected functions
    /***********************************************************************************************/

    protected async getSurveysFrom(tableName: string, options: FindOptions | undefined = undefined): Promise<SurveyTemplate[]> {
        return await this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).find(options) as SurveyTemplate[];
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    async getSurvey(surveyTemplatekey: string, tableName: string = SURVEYS_TABLE_NAME): Promise<SurveyTemplate> {
        return await this.papiClient.addons.data.uuid(this.addonUUID).table(tableName).key(surveyTemplatekey).get() as SurveyTemplate;
    }

    async upsertRelationsAndScheme(install = true): Promise<void> {
        if (install) {
            this.createSurveyTablesSchemes();
        }

        this.upsertAddonBlockRelation();
        this.upsertPageBlockRelation();
        this.upsertSettingsRelation();
    }

    async getSurveys(options: FindOptions | undefined = undefined): Promise<SurveyTemplate[]> {
        return await this.getSurveysFrom(SURVEYS_TABLE_NAME, options);
    }
    
    saveDraftSurvey(survey: SurveyTemplate): Promise<SurveyTemplate>  {
        survey.Hidden = false;
        return this.upsertSurveyInternal(survey, DRAFT_SURVEYS_TABLE_NAME);
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
        return this.upsertSurveyInternal(survey, DRAFT_SURVEYS_TABLE_NAME);
    }

    async removeSurvey(query: any): Promise<boolean> {
        const surveyTemplatekey = query['key'] || '';
        
        let draftRes = false;
        let res = false;

        if (surveyTemplatekey.length > 0) {
            try {
                let survey = await this.getSurvey(surveyTemplatekey, DRAFT_SURVEYS_TABLE_NAME);
                draftRes = await this.hideSurvey(survey, DRAFT_SURVEYS_TABLE_NAME);
            } catch (e) {
            }
    
            try {
                let survey = await this.getSurvey(surveyTemplatekey, SURVEYS_TABLE_NAME);
                res = await this.hideSurvey(survey, SURVEYS_TABLE_NAME);
            } catch (e) {
            }
        }

        return Promise.resolve(draftRes || res);
    }

    async getSurveysData(options: FindOptions | undefined = undefined): Promise<SurveyTemplateRowProjection[]> {
        let surveys: SurveyTemplate[] = await this.getSurveysFrom(SURVEYS_TABLE_NAME);
        let draftSurveys: SurveyTemplate[] = await this.getSurveysFrom(DRAFT_SURVEYS_TABLE_NAME);

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
                    survey = await this.getSurvey(surveyTemplateKey, DRAFT_SURVEYS_TABLE_NAME);
                } catch {
                    // Do nothing
                }
            }

            const dataPromises: Promise<any>[] = [];
            
            // If draft is hidden or not exist add call to bring the publish survey.
            if (!survey || survey.Hidden) {
                dataPromises.push(this.getSurvey(surveyTemplateKey, SURVEYS_TABLE_NAME));
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
    //         let survey = await this.getSurvey(surveyTemplatekey, SURVEYS_TABLE_NAME);

    //         // In case that the survey was never published.
    //         if (!survey) {
    //             survey = await this.getSurvey(surveyTemplatekey, DRAFT_SURVEYS_TABLE_NAME);
    //             return this.publishSurvey(survey);
    //         } else {
    //             const surveyCopy = JSON.parse(JSON.stringify(survey));
    //             await this.hideSurvey(surveyCopy, DRAFT_SURVEYS_TABLE_NAME);
    //             return surveyCopy;
    //         }
    //     }
        
    //     return Promise.reject(null);
    // }

    async publishSurvey(survey: SurveyTemplate): Promise<SurveyTemplate> {
        let res: SurveyTemplate | null = null;

        if (survey) {
            // Save the current survey in surveys table
            res = await this.upsertSurveyInternal(survey, SURVEYS_TABLE_NAME);

            // Update the draft survey and hide it.
            if (res != null) {
                const surveyCopy = JSON.parse(JSON.stringify(survey));
                this.hideSurvey(surveyCopy, DRAFT_SURVEYS_TABLE_NAME);
            }
            
            return Promise.resolve(res);
        }

        return Promise.reject(null);
    }
}

export default SurveyApiService;