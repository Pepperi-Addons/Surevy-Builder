import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { YesNoQuestionService } from './yes-no-question.service';
import { PepButton,IPepButtonClickEvent } from '@pepperi-addons/ngx-lib/button';

@Component({
    selector: 'survey-yes-no-question',
    templateUrl: './yes-no-question.component.html',
    styleUrls: ['./yes-no-question.component.scss'],
    providers: [YesNoQuestionService]
})
export class YesNoQuestionComponent implements OnInit {
    @Input() value: '';

    _mandatory = false;
    @Input() 
    set mandatory(val: boolean) {        
        this._mandatory == val;
    }
    get mandatory() {
        return this._mandatory;
    }
    @Input() 
    set yesTitle(val: string) {
        this._yesNoQuestionService.yesTitle = val;
    }
    
    @Input()
    set noTitle(val: string) {
        this._yesNoQuestionService.noTitle = val;
    }

    @Output() valueChange = new EventEmitter<string>();
    
    get buttons() {
        return this._yesNoQuestionService.questionItems;
    }

    constructor(private _yesNoQuestionService: YesNoQuestionService) {
        //
    }
    
    ngOnInit(): void {
    }

    onButtonClicked(button: PepButton) {                   
        this.valueChange.emit(button === null ? null : button.key);
    }

}
