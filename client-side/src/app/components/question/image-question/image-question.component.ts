import { Component, OnInit } from '@angular/core';
import { BaseQuestionDirective } from '../model/base-question.directive';

@Component({
    selector: 'addon-image-question',
    templateUrl: './image-question.component.html',
    styleUrls: ['./image-question.component.scss']
})
export class ImageQuestionComponent extends BaseQuestionDirective implements OnInit {

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
