import { Inject, Injectable, Optional } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDatetimeAdapter } from "@mat-datetimepicker/moment";


export type SurveyOptionStateType =  'collapse' | 'expand';

export type SurveyRowStatusType = 'draft' | 'published';

export type AdditionalFieldType = 'String' | 'Bool' | 'Integer' | 'Double';

export class SurveyObjValidator {
    type: string;
    field: string;
    index: string;
    error: string;
    hidden: boolean;

    constructor(Type = '', Field = '', Index = '', Error = '', Hidden = false) {
        this.type = Type,
        this.field = Field;
        this.index = Index;
        this.error = Error;
        this.hidden = Hidden;
    }
}

export interface ISurveyEditor {
    key: string,
    name: string,
    description: string,
    active?: boolean;
    activeDateRange?: { from?: string, to?: string };
}

export class AdditionalField {
    type: AdditionalFieldType = 'String';
    description: string;

    constructor(Type = 'String', Description = '') {
        this.type = 'String';
        this.description = Description;
    }
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
