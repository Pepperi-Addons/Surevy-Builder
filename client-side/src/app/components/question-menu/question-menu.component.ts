import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { QuestionMenuService } from './question-menu.service';
import { SurveysService } from "../../services/surveys.service";
import { SurveyQuestionType } from 'shared';
import { PepSizeType, PepStyleType } from '@pepperi-addons/ngx-lib';
import { IPepMenuStateChangeEvent } from '@pepperi-addons/ngx-lib/menu';

@Component({
    selector: 'survey-question-menu',
    templateUrl: './question-menu.component.html',
    styleUrls: ['./question-menu.component.scss'],
    providers: [QuestionMenuService]
})
export class QuestionMenuComponent implements OnInit {

    @Input() styleType: PepStyleType = 'weak';
    @Input() sizeType: PepSizeType = 'md';
    
    @Output() questionTypeClick: EventEmitter<SurveyQuestionType> = new EventEmitter();
    @Output() onStateChange: EventEmitter<IPepMenuStateChangeEvent> = new EventEmitter();
    
    get menuItems() {
        return this._questionMenuService.menuItems;
    }

    constructor(
        private _questionMenuService: QuestionMenuService,
        private _surveysService: SurveysService) { }

    ngOnInit(): void {
    }

    onAddQuestionClicked(item) {        
        this.questionTypeClick.emit(item.key);
    }

    onStateChanged(event: IPepMenuStateChangeEvent) {
        this.onStateChange.emit(event);
    }
}
