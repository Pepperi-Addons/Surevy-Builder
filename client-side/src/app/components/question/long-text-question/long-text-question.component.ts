import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'addon-long-text-question',
    templateUrl: './long-text-question.component.html',
    styleUrls: ['./long-text-question.component.scss']
})
export class LongTextQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
