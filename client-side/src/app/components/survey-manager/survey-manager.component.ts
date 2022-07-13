import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from "@angular/core";
import { FormGroup, FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { MonoTypeOperatorFunction, Subject, takeUntil } from 'rxjs';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from "../../services/surveys.service";
import { NavigationService } from '../../services/navigation.service';
import { ISurveyEditor } from "../../model/survey.model";
import { ISurveyEditorForm } from '../../model/forms';


@Component({
    selector: 'survey-manager',
    templateUrl: './survey-manager.component.html',
    styleUrls: ['./survey-manager.component.scss']
})
export class ServeyManagerComponent implements OnInit, OnDestroy {
    private readonly _destroy$: Subject<void> = new Subject();

    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    get f() {
        return this._form.controls;
    }

    get destroy$(): MonoTypeOperatorFunction<any> {
        return takeUntil(this._destroy$);
    }

    showEditor = true;
    screenSize: PepScreenSizeType;
    _form = new FormGroup<ISurveyEditorForm>({
        IsActive: new FormControl(true)
    });
    sectionsColumnsDropList = [];
    surveyEditor: ISurveyEditor;
    isActive = true;
    activeDateRangeOptions: any[] = [{ key: 'Active', value: 'Active date range' }];
    isActiveDateRangeSelected = false;

    menuItems = [
        {
            key: `question1`,
            text: 'question 1',
            iconName: 'arrow_left_alt'
        },
        {
            key: `question2`,
            text: 'question 2',
            iconName: 'arrow_left_alt'
        },
        {
            key: `question3`,
            text: 'question 3',
            iconName: 'arrow_left_alt'
        },
    ] //TEMP

    constructor(
        public layoutService: PepLayoutService,
        private _surveysService: SurveysService,
        private _navigationService: NavigationService,
        private _activatedRoute: ActivatedRoute,
        public translate: TranslateService
    ) {
        this.layoutService.onResize$.pipe(this.destroy$).subscribe(size => {
            this.screenSize = size;
        });

        // For update editor.
        this._surveysService.surveyEditorLoad$.pipe(this.destroy$).subscribe((editor) => {
            this.surveyEditor = editor;
        });
    }

    private subscribeEvents() {
        // Get the sections id's into sectionsColumnsDropList for the drag & drop.
        this._surveysService.sectionsChange$.pipe(this.destroy$).subscribe(res => {
            // Concat all results into one array.
            this.sectionsColumnsDropList = [].concat(...res.map(section => section.Key));
        });
    }

    ngOnInit() {
        console.log('loading ServeyManagerComponent');

        this.subscribeEvents();
        this.createForm();
    }

    private createForm() {
        this._form = new FormGroup<ISurveyEditorForm>({
            Key: new FormControl(null),
            Name: new FormControl(null),
            Description: new FormControl(null),
            IsActive: new FormControl(true),
            ActiveFromDate: new FormControl(null),
            ActiveToDate: new FormControl(null)
        });
    }



    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {
        this._navigationService.back(this._activatedRoute);
    }

    onActiveStateChanged(state: any) {
        console.log('onActiveStateChanged', state);
        this.isActive = state.value === 'true';
        if (!this.isActive) {
            this.isActiveDateRangeSelected = null;
        }
    }

    onActiveDateRangeChanged(val: string) {
        console.log('onActiveDateRangeChanged', val);
        this.isActiveDateRangeSelected = val === 'Active';
    }

    onAddSectionClicked() {
        this._surveysService.addSection();
    }

    onAddQuestionClicked(item) {
        console.log('onAddQuestionClicked', item);
    }

    onSurveyNameChanged(value) {
        debugger;
        this.surveyEditor.name = value;

        this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}