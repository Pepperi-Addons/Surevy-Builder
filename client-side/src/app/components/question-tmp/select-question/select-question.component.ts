import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'survey-select-question',
    templateUrl: './select-question.component.html',
    styleUrls: ['./select-question.component.scss']
})
export class SelectQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
