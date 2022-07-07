import { Survey } from "./surveys.model";

export class SurveysValidatorService {

    constructor() {}

    
    private addOptionalPropertyIfExist(source: any, target: any, propertyName: string): void {
        if (source.hasOwnProperty(propertyName)) {
            target[propertyName] = source[propertyName];
        }
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/
    
    validateSurveyData(survey: Survey) {
        // TODO: Validate survey data.
    }

    getSurveyCopyAccordingInterface(survey: Survey): Survey {
        // Init with the mandatories properties.
        let res: Survey = {
            
        };

        this.addOptionalPropertyIfExist(survey, res, 'Hidden');
        this.addOptionalPropertyIfExist(survey, res, 'CreationDateTime');
        this.addOptionalPropertyIfExist(survey, res, 'Key');
        this.addOptionalPropertyIfExist(survey, res, 'Name');
        this.addOptionalPropertyIfExist(survey, res, 'Description');

        return res;
    }
}