import { CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyQuestion, SurveyQuestionType } from '../../../model/survey.model';

@Component({
    selector: 'addon-question-builder',
    templateUrl: './question-builder.component.html',
    styleUrls: ['./question-builder.component.scss', './question-builder.component.theme.scss']
})
export class QuestionBuilderComponent implements OnInit {

    @Input() question: SurveyQuestion;
    @Input() sequenceNumber: string;
    @Input() isActive: boolean = false;
    
    private _editable = false;
    @Input()
    set editable(value: boolean) {
        this._editable = value;
    }
    get editable(): boolean {
        return this._editable;
    }

    @Output() dragExited: EventEmitter<CdkDragExit> = new EventEmitter();
    @Output() dragEntered: EventEmitter<CdkDragEnter> = new EventEmitter();
    @Output() questionClick: EventEmitter<void> = new EventEmitter();

    constructor(
        private surveysService: SurveysService
    ) { }

    ngOnInit(): void {
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }
    
    onDragStart(event: CdkDragStart) {
        this.surveysService.onQuestionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onQuestionDragEnd(event);
    }

    onDragExited(event: CdkDragExit) {
        this.dragExited.emit(event);
    }

    onDragEntered(event: CdkDragEnter) {
        this.dragEntered.emit(event);
    }

    onQuestionClicked(event: any) {
        this.questionClick.emit();
        event.stopPropagation();
    }
}
