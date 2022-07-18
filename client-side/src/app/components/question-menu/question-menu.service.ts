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
                key: `multiple-selection-dropdown`,
                text: 'Multiple Selection Dropdown',
                iconName: 'arrow_left_alt'
            },
            {
                key: `single-selection-dropdown`,
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
                iconName: 'arrow_left_alt'
            },
            {
                key: `number`,
                text: 'Number',
                iconName: 'arrow_left_alt'
            },
            {
                key: `photo`,
                text: 'Photo',
                iconName: 'arrow_left_alt'
            },
            {
                key: `signature`,
                text: 'Signature',
                iconName: 'arrow_left_alt'
            }
        ]
    }
}