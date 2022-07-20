import { Injectable } from "@angular/core";
import { PepButton } from '@pepperi-addons/ngx-lib/button';

@Injectable()
export class YesNoQuestionService {
    private _questionItems: PepButton[] = [];

    get questionItems() {
        return this._questionItems;
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