import { Survey, SurveyQuestion, SurveySection } from "./surveys.model";

export class SurveysValidatorService {

    constructor() {}

    private getNotExistError(objectBreadcrumb: string, propertyName: string): string {
        return `${objectBreadcrumb} -> ${propertyName} is missing.`;
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
    
    private validateSurveySectionQuestionProperties(sectionsPropertyBreadcrumb: string, question: SurveyQuestion): void {
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

    private validateSurveySectionProperties(surveyPropertyBreadcrumb: string, section: SurveySection, sectionIndex: number): void {
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


    // Validate the survey and throw error if not valid.
    validateSurveyProperties(survey: Survey): void {
        const surveyPropertyBreadcrumb = 'Survey';
        
        // Validate Key if exist (Optional)
        this.validateObjectProperty(survey, 'Key', surveyPropertyBreadcrumb, true);

        // Validate Hidden if exist (Optional)
        this.validateObjectProperty(survey, 'Hidden', surveyPropertyBreadcrumb, true, 'boolean');

        // Validate Name if exist (Optional)
        this.validateObjectProperty(survey, 'Name', surveyPropertyBreadcrumb, true);
        
        // Validate Description if exist (Optional)
        this.validateObjectProperty(survey, 'Description', surveyPropertyBreadcrumb, true);
        
        // Validate Sections
        this.validateArrayProperty(survey, 'Sections', surveyPropertyBreadcrumb);
        for (let index = 0; index < survey.Sections.length; index++) {
            this.validateSurveySectionProperties(surveyPropertyBreadcrumb, survey.Sections[index], index);
        }
    }
    
    getSurveyCopyAccordingInterface(survey: Survey): Survey {
        // Init with the mandatories properties.
        let res: Survey = {
            Sections: []
        };

        this.addOptionalPropertyIfExist(survey, res, 'Hidden');
        this.addOptionalPropertyIfExist(survey, res, 'CreationDateTime');
        this.addOptionalPropertyIfExist(survey, res, 'Key');
        this.addOptionalPropertyIfExist(survey, res, 'Name');
        this.addOptionalPropertyIfExist(survey, res, 'Description');

        // Add sections specific properties.
        for (let sectionIndex = 0; sectionIndex < survey.Sections.length; sectionIndex++) {
            const currentSection = survey.Sections[sectionIndex];
            const sectionToAdd: SurveySection = {
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