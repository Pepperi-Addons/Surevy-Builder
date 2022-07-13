import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { IQuestionForm } from '../model/forms';
import { CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyQuestion, SurveyQuestionType } from '../../../model/survey.model';

@Component({
    selector: 'addon-question-builder',
    templateUrl: './question-builder.component.html',
    styleUrls: ['./question-builder.component.scss', './question-builder.component.theme.scss']
})
export class QuestionBuilderComponent implements OnInit {
    @Input() formKey: string;

    //private _parentForm;
    @Input()
    set parentForm(value: FormGroup) {
        // this._parentForm = value;
        this.addToParentForm(value);
    }

    get f() {
        return this.form.controls;
    }

    form = new FormGroup<IQuestionForm>({});

    type: string = 'abc'; //Temp

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
        this.createForm();
    }

    private createForm() {
        this.form = new FormGroup<IQuestionForm>({
            Key: new FormControl(null),
            Type: new FormControl(null),
            Text: new FormControl(null),
            Description: new FormControl(null)
        });
    }

    private addToParentForm(parent: FormGroup) {
        parent.setControl(this.formKey, this.form);
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
