import { Injectable } from "@angular/core";
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';

@Injectable()
export class QuestionMenuService {
    private _menuItems: PepMenuItem[] = [];

    get menuItems() {
        return this._menuItems;
    }

    constructor() {
        this.loadMenuItems();
    }    

    loadMenuItems() {
        this._menuItems = [
            {
                key: `short-text`,
                text: 'Short Text',
                iconName: 'arrow_left_alt'
            },
            {
                key: `long-text`,
                text: 'Long Text',
                iconName: 'arrow_left_alt'
            },
            {
                key: `multiple-selection-drowdown`,
                text: 'Multiple Selection Dropdown',
                iconName: 'system_ok'
            },
            {
                key: `single-selection-drowdown`,
                text: 'Single Selection Dropdown',
                iconName: 'arrow_left_alt'
            },
            {
                key: `boolean-yes-no`,
                text: 'Yes/No',
                iconName: 'arrow_left_alt'
            },
            {
                key: `date`,
                text: 'Date',
                iconName: 'time_cal'
            },
            {
                key: `number`,
                text: 'Number',
                iconName: 'number_decimal'
            },
            {
                key: `photo`,
                text: 'Photo',
                iconName: 'arrow_left_alt'
            },
            {
                key: `signature`,
                text: 'Signature',
                iconName: 'system_signature'
            }
        ]
    }
}