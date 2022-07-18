import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name?: string;
    Description?: string;
    Active?: boolean;
    ActiveDateRange?: SurveyDateRange;
    Sections: SurveySection[];
}

export interface SurveyDateRange {
    From?: Date;
    To?: Date;
}

export interface SurveySection {
    Key: string;
    Name?: string;
    Title: string;
    Description?: string;
    Questions: SurveyQuestion[];
}

export class SurveyQuestionOption {
    Key: string;
    Value?: string;

    constructor(key,value) { 
        this.Key = key || '';
        this.Value = value || '';
    }
}

export type SurveyOptionState =  'collapse' | 'expand';

export type SurveyQuestionType = 'short-text' | 'long-text' 
    | 'multiple-selection-dropdown' //  | 'multiple-selection-checkboxs'
    | 'single-selection-dropdown' // | 'single-selection-radiobuttons' 
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
    CreationDate: string,
    ModificationDate: string,
    Published: boolean,
    Draft: boolean,
}

export interface ISurveyBuilderData {
    survey: Survey
}

export interface ISurveyEditor {
    key: string,
    name: string,
    description: string,
    active?: boolean;
    activeDateRange?: { from?: Date, to?: Date };
}
