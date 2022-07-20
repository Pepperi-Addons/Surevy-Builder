import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name?: string;
    Description?: string;
    Active?: boolean;
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

export type SurveyOptionStateType =  'collapse' | 'expand';

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

export type SurveyRowStatusType = 'draft' | 'published';
export interface ISurveyRowModel {
    Key: string,
    Name: string,
    Description: string,
    Active: boolean,
    ActiveDateRange: SurveyDateRange,
    Draft: boolean
    Published: boolean,
    ModificationDate: string,
}

export interface ISurveyBuilderData {
    survey: Survey
}

export interface ISurveyEditor {
    key: string,
    name: string,
    description: string,
    active?: boolean;
    activeDateRange?: { from?: string, to?: string };
}
