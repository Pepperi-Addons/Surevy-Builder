import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { IQuestionForm } from '../model/forms';

@Component({
    selector: 'question-builder',
    templateUrl: './question-builder.component.html',
    styleUrls: ['./question-builder.component.scss']
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

    constructor() { }

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

}
