import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEY_TEMPLATES_BASE_TABLE_NAME, SurveyTemplateSection, SurveyStatusType, 
    SURVEYS_BASE_TABLE_NAME, SURVEYS_TABLE_NAME, RESOURCE_NAME_PROPERTY, 
    SurveyQuestionClickActionType,
    SurveyTemplateQuestion,
    SURVEY_PFS_TABLE_NAME} from 'shared';
import { AddonFile, Survey } from '@pepperi-addons/papi-sdk';
import { filter } from '@pepperi-addons/pepperi-filters';
import { FilePickerOptions, FilesSource } from '@pepperi-addons/cpi-node/build/cpi-side/app/components/file-picker';
import config from '../addon.config.json';

class SurveysService {
    private _mergedSurveysQuestionsRelationValue: Map<string, Map<string, string>>;
    get mergedSurveysQuestionsRelationValue(): Map<string, Map<string, string>> {
        return this._mergedSurveysQuestionsRelationValue;
    }

    constructor(mergedSurveysQuestionsRelationValue: Map<string, Map<string, string>>) {
        this._mergedSurveysQuestionsRelationValue = mergedSurveysQuestionsRelationValue || new Map<string, Map<string, string>>();
    }

    /***********************************************************************************************/
    //                              Private functions
    /************************************************************************************************/
    
