import { IClient } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { SurveyTemplate, SURVEY_TEMPLATES_BASE_TABLE_NAME, SurveyTemplateSection, SurveyStatusType, 
    SURVEYS_BASE_TABLE_NAME, SURVEYS_TABLE_NAME, RESOURCE_NAME_PROPERTY, SURVEY_TEMPLATES_TABLE_NAME, DRAFT_SURVEY_TEMPLATES_TABLE_NAME, 
    SurveyQuestionClickActionType, 
    SurveyTemplateQuestion} from 'shared';
import { Survey } from '@pepperi-addons/papi-sdk';
import { filter } from '@pepperi-addons/pepperi-filters';
import { FilePickerOptions, FilesSource } from '@pepperi-addons/cpi-node/build/cpi-side/app/components/file-picker';
import config from '../addon.config.json';

class SurveysService {
    
    constructor() {}

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

    private mergeSurveyIntoTemplateData(survey: Survey, surveyTemplate: SurveyTemplate): void {
        this.printLog(`mergeSurveyIntoTemplateData -> before`);

        // Calc the merge survey template object.
        if (survey.Answers && survey.Answers?.length > 0) {
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
                            question.Value = answer?.Answer;
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

        surveyTemplate.StatusName = survey.StatusName && survey.StatusName.length > 0 ? survey.StatusName as SurveyStatusType : 'InCreation';
        surveyTemplate.SurveyKey = survey.Key;
        
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

    private calcShowIf(surveyTemplate: SurveyTemplate): void {
        this.printLog(`calcShowIf -> before`);

        // Prepare the questions value data object
        const questionsObject = this.createMapQuestionObject(surveyTemplate);

        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const section: SurveyTemplateSection = surveyTemplate.Sections[sectionIndex];

            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                let shouldBeVisible = true;
                const question = section.Questions[questionIndex];

                if (question.ShowIf) {
                    const showIf = this.convertShowIfQueryValuesToString(question.ShowIf);
                    
                    // Call pepperi filters to apply this.
                    shouldBeVisible = filter([questionsObject], showIf).length > 0;
                }

                question.Visible = shouldBeVisible;
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
                    survey.Answers.push({
                        Key: question.Key, 
                        Answer: question.Value
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
            
                // If this questions is mandatory and the value is empty.
                if (question.Visible && question.Mandatory && (question.Value === undefined || question.Value === null || question.Value.length === 0)) {
                    errorMsg = `"${question.Title}" is mandatory`;
                    break;
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
                this.mergeSurveyIntoTemplateData(survey, mergedSurvey);
                this.calcShowIf(mergedSurvey);
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
    
                // Calc the show if
                this.calcShowIf(mergedSurvey);
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

            // Get the question
            let currentQuestion = this.getQuestionByKey(mergedSurvey, questionKey);

            // If the question exist and the type is allowed for click.
            if (currentQuestion && (currentQuestion.Type === 'photo' || currentQuestion.Type === 'signature')) {
                if (action === 'View') {
                    // TODO: Raise client event for view.
                    const options = {
                        uri: currentQuestion.Value,
                    };

                    const res =  await client?.openURI(options);
                    if (res?.success) {
                        console.log('URI opened successfully');
                    }
                    else {
                        console.log('URI failed to open: ', res?.reason);
                        isValid = false;
                        errorMessage = `URI failed to open: ${res?.reason}`;
                    }

                } else if (action === 'Set') {
                    const allowedFilesSources: FilesSource[] = []; // FileSourceType = 'Camera' | 'PhotoLibrary' | 'Files' | 'SignaturePad';
                    if (currentQuestion.Type === 'photo') {
                        allowedFilesSources.push({ type: 'PhotoLibrary', title: 'Select Photo'});
                        allowedFilesSources.push({ type: 'Files', title: 'Select File'});
                        allowedFilesSources.push({ type: 'Camera', title: 'Take Photo'});
                    } else { // if it's signature
                        allowedFilesSources.push({ type: 'SignaturePad', title: 'Select Signature'});
                    }

                    const allowedExtensions = ["bmp", "gif", "jpg", "jpeg", "png"];

                    const options: FilePickerOptions = {
                        title: `Select ${currentQuestion.Type === 'photo' ? 'Image' : 'Signature'}`,
                        allowedFilesSources: allowedFilesSources,
                        allowedExtensions: allowedExtensions,
                        sizeLimit: 1024 * 10,
                        compression: {
                            quality: currentQuestion.PhotoQuality || 50,
                            megapixels: currentQuestion.MaxMegapixel || 2,
                        }
                    };

                    // Raise client event for choose an image || signature.
                    const res = await client?.openFilePicker(options);
                    if (res?.success) {
                        console.log(`filePicker, mimeType: ${res.mimeType}, uri: ${res.uri}`);

                        // TODO: Add this temp url to a real one (PFS) and save it in the survey model.
                        currentQuestion.Value = res.uri;
                        someQuestionChanged = true;
                    } else {
                        console.log('filePicker failed: ', res?.reason); // reason can be 'UserCanceled', 'AccessDenied' or 'SizeLimitExceeded'
                        isValid = false;
                        errorMessage = `URI failed to open: ${res?.reason}`;
                    }
                } else if (action === 'Delete') {
                    // TODO: Delete this PFS url and save '' in the survey model.
                    currentQuestion.Value = '';
                    someQuestionChanged = true;
                }
    
                if (someQuestionChanged) {
                    // Set the new Answers and save in the DB.
                    this.setSurveyAnswers(survey, mergedSurvey);
                    await this.setSurveyModel(survey)
        
                    // Calc the show if
                    this.calcShowIf(mergedSurvey);
                }
            }
        } else {
            isValid = false;
        }

        this.printLog(`onSurveyQuestionClick with surveyKey = ${mergedSurvey?.SurveyKey} -> after`);

        return { mergedSurvey: mergedSurvey, isValid, errorMessage};
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