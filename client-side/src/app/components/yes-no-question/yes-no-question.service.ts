import { Injectable } from "@angular/core";
import { PepButton } from '@pepperi-addons/ngx-lib/button';

@Injectable()
export class YesNoQuestionService {
    private _questionItems: PepButton[] = [];

    get questionItems() {
        return this._questionItems;
    }

    set yesTitle(val: string) {
        const item = this._questionItems.find(item => item.key === 'true');
        if (item) {
            item.value = val;
        }
    }

    set noTitle(val: string) {
        const item = this._questionItems.find(item => item.key === 'false');
        if (item) {
            item.value = val;
        }
    }

    constructor() {
        this.loadMenuItems();
    }    

    loadMenuItems() {
        this._questionItems = [
            {
                key: 'true',
                value: 'Yes'
            },
            {
                key: 'false',
                value: 'No'                
            }
        ]
    }
}