import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'addon-short-text-question',
    templateUrl: './short-text-question.component.html',
    styleUrls: ['./short-text-question.component.scss']
})
export class ShortTextQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
