import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'addon-yes-no-question',
    templateUrl: './yes-no-question.component.html',
    styleUrls: ['./yes-no-question.component.scss']
})
export class YesNoQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
