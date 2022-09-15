import { AddonData } from "@pepperi-addons/papi-sdk";

export const SURVEYS_TABLE_NAME = 'SurveysTemplate';
export const DRAFT_SURVEYS_TABLE_NAME = 'SurveysTemplateDrafts';

export interface SurveyTemplate extends AddonData {
    Name: string;
    Description?: string;
    Active: boolean;
    ActiveDateRange?: SurveyTemplateDateRange;
    Sections: SurveyTemplateSection[];
}

export interface SurveyTemplateDateRange {
    From?: string;
    To?: string;
}

export interface SurveyTemplateSection {
    Key: string;
    Name?: string;
    Title: string;  
    Description?: string;
    Questions: SurveyTemplateQuestion[];
    ShowIf?: string;
}

export type SurveyTemplateQuestionType = 'short-text' | 'long-text' 
    | 'single-selection-dropdown' // | 'single-selection-radiobuttons' 
    | 'multiple-selection-dropdown' //  | 'multiple-selection-checkboxs'
    | 'boolean-toggle'
    | 'number' | 'decimal' | 'currency' | 'percentage'
    | 'date' | 'datetime'
    // | 'photo'
    // | 'signature'
    ;

export interface SurveyTemplateQuestion {
    Key: string;
    Name?: string;
    Title: string;  
    Description?: string;
    Type: SurveyTemplateQuestionType;
    Mandatory?: boolean; 
    ShowIf?: string;
    [key: string]: any;
}

export interface SurveyTemplateRowProjection {
    Key?: string,
    Name?: string,
    Description?: string,
    Active: boolean,
    ActiveDateRange?: SurveyTemplateDateRange,
    Draft: boolean
    Published: boolean,
    ModificationDate?: string,
}


export interface ISurveyTemplateBuilderData {
    survey: SurveyTemplate, 
}

export const DEFAULT_BLANK_SURVEY_DATA: SurveyTemplate = {
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