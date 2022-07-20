import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';

@Injectable()
export class QuestionMenuService {
    private _menuItems: PepMenuItem[] = [];

    get menuItems() {
        return this._menuItems;
    }

    constructor(private _translate: TranslateService) {
        this.loadMenuItems();
        
        this.AsyncTrans('', () => {});
    }    

    loadMenuItems() {
        this._menuItems = [
            {
                key: `short-text`,
                text: 'Short Text',
                iconName: 'text_short_text'
            },
            {
                key: `long-text`,
                text: 'Long Text',
                iconName: 'text_long_text'
            },
            {
                key: `multiple-selection-dropdown`,
                text: 'Multiple Select',
                iconName: 'system_ok'
            },
            {
                key: `single-selection-dropdown`,
                text: 'Single Select',
                iconName: 'system_radio_btn'
            },
            {
                key: `boolean-toggle`,
                text: 'Yes/No',
                iconName: 'system_boolean'
            },           
            {
                key: `number`,
                text: 'Number',
                iconName: 'number_number'
            },
            {
                key: `decimal`,
                text: 'Decimal',
                iconName: 'number_decimal'
            },           
            {
                key: `currency`,
                text: 'Currency',
                iconName: 'number_coins'
            },
            {
                key: `percentage`,
                text: 'Percentage',
                iconName: 'number_percent'
            },  
            {
                key: `date`,
                text: 'Date',
                iconName: 'time_cal'
            },
            {
                key: `datetime`,
                text: 'Date Time',
                iconName: 'time_datetime'
            }
        ]
    }

    AsyncTrans(key: string, callback) {        
        this._translate.get('QUESTION_MENU.LONG_TEXT').subscribe(text => {
            callback({
                key: `short-text`,
                text: text,
                iconName: 'text_short_text'
            });
        });
    }
}