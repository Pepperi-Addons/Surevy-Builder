import { QUESTIONS_NUBER_LIMITATION, QUESTION_DESCRIPTION_LENGTH_LIMITATION, QUESTION_TITLE_LENGTH_LIMITATION, SurveyTemplate, SurveyTemplateQuestion, SurveyTemplateSection } from 'shared';

export class SurveysValidatorService {

    constructor() {}

    private getNotExistError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is missing.`;
    }
    
    private getEmptyValueError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is empty.`;
    }
    
    private getLengthValueError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is exceeded the allowed length.`;
    }

    private getWrongTypeError(objectBreadcrumb: string, propertyName: string, typeName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} should be ${typeName}.`;
    }

    private addOptionalPropertyIfExist(source: any, target: any, propertyName: string): void {
        if (source.hasOwnProperty(propertyName)) {
            target[propertyName] = source[propertyName];
        }
    }
    
    private validateObjectProperty(objectToValidate: any, propName: string, propertyBreadcrumb: string, optional: boolean = false, objectType: string = 'string') {
        if (!optional) {
            if (!objectToValidate.hasOwnProperty(propName)) {
                throw new Error(this.getNotExistError(propertyBreadcrumb, propName));
            } else if (typeof objectToValidate[propName] !== objectType) {
                throw new Error(this.getWrongTypeError(propertyBreadcrumb, propName, objectType));
            } else if (objectToValidate[propName].toString().length === 0) {
                throw new Error(this.getEmptyValueError(propertyBreadcrumb, propName));
            }
        } else {
            if (objectToValidate.hasOwnProperty(propName)) {
                if (typeof objectToValidate[propName] !== objectType) {
                    throw new Error(this.getWrongTypeError(propertyBreadcrumb, 'Configuration', objectType));
                }
            }
        }
    }

    private validateArrayProperty(objectToValidate: any, propName: string, propertyBreadcrumb: string, optional: boolean = false, arrayType: readonly any[] = []) {
        if (!optional) {
            if (!objectToValidate.hasOwnProperty(propName)) {
                throw new Error(this.getNotExistError(propertyBreadcrumb, propName));
            } else if (!Array.isArray(objectToValidate[propName])) {
                throw new Error(this.getWrongTypeError(propertyBreadcrumb, propName, 'array'));
            }
        } else {
            if (objectToValidate.hasOwnProperty(propName)) {
                if (!Array.isArray(objectToValidate[propName])) {
                    throw new Error(this.getWrongTypeError(propertyBreadcrumb, propName, 'array'));
                } else {
                    for (let index = 0; index < objectToValidate[propName].length; index++) {
                        const value = objectToValidate[propName][index];
                        if (!arrayType.some(atv => atv === value)) {
                            throw new Error(this.getWrongTypeError(propertyBreadcrumb, propName, `value from [${arrayType}]`));
                        }
                    }
                }
            }
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    private validateSurveyTemplateQuestionProperties(questionPropertyBreadcrumb: string, question: SurveyTemplateQuestion): void {
        // Validate Key
        this.validateObjectProperty(question, 'Key', questionPropertyBreadcrumb);

        // Validate Name if exist (Optional)
        this.validateObjectProperty(question, 'Name', questionPropertyBreadcrumb, true);
        
        // Validate Title if exist
        this.validateObjectProperty(question, 'Title', questionPropertyBreadcrumb);
        
        // Validate title length
        if (question.Title.length > QUESTION_TITLE_LENGTH_LIMITATION) {
            throw new Error(this.getLengthValueError(questionPropertyBreadcrumb, 'Title'));
        }

        // Validate Description if exist (Optional)
        this.validateObjectProperty(question, 'Description', questionPropertyBreadcrumb, true);
        // Validate Description length
        if (question.Description && question.Description.length > 0) {
            if (question.Description.length > QUESTION_DESCRIPTION_LENGTH_LIMITATION) {
                throw new Error(this.getLengthValueError(questionPropertyBreadcrumb, 'Description'));
            }
        }

        // Validate Type if exist
        this.validateObjectProperty(question, 'Type', questionPropertyBreadcrumb);
        if (typeof question.Type !== 'string') {
            throw new Error(this.getWrongTypeError(questionPropertyBreadcrumb, 'Type', 'string'));
        }
        // TODO:
        //  else if (!SurveyQuestionType.some(pst => pst === question.Type)) {
        //     throw new Error(this.getWrongTypeError(sectionsPropertyBreadcrumb, 'Type', `value from [${SurveyQuestionType}]`));
        // }

        // Validate Mandatory if exist (Optional)
        this.validateObjectProperty(question, 'Mandatory', questionPropertyBreadcrumb, true, 'boolean');

        // Validate Hide if exist (Optional)
        this.validateObjectProperty(question, 'Hide', questionPropertyBreadcrumb, true, 'boolean');
    }

    private validateSurveyTemplateSectionProperties(surveyPropertyBreadcrumb: string, section: SurveyTemplateSection, sectionIndex: number): void {
        const sectionsPropertyBreadcrumb = `${surveyPropertyBreadcrumb} -> Sections at index ${sectionIndex}`;

        // Validate Key
        this.validateObjectProperty(section, 'Key', sectionsPropertyBreadcrumb);

        // Validate Name if exist (Optional)
        this.validateObjectProperty(section, 'Name', sectionsPropertyBreadcrumb, true);
        
        // Validate Title if exist
        this.validateObjectProperty(section, 'Title', sectionsPropertyBreadcrumb);
        
        // Validate Description if exist (Optional)
        this.validateObjectProperty(section, 'Description', sectionsPropertyBreadcrumb, true);
        
        // Validate Questions
        this.validateArrayProperty(section, 'Questions', sectionsPropertyBreadcrumb);
        for (let index = 0; index < section.Questions.length; index++) {
            const question = section.Questions[index];
            this.validateSurveyTemplateQuestionProperties(`${sectionsPropertyBreadcrumb} -> Questions at index ${index}`, question);
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/

    validateQuestionsLimitNumber(surveyTemplate: SurveyTemplate): void {
        // Validate if questions number allow.
        const questionsNumber = surveyTemplate.Sections.reduce((count, innerArray) => count + innerArray.Questions.length, 0);
    
        if (questionsNumber > QUESTIONS_NUBER_LIMITATION) {
            throw new Error(`Survey can have up to (${QUESTIONS_NUBER_LIMITATION}) questions.`);
        }
    }

    // Validate the survey template and throw error if not valid.
    validateSurveyTemplateProperties(surveyTemplate: SurveyTemplate): void {
        const surveyPropertyBreadcrumb = 'Survey Template';
        
        // Validate Key if exist (Optional)
        this.validateObjectProperty(surveyTemplate, 'Key', surveyPropertyBreadcrumb, true);

        // Validate Hidden if exist (Optional)
        this.validateObjectProperty(surveyTemplate, 'Hidden', surveyPropertyBreadcrumb, true, 'boolean');

        // Validate Name if exist
        this.validateObjectProperty(surveyTemplate, 'Name', surveyPropertyBreadcrumb);
        
        // Validate Description if exist (Optional)
        this.validateObjectProperty(surveyTemplate, 'Description', surveyPropertyBreadcrumb, true);
        
        // Validate Active if exist
        this.validateObjectProperty(surveyTemplate, 'Active', surveyPropertyBreadcrumb, false, 'boolean');

        // Validate ActiveDateRange if exist (Optional)
        this.validateObjectProperty(surveyTemplate, 'ActiveDateRange', surveyPropertyBreadcrumb, true, 'object');
        if (surveyTemplate.ActiveDateRange) {
            // Validate From if exist (Optional)
            this.validateObjectProperty(surveyTemplate.ActiveDateRange, 'From', surveyPropertyBreadcrumb, true);
            
            // Validate To if exist (Optional)
            this.validateObjectProperty(surveyTemplate.ActiveDateRange, 'To', surveyPropertyBreadcrumb, true);
        }

        // Validate Sections
        this.validateArrayProperty(surveyTemplate, 'Sections', surveyPropertyBreadcrumb);
        for (let index = 0; index < surveyTemplate.Sections.length; index++) {
            this.validateSurveyTemplateSectionProperties(surveyPropertyBreadcrumb, surveyTemplate.Sections[index], index);
        }
    }
    
    validateSurveyTemplateData(surveyTemplate: SurveyTemplate) {
        // Validate sections and questions.
        const sectionsKeys = new Map<string, string>();
        const questionsKeys = new Map<string, string>();

        // Go for all sections and check for uniqe key
        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections?.length; sectionIndex++) {
            const section = surveyTemplate.Sections[sectionIndex];
            
            // Validate if the section key is not already exist.
            if (!sectionsKeys.has(section.Key)) {
                sectionsKeys.set(section.Key, section.Key);
            } else {
                throw new Error(`Section with Key ${section.Key} already exists.`);
            }

            // Go for all questions and check for uniqe key
            for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
                const question = section.Questions[questionIndex];
                
                // Validate if the question key is not already exist.
                if (!questionsKeys.has(question.Key)) {
                    questionsKeys.set(question.Key, question.Key);
                } else {
                    throw new Error(`Question with Key ${question.Key} already exists.`);
                }
            }
        }
    }

    getSurveyTemplateCopyAccordingInterface(surveyTemplate: SurveyTemplate): SurveyTemplate {
        // Init with the mandatories properties.
        let res: SurveyTemplate = {
            Name: surveyTemplate.Name,
            Active: surveyTemplate.Active,
            Sections: []
        };

        this.addOptionalPropertyIfExist(surveyTemplate, res, 'Hidden');
        this.addOptionalPropertyIfExist(surveyTemplate, res, 'CreationDateTime');
        this.addOptionalPropertyIfExist(surveyTemplate, res, 'Key');
        this.addOptionalPropertyIfExist(surveyTemplate, res, 'Description');
        this.addOptionalPropertyIfExist(surveyTemplate, res, 'ActiveDateRange');

        // Add sections specific properties.
        for (let sectionIndex = 0; sectionIndex < surveyTemplate.Sections.length; sectionIndex++) {
            const currentSection = surveyTemplate.Sections[sectionIndex];
            
            // Remove all values (This property have to be empty to get the value from the Survey activity object only - no default value).
            currentSection.Questions.every(q => delete q.Value);

            const sectionToAdd: SurveyTemplateSection = {
                Key: currentSection.Key,
                Title: currentSection.Title,
                Questions: currentSection.Questions // Add all questions properties.
            };

            this.addOptionalPropertyIfExist(currentSection, sectionToAdd, 'Name');
            this.addOptionalPropertyIfExist(currentSection, sectionToAdd, 'Description');
            
            res.Sections.push(sectionToAdd);
        } 
        
        return res;
    }
}