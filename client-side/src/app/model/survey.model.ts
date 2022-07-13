import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Survey extends AddonData {
    Name?: string;
    Description?: string;
    Active?: boolean;
    ActiveDateRange?: SurveyDateRange;
    Sections?: SurveySection[];
}

export interface SurveyDateRange {
    From?: Date;
    To?: Date;
}

export interface SurveySection {
    Key: string;
    Name?: string;
    Title?: string;
    Questions?: SurveyQuestion[];
}

export type SurveyQuestionType = 
    'short-text' 
    | 'long-text' 
    | 'miltiple-select-dropdown' 
    | 'single-select-dropdown'
    | 'yes-no'
    | 'number-int'
    | 'number-decimal'
    | 'date'
    | 'date-time'
    | 'image'
    | 'signature';

export interface SurveyQuestion {
    Key: string;
    Type: SurveyQuestionType;
    Title?: string;
    Description?: string;
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
