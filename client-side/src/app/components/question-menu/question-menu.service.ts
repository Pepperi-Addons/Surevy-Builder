import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { firstValueFrom, forkJoin, of, Observable } from 'rxjs';

@Injectable()
export class QuestionMenuService {
    //private _menuItems: Promise<PepMenuItem[]>;
    private _menuItems: PepMenuItem[] = [];
    

    get menuItems() {
        //return this._menuItems;
        return this._menuItems;
    }

    constructor(private _translate: TranslateService) {
         this.loadMenuItems();
        //this._menuItems = this.getMenuItems();
    }
    
        async loadMenuItems() {
            this._menuItems = [
                {
                    key: `short-text`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.SHORT_TEXT')),
                    iconName: 'text_short_text'
                },
                {
                    key: `long-text`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.LONG_TEXT')),
                    iconName: 'text_long_text'
                },
                {
                    key: `multiple-selection-dropdown`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.MULTIPLE_SELECTION_DROPDOWN')),
                    iconName: 'system_ok'
                },
                {
                    key: `single-selection-dropdown`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.SINGLE_SELECTION_DROPDOWN')),
                    iconName: 'system_radio_btn'
                },
                {
                    key: `multiple-selection-checkboxes`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.CHECKBOX')),
                    iconName: 'system_select'
                },
                {
                    key: `single-selection-radiobuttons`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.RADIO_GROUP')),
                    iconName: 'system_radio_btn'
                },
                {
                    key: `boolean-toggle`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.BOOLEAN_TOGGLE')),
                    iconName: 'system_boolean'
                },           
                {
                    key: `number`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.NUMBER')),
                    iconName: 'number_number'
                },
                {
                    key: `decimal`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.DECIMAL')),
                    iconName: 'number_decimal'
                },           
                {
                    key: `currency`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.CURRENCY')),
                    iconName: 'number_coins'
                },
                {
                    key: `percentage`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.PERCENTAGE')),
                    iconName: 'number_percent'
                },  
                {
                    key: `date`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.DATE')),
                    iconName: 'time_cal'
                },
                {
                    key: `datetime`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.DATE_TIME')),
                    iconName: 'time_datetime'
                }//,
                // {
                //     key: `photo`,
                //     text: await firstValueFrom(this._translate.get('QUESTION_MENU.PHOTO')),
                //     iconName: 'system_signature'
                // },
                // {
                //     key: `signature`,
                //     text: await firstValueFrom(this._translate.get('QUESTION_MENU.SIGNATURE')),
                //     iconName: 'system_signature'
                // }
            ]
        } 

    getMenuItems(): Promise<PepMenuItem[]> {
        return new Promise(async (resolve, reject) => {
            resolve([
                {
                    key: `short-text`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.SHORT_TEXT')),
                    iconName: 'text_short_text'
                },
                {
                    key: `long-text`,
                    text: await firstValueFrom(this._translate.get('QUESTION_MENU.LONG_TEXT')),
                    iconName: 'text_long_text'
                }
            ]);
        });
    }
    
   
}

