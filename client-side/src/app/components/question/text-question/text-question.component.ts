import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'text-question',
    templateUrl: './text-question.component.html',
    styleUrls: ['./text-question.component.scss']
})
export class ShortTextQuestionComponent extends BaseQuestionDirective implements OnInit {
    
    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
