import { AddonData } from "@pepperi-addons/papi-sdk";

export const SURVEYS_TABLE_NAME = 'MySurveys';
export const SURVEYS_BASE_TABLE_NAME = 'surveys'; // 'baseSurveys'
export const SURVEY_TEMPLATES_TABLE_NAME = 'MySurveyTemplates';
export const SURVEY_TEMPLATES_BASE_TABLE_NAME = 'survey_templates'; // 'baseSurveyTemplates'
export const DRAFT_SURVEY_TEMPLATES_TABLE_NAME = 'SurveyTemplatesDrafts';

export const RESOURCE_NAME_PROPERTY = 'ResourceName';

// **********************************************************************************************
//                          Client & User events const
// **********************************************************************************************
export const CLIENT_ACTION_ON_CLIENT_SURVEY_LOAD = 'OnClientSurveyLoad';
export const USER_ACTION_ON_SURVEY_DATA_LOAD = 'OnSurveyDataLoad';
export const USER_ACTION_ON_SURVEY_VIEW_LOAD = 'OnSurveyViewLoad';

export const CLIENT_ACTION_ON_CLIENT_SURVEY_UNLOAD = 'OnClientSurveyUnload';
export const USER_ACTION_ON_SURVEY_VIEW_UNLOAD = 'OnSurveyUnload';

export const CLIENT_ACTION_ON_CLIENT_SURVEY_FIELD_CHAGE = 'OnClientSurveyFieldChange';
export const USER_ACTION_ON_SURVEY_FIELD_CHANGED = 'OnSurveyFieldChanged';

export const CLIENT_ACTION_ON_CLIENT_SURVEY_QUESTION_CHANGE = 'OnClientSurveyQuestionChange';
export const USER_ACTION_ON_SURVEY_QUESTION_CHANGED = 'OnSurveyQuestionChanged';

export const CLIENT_ACTION_ON_CLIENT_SURVEY_TEMPLATE_LOAD = 'OnClientSurveyBuilderLoad'; // OnClientSurveyTemplateLoad
export const USER_ACTION_ON_SURVEY_TEMPLATE_VIEW_LOAD = 'OnSurveyBuilderLoad'; // OnSurveyTemplateViewLoad

// **********************************************************************************************

export type SurveyStatusType = 'Submitted' | 'InCreation';

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
    surveyTemplate: SurveyTemplate, 
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