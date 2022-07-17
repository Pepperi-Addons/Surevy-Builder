import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { QuestionMenuService } from './question-menu.service';
import { SurveysService } from "../../services/surveys.service";
import { SurveyQuestionType } from 'src/app/model/survey.model';
import { PepSizeType, PepStyleType } from '@pepperi-addons/ngx-lib';

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

}
