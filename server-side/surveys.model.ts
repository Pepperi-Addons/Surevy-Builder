import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name?: string;
    Description?: string;
    
}

export interface SurveyRowProjection {
    Key?: string,
    Name?: string,
    Description?: string,
    CreationDate?: string,
    ModificationDate?: string,
    Published: boolean,
    Draft: boolean
}


export interface ISurveyBuilderData {
    survey: Survey, 
}

export const DEFAULT_BLANK_SURVEY_DATA: Survey = {
    "Name": "Name of survey",
    //  optional
    "Description": "Description of survey",
}