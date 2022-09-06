import { Inject, Injectable, Optional } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDatetimeAdapter } from "@mat-datetimepicker/moment";
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

@Injectable()
export class SurveyObjValidator {
    type: String;
    field: String;
    index: String;
    error: String;

    constructor(type: String = '', field: String = '', index: String = '', error: String = '') {
        this.type = type || '';
        this.field = field || '';
        this.index = index || '';
        this.error = error || '';
    }
}

export interface ISurveyEditor {
    key: string,
    name: string,
    description: string,
    active?: boolean;
    activeDateRange?: { from?: string, to?: string };
}

@Injectable()
export class MomentUtcDateTimeAdapter extends MomentDatetimeAdapter {
    constructor(@Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale, { strict: false, useUtc: false }, new MomentUtcDateAdapter(dateLocale));
    }
}

@Injectable()
export class MomentUtcDateAdapter extends MomentDateAdapter {
    constructor(@Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale);
    }
}


export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'L',
        monthInput: 'MMMM',
        timeInput: 'LT',
        datetimeInput: 'L LT',
    },
    display: {
        dateInput: 'L',
        monthInput: 'MMMM',
        timeInput: 'LT',
        datetimeInput: 'L LT',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
        popupHeaderDateLabel: 'ddd, DD MMM',
    },
};
