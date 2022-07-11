import { Directive, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef, Renderer2, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({})
export abstract class BaseQuestionDirective implements OnInit, OnChanges, OnDestroy {
    private readonly _destroyed: Subject<void>;

    protected _parentForm: FormGroup;
    @Input()
    set parentForm(form: FormGroup) {
        this._parentForm = form;
        this.updateParentForm();
    }
    
    form: FormGroup;
    
    constructor() {
        this._destroyed = new Subject();
    }
    
    private updateValidity() {
        this.setQuestionStateAndValidators();
    }

    protected getDestroyer() {
        return takeUntil(this._destroyed);
    }
    
    protected updateParentForm() {
        // TODO:
        // this._parentForm.setControl('questionId', this.builder.control(this.field.id));
        
    }

    // Set default validators - some childs override this.
    protected setQuestionStateAndValidators(): void {
        // TODO:
    }
    
    ngOnInit(): void {
        if (this.form) {
            this.updateValidity();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
    
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }

}
