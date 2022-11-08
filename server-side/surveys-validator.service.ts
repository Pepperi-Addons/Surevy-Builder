import { SurveyTemplate, SurveyTemplateQuestion, SurveyTemplateSection } from 'shared';

export class SurveysValidatorService {

    constructor() {}

    private getNotExistError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is missing.`;
    }
    
    private getEmptyValueError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is empty.`;
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
    
    private validateSurveySectionQuestionProperties(sectionsPropertyBreadcrumb: string, question: SurveyTemplateQuestion): void {
        // Validate Key
        this.validateObjectProperty(question, 'Key', sectionsPropertyBreadcrumb);

        // Validate Name if exist (Optional)
        this.validateObjectProperty(question, 'Name', sectionsPropertyBreadcrumb, true);
        
        // Validate Title if exist
        this.validateObjectProperty(question, 'Title', sectionsPropertyBreadcrumb);
        
        // Validate Description if exist (Optional)
        this.validateObjectProperty(question, 'Description', sectionsPropertyBreadcrumb, true);

        // Validate Type if exist
        this.validateObjectProperty(question, 'Type', sectionsPropertyBreadcrumb);
        if (typeof question.Type !== 'string') {
            throw new Error(this.getWrongTypeError(sectionsPropertyBreadcrumb, 'Type', 'string'));
        }
        // TODO:
        //  else if (!SurveyQuestionType.some(pst => pst === question.Type)) {
        //     throw new Error(this.getWrongTypeError(sectionsPropertyBreadcrumb, 'Type', `value from [${SurveyQuestionType}]`));
        // }

        // Validate Mandatory if exist (Optional)
        this.validateObjectProperty(question, 'Mandatory', sectionsPropertyBreadcrumb, true, 'boolean');
    }

    private validateSurveySectionProperties(surveyPropertyBreadcrumb: string, section: SurveyTemplateSection, sectionIndex: number): void {
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
            this.validateSurveySectionQuestionProperties(`${sectionsPropertyBreadcrumb} -> Questions at index ${index}`, question);
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/

    // Validate the survey and throw error if not valid.
    validateSurveyProperties(survey: SurveyTemplate): void {
        const surveyPropertyBreadcrumb = 'Survey';
        
        // Validate Key if exist (Optional)
        this.validateObjectProperty(survey, 'Key', surveyPropertyBreadcrumb, true);

        // Validate Hidden if exist (Optional)
        this.validateObjectProperty(survey, 'Hidden', surveyPropertyBreadcrumb, true, 'boolean');

        // Validate Name if exist
        this.validateObjectProperty(survey, 'Name', surveyPropertyBreadcrumb);
        
        // Validate Description if exist (Optional)
        this.validateObjectProperty(survey, 'Description', surveyPropertyBreadcrumb, true);
        
        // Validate Active if exist
        this.validateObjectProperty(survey, 'Active', surveyPropertyBreadcrumb, false, 'boolean');

        // Validate ActiveDateRange if exist (Optional)
        this.validateObjectProperty(survey, 'ActiveDateRange', surveyPropertyBreadcrumb, true, 'object');
        if (survey.ActiveDateRange) {
            // Validate From if exist (Optional)
            this.validateObjectProperty(survey.ActiveDateRange, 'From', surveyPropertyBreadcrumb, true);
            
            // Validate To if exist (Optional)
            this.validateObjectProperty(survey.ActiveDateRange, 'To', surveyPropertyBreadcrumb, true);
        }

        // Validate Sections
        this.validateArrayProperty(survey, 'Sections', surveyPropertyBreadcrumb);
        for (let index = 0; index < survey.Sections.length; index++) {
            this.validateSurveySectionProperties(surveyPropertyBreadcrumb, survey.Sections[index], index);
        }
    }
    
    validateSurveyData(survey: SurveyTemplate) {
        // Validate sections and questions.
        const sectionsKeys = new Map<string, string>();
        const questionsKeys = new Map<string, string>();

        // Go for all sections and check for uniqe key
        for (let sectionIndex = 0; sectionIndex < survey.Sections?.length; sectionIndex++) {
            const section = survey.Sections[sectionIndex];
            
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

    getSurveyCopyAccordingInterface(survey: SurveyTemplate): SurveyTemplate {
        // Init with the mandatories properties.
        let res: SurveyTemplate = {
            Name: survey.Name,
            Active: survey.Active,
            Sections: []
        };

        this.addOptionalPropertyIfExist(survey, res, 'Hidden');
        this.addOptionalPropertyIfExist(survey, res, 'CreationDateTime');
        this.addOptionalPropertyIfExist(survey, res, 'Key');
        this.addOptionalPropertyIfExist(survey, res, 'Description');
        this.addOptionalPropertyIfExist(survey, res, 'ActiveDateRange');

        // Add sections specific properties.
        for (let sectionIndex = 0; sectionIndex < survey.Sections.length; sectionIndex++) {
            const currentSection = survey.Sections[sectionIndex];
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