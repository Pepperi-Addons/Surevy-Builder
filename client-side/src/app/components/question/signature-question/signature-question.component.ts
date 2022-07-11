import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'addon-signature-question',
    templateUrl: './signature-question.component.html',
    styleUrls: ['./signature-question.component.scss']
})
export class SignatureQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
