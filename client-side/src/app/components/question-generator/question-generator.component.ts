import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { SurveysService } from 'src/app/services/surveys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { SurveyTemplateQuestion, SurveyTemplateQuestionType } from 'shared';
import { IPepMenuStateChangeEvent } from '@pepperi-addons/ngx-lib/menu';
import { IPepFieldClickEvent } from '@pepperi-addons/ngx-lib';

@Component({
    selector: 'survey-question-generator',
    templateUrl: './question-generator.component.html',
    styleUrls: ['./question-generator.component.scss', './question-generator.component.theme.scss']
})
export class QuestionGeneratorComponent implements OnInit, AfterViewInit {
    private _question: SurveyTemplateQuestion;
    @Input() 
    set question(value: SurveyTemplateQuestion) {
        this._question = value;
debugger;
        this.questionValue = this.question.Value || '';
        this.valueLength = this.questionValue ? this.questionValue.length : 0;
    }
    get question(): SurveyTemplateQuestion {
        return this._question;
    }

    @Input() sequenceNumber: string;
    @Input() isActive: boolean = false;
    @Input() hasError: boolean = false;
    @Input() disabled: boolean = false;

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

    protected valueLength = 0;
    protected questionValue: any = '';

    protected selectedQuestionKey = '';

    constructor(
        private surveysService: SurveysService,
        private validationService: ValidationService
    ) { 
        this.surveysService.selectedQuestionChange$.subscribe((question: SurveyTemplateQuestion) => {
            this.selectedQuestionKey = question?.Key || '';
        });
    }
    
    ngOnInit(): void {
        this.surveysService.questionChange$.subscribe((question: SurveyTemplateQuestion) => {
            if (question && this.question.Key === question.Key) {
                this.question = question;
            }
        });

        if (this.editable) {
            this.surveysService.isGrabbingChange$.subscribe((value: boolean) => {
                this.isGrabbing = value;
            });
        }

        
    }

    ngAfterViewInit(): void {
    }

    onDragStart(event: CdkDragStart) {
        this.surveysService.onQuestionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onQuestionDragEnd(event);
        this.validationService.validateSurvey();
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
        // console.log(`value change - ${value}`);
        this.question.Value = this.questionValue = value;
        this.surveysService.changeSurveyQuestionValue(this.question.Key, value);
    }

    onKeyup(event) {
        this.valueLength = event?.target?.value?.length || 0;
    }
    
    onStateChange(event: IPepMenuStateChangeEvent) {
        this.isQuestionTypeMenuOpen = event.state === 'visible';
        // console.log('onStateChange', event);
    }

    isValidQuestion(){
        return !this.validationService?.failedOnValidation?.includes('question'+this.sequenceNumber);
    }

    onDeleteFile(event: any) {
        // Handle delete of the file
        this.surveysService.handleSurveyQuestionClick(this.question.Key, 'Delete');
    }

    onFileClick(event: IPepFieldClickEvent) {
        // Handle view of the file.
        this.surveysService.handleSurveyQuestionClick(this.question.Key, 'View');
    }
    
    onChooseFile(event: any) {
        // Handle for choose file.
        this.surveysService.handleSurveyQuestionClick(this.question.Key, 'Set');

    }
}
