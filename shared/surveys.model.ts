import { AddonData } from "@pepperi-addons/papi-sdk";

export const SURVEYS_TABLE_NAME = 'Surveys';
// export const SURVEYS_TABLE_NAME = 'surveys';
export const SURVEY_TEMPLATES_TABLE_NAME = 'SurveyTemplates';
// export const SURVEY_TEMPLATES_TABLE_NAME = 'surveyTemplates';
export const DRAFT_SURVEY_TEMPLATES_TABLE_NAME = 'SurveyTemplatesDrafts';
// export const DRAFT_SURVEY_TEMPLATES_TABLE_NAME = 'surveyTemplatesDrafts';

export const SURVEY_LOAD_EVENT_NAME = 'OnSurveyLoad';
export const SURVEY_LOAD_CLIENT_EVENT_NAME = 'OnClientSurveyLoad';
export const SURVEY_UNLOAD_EVENT_NAME = 'OnSurveyUnload';
export const SURVEY_UNLOAD_CLIENT_EVENT_NAME = 'OnClientSurveyUnload';
export const SURVEY_FIELD_CHANGE_EVENT_NAME = 'OnSurveyFieldChange';
export const SURVEY_FIELD_CHANGE_CLIENT_EVENT_NAME = 'OnClientSurveyFieldChange';
export const SURVEY_QUESTION_CHANGE_EVENT_NAME = 'OnSurveyQuestionChange';
export const SURVEY_QUESTION_CHANGE_CLIENT_EVENT_NAME = 'OnClientSurveyQuestionChange';

export type SurveyStatusType = 'Submitted' | 'In Creation';

export interface SurveyTemplate extends AddonData {
    Name: string;
    Description?: string;
    Active: boolean;
    ActiveDateRange?: SurveyTemplateDateRange;
    Sections: SurveyTemplateSection[];
    Status?: SurveyStatusType;
}

// Temp need to remove it when will be integrated with papi-sdk
export interface Survey extends AddonData {
    // status keyword values (not free text)
    Status?:string;
    // unique ID - ?
    ExternalID?:string;
    // reference to the SurveyTemplate
    Template:string;
    // contains object
    Answers?:Answer[];
    // the UUID of the user who created the survey
    // mandatory
    Creator?:string;
    // the UUID of the account the survey was created for
    // mandatory??
    Account?:string;
    // // the UUID of the user who last updated the survey
    // Performer: string;
}
export interface Answer {
    QuestionKey: string;
    Value: any;
}

export interface SurveyTemplateDateRange {
    From?: string;
    To?: string;
}

export interface SurveyTemplateSection {
    Key: string;
    // Name?: string;
    Title: string;  
    Description?: string;
    Questions: SurveyTemplateQuestion[];
    // ShowIf?: any;
}

export type SurveyTemplateQuestionType = 'short-text' | 'long-text' 
    | 'single-selection-dropdown' | 'single-selection-radiobuttons' 
    | 'multiple-selection-dropdown' | 'multiple-selection-checkboxes'
    | 'boolean-toggle'
    | 'number' | 'decimal' | 'currency' | 'percentage'
    | 'date' | 'datetime'
    | 'photo'
    | 'signature'
    ;

export interface SurveyTemplateQuestion {
    Key: string;
    // Name?: string;
    Title: string;  
    Description?: string;
    Type: SurveyTemplateQuestionType;
    Mandatory?: boolean; 
    ShowIf?: any;
    Value?: any;
    Visible?: boolean;
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