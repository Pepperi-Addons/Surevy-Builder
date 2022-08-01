import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name: string;
    Description?: string;
    Active: boolean;
    ActiveDateRange?: SurveyDateRange;
    Sections: SurveySection[];
}

export interface SurveyDateRange {
    From?: string;
    To?: string;
}

export interface SurveySection {
    Key: string;
    Name?: string;
    Title: string;  
    Description?: string;
    Questions: SurveyQuestion[];
}

export type SurveyQuestionType = 'short-text' | 'long-text' 
    | 'single-selection-dropdown' // | 'single-selection-radiobuttons' 
    | 'multiple-selection-dropdown' //  | 'multiple-selection-checkboxs'
    | 'boolean-toggle'
    | 'number' | 'decimal' | 'currency' | 'percentage'
    | 'date' | 'datetime'
    // | 'photo'
    // | 'signature'
    ;

export interface SurveyQuestion {
    Key: string;
    Name?: string;
    Title: string;  
    Description?: string;
    Type: SurveyQuestionType;
    Mandatory?: boolean; 
    [key: string]: any;
}

export interface SurveyRowProjection {
    Key?: string,
    Name?: string,
    Description?: string,
    Active: boolean,
    ActiveDateRange?: SurveyDateRange,
    Draft: boolean
    Published: boolean,
    ModificationDate?: string,
}


export interface ISurveyBuilderData {
    survey: Survey, 
}

export const DEFAULT_BLANK_SURVEY_DATA: Survey = {
    "Name": "",
    //  optional
    "Description": "",
    "Active": true,
    "Sections": [
        {
            "Key": "",
            "Title": "",
            "Questions": []
        }
    ]
}