    private async getSurveyModel(surveyKey: string): Promise<Survey> {
        this.printLog(`getSurveyModel with key = ${surveyKey} -> before`);
        const survey = await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).key(surveyKey).get();
        this.printLog(`getSurveyModel with key = ${surveyKey} -> after`);
        return survey as Survey;
    }

    private async setSurveyModel(survey: Survey): Promise<Survey> {
        this.printLog(`setSurveyModel -> before`);
        const res = await pepperi.resources.resource(survey.ResourceName).post(survey);
        this.printLog(`setSurveyModel -> after`);
        return res as Survey;
    }

    private async getSurveyTemplate(surveyTemplateKey: string, resourceName: string = SURVEY_TEMPLATES_BASE_TABLE_NAME): Promise<SurveyTemplate> {
        // const survey = await pepperi.resources.resource(resourceName).key(surveyTemplateKey).get();
        this.printLog(`getSurveyTemplate with key = ${surveyTemplateKey} -> before`);
        const surveyTemplates = await (await pepperi.resources.resource(resourceName).search({ KeyList: [surveyTemplateKey] })).Objects;
        const surveyTemplate = surveyTemplates.length > 0 ? surveyTemplates[0] : null;
        this.printLog(`getSurveyTemplate with key = ${surveyTemplateKey} -> after`);
        return surveyTemplate as SurveyTemplate;
    }
    
    // private async getSurveyTemplateDraft(surveyTemplateKey: string): Promise<SurveyTemplate | null> {
    //     let draftSurveyTemplate = null;

    //     // Try to get the survey template from the draft first.
    //     try {    
    //         const draft = (await pepperi.api.adal.get({
    //             addon: config.AddonUUID,
    //             table: DRAFT_SURVEY_TEMPLATES_TABLE_NAME,
    //             key: surveyTemplateKey
    //         })).object;
            
    //         // Set surveyTemplate from the draft.JsonTemplate
    //         if (draft) {
    //             draftSurveyTemplate = JSON.parse(draft.JsonTemplate);
    //         }
    //     } catch {
    //         // Do nothing
    //     }

    //     return draftSurveyTemplate;
    // }

    private setMergedSurveysQuestionsRelationValue(surveyKey: string, questionKey: string, relationKey: string | undefined) {
        if (!this.mergedSurveysQuestionsRelationValue.has(surveyKey)) {
            this.mergedSurveysQuestionsRelationValue.set(surveyKey, new Map<string, string>());
        }

        const currentSurveyQuestions = this.mergedSurveysQuestionsRelationValue.get(surveyKey);

        if (relationKey) {
            currentSurveyQuestions?.set(questionKey, relationKey);
        }
    }

    private async setQuestionTemplateValue(surveyKey: string, question: SurveyTemplateQuestion, value: string): Promise<void> {
        question.Value = value;

        // If the question is photo or signature, get the file from the pfs and set the URL in the value.
        if (value && (question.Type === 'photo' || question.Type === 'signature')) {
            let pfsURL = '';
            try {
                const pfsFile = await pepperi.addons.pfs.uuid(config.AddonUUID).schema(SURVEY_PFS_TABLE_NAME).key(value).get();
                pfsURL = pfsFile?.URL || '';

                // *** Important ***
                // Here we set the mapping between the survey key and the question key to the pfs file key.
                this.setMergedSurveysQuestionsRelationValue(surveyKey, question.Key, pfsFile.Key);
            } catch {
                // Do nothing
            }

            // Here we override the template value to be the URL of the file in the pfs.
            question.Value = pfsURL; 
        }
    }

    private async mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate): Promise<void> {
        this.printLog(`mergeSurveyIntoTemplateData -> before`);

        surveyTemplate.StatusName = survey.StatusName && survey.StatusName.length > 0 ? survey.StatusName as SurveyStatusType : 'InCreation';
        surveyTemplate.SurveyKey = survey.Key;

        // Calc the merge survey template object.
        if (surveyTemplate.SurveyKey && survey.Answers && survey.Answers?.length > 0) {
            // For each answer set it in the right question.
            for (let answerIndex = 0; answerIndex < survey.Answers.length; answerIndex++) {
                const answer = survey.Answers[answerIndex];
                let valueIsSet = false;

                for (let sectionIndex = 0; sectionIndex < surveyTemplate?.Sections?.length; sectionIndex++) {
                    const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];
    
                    for (let questionIndex = 0; questionIndex < section.Questions?.length; questionIndex++) {
                        const question = section.Questions[questionIndex];
                        
                        // Set the value and break this loop 
                        if (question.Key === answer?.Key) {
                            await this.setQuestionTemplateValue(surveyTemplate.SurveyKey, question, answer.Answer);
                            valueIsSet = true;
                            break;
                        }
                    }

                    // Break this loop for continue to the next answer.
                    if (valueIsSet) {
                        break;
                    }
                }
            }
        }
        
        this.printLog(`mergeSurveyIntoTemplateData -> after`);
    }

    private createMapQuestionObject(surveyTemplate: SurveyTemplate): any {
        this.printLog(`createMapQuestionObject -> before`);

        const ret = {};

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                ret[question.Key] = question.Value ?? undefined;
            }
        }
        this.printLog(`createMapQuestionObject -> after`);

        return ret;
    }

    private convertShowIfQueryValuesToString(query: any) {
        if (query) {
            // If the query has values.
            if (query.Values) {
                // If the values is more then one, convert them to array of one string item with ';' delimiter for the comparation.
                if (query.Values.length > 1 && query.Operation === "IsEqual") {
                    query.Values = [query.Values.join(';')];
                }
            } else {
                // Convert the left and right nodes if exist.
                if (query.LeftNode) {
                    this.convertShowIfQueryValuesToString(query.LeftNode);
                } 
                if (query.RightNode) {
                    this.convertShowIfQueryValuesToString(query.RightNode);
                }
            }
        }

        return query
    }

    private async calcSurveyTemplate(surveyTemplate: SurveyTemplate): Promise<void> {
        this.printLog(`calcSurveyTemplate -> before`);

        // Prepare the questions value data object
        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];

                // Do some manipulation on the question if needed.
                // ...

                // Don't needed anymore.
                // // If the question is photo or signature, get the file from the pfs and set the URL in the value.
                // if (question.Value && (question.Type === 'photo' || question.Type === 'signature')) {
                //     let pfsURL = '';
                //     try {
                //         const pfsFile = await pepperi.addons.pfs.uuid(config.AddonUUID).schema(SURVEY_PFS_TABLE_NAME).key(question.Value).get();
                //         pfsURL = pfsFile?.URL || '';
                //     } catch {
                //         // Do nothing
                //     }

                //     // *** Important ***
                //     // Here we override the template value to be the URL of the file in the pfs.
                //     question.Value = pfsURL; 
                // }
            }
        }

        this.calcShowIf(surveyTemplate);

        this.printLog(`calcSurveyTemplate -> after`);
    }

    private calcShowIf(surveyTemplate: SurveyTemplate): void {
        this.printLog(`calcShowIf -> before`);

        const questionsObject = this.createMapQuestionObject(surveyTemplate);

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                let shouldBeVisible = !question.Hide;

                if (shouldBeVisible && question.ShowIf) {
                    const showIf = this.convertShowIfQueryValuesToString(question.ShowIf);
                    
                    // Call pepperi filters to apply this.
                    shouldBeVisible = filter([questionsObject], showIf).length > 0;
                }

                question.ShowIfResult = shouldBeVisible;
            }
        }

        this.printLog(`calcShowIf -> after`);
    }

    private setSurveyAnswers(survey: Survey, surveyTemplate: SurveyTemplate): void {
        this.printLog(`setSurveyAnswers -> before`);

        // Remove old answers
        survey.Answers = [];

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];

                if (question.Value?.length > 0) {
                    let valueToSet = question.Value;
                    if (surveyTemplate.SurveyKey && (question.Type === 'photo' || question.Type === 'signature')) {
                        valueToSet = this.mergedSurveysQuestionsRelationValue.get(surveyTemplate.SurveyKey)?.get(question.Key) || '';
                    }

                    survey.Answers.push({
                        Key: question.Key, 
                        Answer: valueToSet
                    });
                }
            }
        }
        
        this.printLog(`setSurveyAnswers -> after`);
    }

    private validateSurvey(surveyTemplate: SurveyTemplate): string {
        this.printLog(`validateSurvey -> before`);

        let errorMsg = '';

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
            
                if (!question.Hide) {
                    // If this questions is mandatory and the value is empty.
                    if (question.ShowIfResult && question.Mandatory && (question.Value === undefined || question.Value === null || question.Value.length === 0)) {
                        errorMsg = `"${question.Title}" is mandatory`;
                        break;
                    }
                }
            }

            if (errorMsg.length > 0) {
                break;
            }
        }
        this.printLog(`validateSurvey -> after`);

        return errorMsg;
    }

    private getQuestionByKey(surveyTemplate: SurveyTemplate, questionKey: string): SurveyTemplateQuestion | undefined {
        let currentQuestion: SurveyTemplateQuestion | undefined = undefined;

        for (let sectionIndex = 0; sectionIndex < surveyTemplate?.Sections?.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            currentQuestion = section.Questions.find(q => q.Key === questionKey);
            
            if (currentQuestion) {
                break;
            }
        }

        return currentQuestion;
    }

    private async isWebapp(): Promise<boolean> {
        return await global["app"]["wApp"]["isWebApp"]();
    }

    /***********************************************************************************************/
    //                              Public functions
    /************************************************************************************************/

    printLog(message: string, withMiliseconds: boolean = true) {
        const miliAsString = withMiliseconds ? `, miliseconds - ${new Date().getTime()}` : '';
        console.log(`${message}${miliAsString}`);
    }
    
    async getSurveyData(client: IClient | undefined, surveyKey: string): Promise<SurveyTemplate | null> {
        let mergedSurvey: SurveyTemplate | null = null;
        this.printLog(`getSurveyData getSurveyModel with key = ${surveyKey} -> before`);
        const survey = await this.getSurveyModel(surveyKey);
        
        if (survey && survey.Template) {
            mergedSurvey = await this.getSurveyTemplate(survey.Template);
    
            if (mergedSurvey) {
                await this.mergeSurveyIntoTemplateData(survey, mergedSurvey);
                await this.calcSurveyTemplate(mergedSurvey);
            }
        } else {
            // TODO: Throw survey has no template.
        }

        this.printLog(`getSurveyData getSurveyModel with key = ${surveyKey} -> after`);
        return mergedSurvey;
    }

    // Drafts is not sync so we cannot do this here!!!
    // async getSurveyTemplateData(client: IClient | undefined, surveyTemplateKey: string, resourceName: string): Promise<SurveyTemplate | null> {
    //     let surveyTemplate;
        
    //     // Get the survey template from the drafts.
    //     const draftSurveyTemplate = await this.getSurveyTemplateDraft(surveyTemplateKey);
    
    //     // If draft is hidden or not exist add call to bring the publish survey template.
    //     if (!draftSurveyTemplate || draftSurveyTemplate.Hidden) {
    //         surveyTemplate = await this.getSurveyTemplate(surveyTemplateKey, resourceName);
    //     }
            
    //     // Return the publish survey template if exist (cause we populate it only if the draft is hidden or not exist).
    //     return surveyTemplate ? surveyTemplate : draftSurveyTemplate;
    // }

    async onSurveyFieldChange(client: IClient | undefined, mergedSurvey: SurveyTemplate | null, changedFields: any): Promise<any> {
        this.printLog(`onSurveyFieldChange with surveyKey = ${mergedSurvey?.SurveyKey} -> before`);
        
        const hudOptions = {
            // HUD's message
            message: 'Waiting....', // optional (default value is '')
        
            // adds a button with text to the HUD
            // closeMessage: 'Press to close', // optional - (default is '' and the botton is hidden)
        
            //display the HUD after the delay time (the block runs in the meantime)
            delay: 0.1, //optional - (default value is 0.5)
        
            // block of code that will run in background while the HUD is showing.
            block: async (updateMessage) => {
                let shouldNavigateBack = false;
                let isValid = true;
                let errorMessage = '';
                
                if (mergedSurvey?.SurveyKey) {
                    const survey = await this.getSurveyModel(mergedSurvey.SurveyKey);

                    for (let index = 0; index < changedFields.length; index++) {
                        const propertyName = changedFields[index].FieldID;
                        const value = changedFields[index].NewValue;
                        
                        // If the survey field is StatusName
                        if (propertyName === 'StatusName') {
                            const status: SurveyStatusType = value as SurveyStatusType;

                            // If the status is 'Submitted' (If there is no error navigate back after save).
                            if (status === 'Submitted') {
                                errorMessage = this.validateSurvey(mergedSurvey);
                                isValid = shouldNavigateBack = errorMessage.length === 0;

                                if (!isValid) {
                                    break;
                                }
                            }
                        }

                        // Set the old value in the changeFields
                        changedFields[index].OldValue = survey[propertyName];

                        // Set the new value.
                        survey[propertyName] = mergedSurvey[propertyName] = value;
                    }

                    // Save the survey
                    if (isValid) {
                        await this.setSurveyModel(survey);
                    }
                } else {
                    errorMessage = `Error, Survey not exist in memory`;
                    isValid = false;
                }

                return { mergedSurvey: mergedSurvey, changedFields, shouldNavigateBack, isValid, errorMessage};
            },
        };

        const res = await client?.showHUD(hudOptions);
        this.printLog(`onSurveyFieldChange with surveyKey = ${mergedSurvey?.SurveyKey} -> after`);

        // If there is an error message show it.
        if (res?.result?.errorMessage.length > 0) {
            // // Wait for delay.
            // await new Promise((resolve) => setTimeout(resolve, 150));
            await client?.alert('Notice', res?.result.errorMessage);
        }

        return res?.result;
    }

    async onSurveyQuestionChange(client: IClient | undefined, mergedSurvey: SurveyTemplate | null, changedFields: any): Promise<any> {
        this.printLog(`onSurveyQuestionChange with surveyKey = ${mergedSurvey?.SurveyKey} -> before`);

        let isValid = true;

        if (mergedSurvey?.SurveyKey) {
            const survey = await this.getSurveyModel(mergedSurvey.SurveyKey);

            let someQuestionChanged = false;

            for (let index = 0; index < changedFields.length; index++) {
                const questionKey = changedFields[index].FieldID;
                const value = changedFields[index].NewValue;
                let isValueSet = false;

                // Set the question value.
                for (let sectionIndex = 0; sectionIndex < mergedSurvey.Sections.length; sectionIndex++) {
                    const section: SurveyTemplateSection = mergedSurvey.Sections[sectionIndex];
        
                    for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                        const question = section.Questions[questionIndex];
                        
                        if (question.Key === questionKey) {
                            // Set the old value in the changeFields
                            changedFields[index].OldValue = question.Value;
                            
                            // Set the new value for this question.
                            question.Value = value;
                            someQuestionChanged = isValueSet = true;
                            break;
                        }
                    }
        
                    if (isValueSet) {
                        break;
                    }
                }
            }

            if (someQuestionChanged) {
                // Set the new Answers and save in the DB.
                this.setSurveyAnswers(survey, mergedSurvey);
                await this.setSurveyModel(survey)
    
                // Calc the survey template.
                await this.calcSurveyTemplate(mergedSurvey);
            }
        } else {
            isValid = false;
        }

        this.printLog(`onSurveyQuestionChange with surveyKey = ${mergedSurvey?.SurveyKey} -> after`);

        return { mergedSurvey: mergedSurvey, changedFields, isValid};
    }

    async onSurveyQuestionClick(client: IClient | undefined, mergedSurvey: SurveyTemplate | null, questionKey: string, action: SurveyQuestionClickActionType): Promise<any> {
        this.printLog(`onSurveyQuestionClick with surveyKey = ${mergedSurvey?.SurveyKey} -> before`);

        let isValid = true;
        let errorMessage = '';

        if (mergedSurvey?.SurveyKey) {
            let someQuestionChanged = false;
            const survey = await this.getSurveyModel(mergedSurvey.SurveyKey);

            // Get the question template
            let currentTemplateQuestion = this.getQuestionByKey(mergedSurvey, questionKey);

            // If the question exist and the type is allowed for click.
            if (currentTemplateQuestion && (currentTemplateQuestion.Type === 'photo' || currentTemplateQuestion.Type === 'signature')) {
                if (action === 'View') {
                    if (currentTemplateQuestion.Value) {
                        // The currentQuestion.Value is always the URL of the pfs.
                        const options = {
                            uri: currentTemplateQuestion.Value || '',
                        };

                        // Raise client event for view.
                        const res =  await client?.openURI(options);
                        if (res?.success) {
                            console.log('URI opened successfully');
                        } else {
                            console.log('URI failed to open: ', res?.reason);
                            isValid = false;
                            // If there is an error message show it.
                            if (res?.reason) {
                                errorMessage = `URI failed to open: ${res?.reason}`;
                                await client?.alert('Notice', errorMessage);
                            }

                        }
                    }
                } else if (action === 'Set') {
                    const allowedFilesSources: FilesSource[] = []; // FileSourceType = 'Camera' | 'PhotoLibrary' | 'Files' | 'SignaturePad';
                    if (currentTemplateQuestion.Type === 'photo') {
                        allowedFilesSources.push({ type: 'Camera', title: 'Take Photo'});
                        
                        // If currentQuestion.AllowOnlyCameraPhoto is not true then allow only camera
                        if (currentTemplateQuestion.AllowOnlyCameraPhoto !== true) {
                            allowedFilesSources.push({ type: 'PhotoLibrary', title: 'Select Photo'});
                            allowedFilesSources.push({ type: 'Files', title: 'Select File'});
                        }
                    } else { // if it's signature
                        allowedFilesSources.push({ type: 'SignaturePad', title: 'Select Signature'});
                    }

                    const allowedExtensions = ["bmp", "gif", "jpg", "jpeg", "png", "svg"];
                    
                    const options: FilePickerOptions = {
                        title: `Select ${currentTemplateQuestion.Type === 'photo' ? 'Image' : 'Signature'}`,
                        allowedFilesSources: allowedFilesSources,
                        allowedExtensions: allowedExtensions,
                        sizeLimit: 1024 * 10,
                        compression: {
                            quality: currentTemplateQuestion.PhotoQuality || 50,
                            megapixels: currentTemplateQuestion.MaxMegapixel || 2,
                        }
                    };

                    // Raise client event for choose an image || signature.
                    const res = await client?.openFilePicker(options);
                    if (res?.success) {
                        console.log(`filePicker, mimeType: ${res.mimeType}, uri: ${res.uri}`);

                        // Add this temp url to a real one (PFS) and save it in the survey model.
                        const pfsBody: AddonFile = {
                            Key: this.getPfsFileKey(mergedSurvey, currentTemplateQuestion, res.mimeType),
                            MIME: res.mimeType,
                            Sync: 'Always',
                            Cache: false,
                            Hidden: false,
                        };

                        if (await this.isWebapp()) {
                            pfsBody.TemporaryFileURLs = [res.uri];
                        } else {
                            pfsBody.URI = res.uri;
                        }
                        
                        const pfsResult: AddonFile = await pepperi.addons.pfs.uuid(config.AddonUUID).schema(SURVEY_PFS_TABLE_NAME).post(pfsBody);

                        // *** Important ***
                        // Set new map entry for the relation between the survey and the question.
                        this.setMergedSurveysQuestionsRelationValue(mergedSurvey.SurveyKey, questionKey, pfsResult.Key);
                        currentTemplateQuestion.Value = pfsResult.URL;
                        someQuestionChanged = true;
                    } else {
                        console.log('filePicker: ', res?.reason); // reason can be 'UserCanceled', 'AccessDenied' or 'SizeLimitExceeded'
                        isValid = false;
                        
                        if (res?.reason && res.reason !== 'UserCanceled') {
                            // TODO: Translate this error.
                            let msg = '';

                            if (res.reason === 'UploadFileUnknownError') {
                                msg = 'Failed to upload file, Please try again later.';
                            } else if (res.reason === 'NotAllowedExtension') {
                                msg = 'Invalid file type, the allowed file types are: ' + allowedExtensions.join(', ') + '.';
                            } else if (res.reason === 'SizeLimitExceeded') {
                                msg = `File size limit exceeded, max allowed is ${options.sizeLimit} KB.`;
                            } else if (res.reason === 'CameraNotAvailable') {
                                msg = 'Camera not available.';
                            } else if (res.reason === 'AllowedFilesSources') {
                                msg = 'Cannot find files sources.';
                            } 
                            
                            await client?.alert('Notice', msg);
                        }
                    }
                } else if (action === 'Delete') {
                    // Get the pfs key from the mergedSurveysQuestionsRelationValue map.
                    const pfsKey = this.mergedSurveysQuestionsRelationValue.get(mergedSurvey.SurveyKey)?.get(questionKey);
                    // survey.Answers?.find(a => a.Key === questionKey)?.Answer || '';

                    // Delete this PFS url and save '' in the survey model.
                    if (pfsKey) {
                        await pepperi.addons.pfs.uuid(config.AddonUUID).schema(SURVEY_PFS_TABLE_NAME).post({
                            Key: pfsKey, 
                            Hidden: true,
                        });

                        // *** Important ***
                        // Set new map entry for the relation between the survey and the question.
                        this.setMergedSurveysQuestionsRelationValue(mergedSurvey.SurveyKey, questionKey, '');
                        currentTemplateQuestion.Value = '';
                        someQuestionChanged = true;
                    }
                }
    
                if (someQuestionChanged) {
                    // Set the new Answers and save in the DB.
                    this.setSurveyAnswers(survey, mergedSurvey);
                    await this.setSurveyModel(survey);
        
                    // Calc the survey template
                    await this.calcSurveyTemplate(mergedSurvey);
                }
            }
        } else {
            isValid = false;
        }

        this.printLog(`onSurveyQuestionClick with surveyKey = ${mergedSurvey?.SurveyKey} -> after`);

        return { mergedSurvey: mergedSurvey, isValid, errorMessage};
    }

    private getPfsFileKey(mergedSurvey: SurveyTemplate, currentQuestion: SurveyTemplateQuestion, mimeType: string): string | undefined {
        const imagesMimeTypes = {
            "image/bmp": ".bmp",
            "image/x-icon": ".ico",
            "image/vnd.microsoft.icon": ".ico",
            "image/tiff": ".tiff",
            "image/apng": ".apng",
            "image/avif": ".avif",
            "image/gif": ".gif",
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/svg+xml": ".svg",
            "image/webp": ".webp",
        }

        const extension = imagesMimeTypes[mimeType] || '';
        return `${mergedSurvey.SurveyKey}_${currentQuestion.Key}_${extension}`;
    }

    async getObjectPropsForSurveyUserEvent(surveyKey: string) {
        this.printLog(`getObjectPropsForSurveyUserEvent with surveyKey = ${surveyKey} -> before`);

        const surveys = await (await pepperi.resources.resource(SURVEYS_BASE_TABLE_NAME).search({
            KeyList: [surveyKey],
            Fields: [RESOURCE_NAME_PROPERTY]
        })).Objects;
        
        const objectPropsToAddEventData = {
            ObjectType: surveys?.length > 0 ? surveys[0][RESOURCE_NAME_PROPERTY] : SURVEYS_TABLE_NAME
        }

        this.printLog(`getObjectPropsForSurveyUserEvent with surveyKey = ${surveyKey} -> after`);

        return objectPropsToAddEventData;
    }
}
export default SurveysService;