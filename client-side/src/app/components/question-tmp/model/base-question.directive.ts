import { Directive, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef, Renderer2, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({})
export abstract class BaseQuestionDirective implements OnInit, OnChanges, OnDestroy {
    private readonly _destroyed: Subject<void>;

    //@Input() formKey: string;

    private _form = new FormGroup({});
    @Input()
    set form(value: FormGroup) {
        this._form = value;
      //  this.addToParentForm();
    }

    protected get f() {
        return this._form.controls;
    }    

    constructor() {
        this._destroyed = new Subject();
    }

    ngOnInit(): void {
     //   this.createForm();
        //this.updateValidity();
    }

    /*
    private addToParentForm() {
        this._parentForm.setControl(this.formKey, this._form);
    } 

    private createForm() {
        this._form = new FormGroup({
            Key: new FormControl<string | null>(null),
            Type: new FormControl<string | null>(null),
            Text: new FormControl<string | null>(null),
            Description: new FormControl<string | null>(null)
        });
    } */

    protected addToForm(key: string, control: FormControl) {
        this._form.setControl(key, control);        
    }

    private updateValidity() {
        this.setQuestionStateAndValidators();
    }

    protected getDestroyer() {
        return takeUntil(this._destroyed);
    }

    // Set default validators - some childs override this.
    protected setQuestionStateAndValidators(): void {
        // TODO:
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }

}
