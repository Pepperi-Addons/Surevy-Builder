import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name?: string;
    Description?: string;
    Sections?: SurveySection[];
}

export interface SurveySection {
    Key: string;
    Name?: string;
    Title?: string;
    Questions?: SurveyQuestion[];
}
export interface SurveyQuestion {
    Key: string;
    [key: string]: any;
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