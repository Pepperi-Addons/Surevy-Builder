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
    // id: string,
    key: string,
    name: string,
    description: string,
    
}