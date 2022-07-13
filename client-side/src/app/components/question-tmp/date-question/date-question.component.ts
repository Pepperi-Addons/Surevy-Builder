import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'survey-date-question',
    templateUrl: './date-question.component.html',
    styleUrls: ['./date-question.component.scss']
})
export class DateQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
