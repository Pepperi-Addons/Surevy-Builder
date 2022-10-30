import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { SurveysService } from 'src/app/services/surveys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { SurveyTemplateQuestion, SurveyTemplateQuestionType } from 'shared';
import { IPepMenuStateChangeEvent } from '@pepperi-addons/ngx-lib/menu';

@Component({
    selector: 'survey-question-generator',
    templateUrl: './question-generator.component.html',
    styleUrls: ['./question-generator.component.scss', './question-generator.component.theme.scss']
})
export class QuestionGeneratorComponent implements OnInit {
    @Input() question: SurveyTemplateQuestion;
    @Input() sequenceNumber: string;
    @Input() isActive: boolean = false;
    @Input() hasError: boolean = false;

    private _editable = false;
    @Input()
    set editable(value: boolean) {
        this._editable = value;
    }
    get editable(): boolean {
        return this._editable;
    }

    @Output() questionClick: EventEmitter<void> = new EventEmitter();
    @Output() addQuestionClick: EventEmitter<SurveyTemplateQuestionType> = new EventEmitter();

    protected isGrabbing = false;
    protected isQuestionTypeMenuOpen = false;

    constructor(
        private surveysService: SurveysService,
        private validationService: ValidationService
    ) { }
    
    ngOnInit(): void {
        if (this.editable) {
            this.surveysService.isGrabbingChange$.subscribe((value: boolean) => {
                this.isGrabbing = value;
            });
        }
    }

    onDragStart(event: CdkDragStart) {
        this.surveysService.onQuestionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onQuestionDragEnd(event);
    }

    onQuestionClicked(event: any) {
        this.questionClick.emit();
        // This is for click.
        // event.stopPropagation();
    }

    onAddQuestionClicked(type: SurveyTemplateQuestionType) {
        this.addQuestionClick.emit(type);
    }
    
    onQuestionValueChanged(value: any): void {
        this.question.Value = value;
        this.surveysService.onSurveyQuestionValueChange(this.question.Key, value);
    }
    
    onStateChange(event: IPepMenuStateChangeEvent) {
        this.isQuestionTypeMenuOpen = event.state === 'visible';
        console.log('onStateChange', event);
    }

    isValidQuestion(){
        return !this.validationService?.failedOnValidation?.includes('question'+this.sequenceNumber);
    }
}
