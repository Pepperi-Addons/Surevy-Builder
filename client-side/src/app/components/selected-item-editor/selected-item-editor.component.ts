import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { SurveyTemplateQuestion, SurveyTemplateQuestionType, SurveyTemplateSection } from 'shared';
import { DestoyerDirective } from '../../model/destroyer';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { IPepQueryBuilderField } from '@pepperi-addons/ngx-lib/query-builder';
import { MatDialogRef } from '@angular/material/dialog';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { AdditionalField } from 'src/app/model/survey.model';

@Component({
    selector: 'survey-selected-item-editor',
    templateUrl: './selected-item-editor.component.html',
    styleUrls: ['./selected-item-editor.component.scss', './selected-item-editor.component.theme.scss']
})

export class SelectedItemEditorComponent extends DestoyerDirective implements OnInit, OnDestroy {
    @ViewChild('showIfDialogTemplate') showIfDialogTemplate: TemplateRef<any>;
    
    question: SurveyTemplateQuestion = null;
    section: SurveyTemplateSection = null;
    @Input() additionalFields: Record<string,AdditionalField> = {};

    private _sections: SurveyTemplateSection[] = [];
    protected showIfDialogRef: MatDialogRef<any> = null;

    constructor(
        protected surveysService: SurveysService,
        private validationService: ValidationService,
        private dialog: PepDialogService
    ) { 
        super();

        this.surveysService.selectedSectionChange$.pipe(this.destroy$).subscribe(res => {
            this.section = res;
        });

        this.surveysService.selectedQuestionChange$.pipe(this.destroy$).subscribe(res => {
            this.question = res;
        });

        this.surveysService.sectionsChange$.pipe(this.destroy$).subscribe((sections: SurveyTemplateSection[]) => {
            this._sections = sections;
        });
    }

    private doesQuestionTypeAllowShowIf(type: SurveyTemplateQuestionType) {
        return (type === 'single-selection-dropdown' ||
                type === 'single-selection-radiobuttons' ||
                type === 'multiple-selection-dropdown' ||
                type === 'multiple-selection-checkboxes' ||
                type === 'boolean-toggle');
    }

    /**
     * create a question-key array from all questions prior to the selected question with type boolean or select
     * @returns array of questions key
     */
     private getShowIfFields() {
        let fields: Array<IPepQueryBuilderField> = new Array<IPepQueryBuilderField>();

        // Go for all sections before the selected question and the section that contains this selected question.
        for (let i = 0; i <= this.surveysService.selectedSectionIndex; i++) {
            const currentSection = this._sections[i];

            if (currentSection) {
                // Go for all questions if we in the section before the selected question, Else go for all questions untill the this selected question index.
                const sectionQuestionsLength = i === this.surveysService.selectedSectionIndex ? this.surveysService.selectedQuestionIndex : currentSection.Questions.length;

                for (let j = 0; j < sectionQuestionsLength; j++) {
                    const currentQuestion = currentSection.Questions[j];
                    if (currentQuestion && this.doesQuestionTypeAllowShowIf(currentQuestion.Type)) {
                        fields.push({
                            FieldID: currentQuestion.Key,
                            Title: currentQuestion.Title,
                            FieldType: this.getShowIfQuestionType(currentQuestion.Type),
                            OptionalValues: currentQuestion.OptionalValues?.map((ov: IPepOption) => { return { Key: ov.key, Value: ov.value } }) || []
                        } as IPepQueryBuilderField);
                    }
    
                }
            }            
        }       
        
        return fields;
    }
    
    private getShowIfQuestionType(type: string) {
        switch (type) {
            case 'short-text':
            case 'long-text':
                return 'String';
            case 'single-selection-dropdown':
            case 'multiple-selection-dropdown':
                return 'MultipleStringValues';
            case 'boolean-toggle':
                return 'Bool'
            case 'number':
            case 'decimal':
            case 'currency':
            case 'percentage':
                return 'Integer';
            case 'date':
                return 'Date';
            case 'datetime':
                return 'DateTime';
        }
    }

    ngOnInit(): void {
    }

    openShowIfDialog() {
        // this.surveysService.openShowIfDialog();
        const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'large');
        const query = this.question?.ShowIf?? null;

        const data = {
            query: query,
            fields: this.getShowIfFields(),
            isValid: true,
            outputData: { query: '' }
        };

        this.showIfDialogRef = this.dialog.openDialog(this.showIfDialogTemplate, data, config);        
        this.showIfDialogRef.afterClosed().subscribe({
            next: (res) => {
                if (res != null) {
                    this.onQuestionEditorFieldChanged('ShowIf', res.query);
                }
            }     
        });
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    onQuestionEditorFieldChanged(key,value) {
        // const oldValue = this.question[key];
        this.question[key] = value;

        // Clear the show if value
        if (key === 'IsShowIf' && value === false) {
            this.question['ShowIf'] = null;
        }

        this.surveysService.updateQuestionFromEditor(this.question);

        if (key == 'Key' || key == 'Title') {
            if (!this.validationService.validateSurvey()) {
                this.validationService.showValidationInfo();
            }
        }
    }

    onSelectQuestionFieldChanged(event){
        this.onQuestionEditorFieldChanged(event.key, event.value);
    }

    onSectionEditorFieldChanged(key,value) {
        // const oldValue = this.section[key];
        this.section[key] = value;
        this.surveysService.updateSectionFromEditor(this.section);
        
        if (key == 'Key' || key == 'Title') {
            if (!this.validationService.validateSurvey()) {
                this.validationService.showValidationInfo();
            }
        }
    }

    onShowLogicClick(event) {
      
    }

    addNewSelectOption(event){
        //let option = new ();
        //option.id = (this.configuration?.cards.length);

        //this.configuration?.cards.push( card); 
        //this.updateHostObject(); 
    }

    selectOptionChanged(event) {
        let options: Array<any> = [];
        event.forEach(opt => {
            opt.option.value = opt.option.value.trim() == '' ? opt.option.key : opt.option.value;
            options.push({key: opt.option.key, value: opt.option.value});
        });

        this.question['OptionalValues'] = options;
        this.surveysService.updateQuestionFromEditor(this.question);

        if (!this.validationService.validateSurvey()) {
            this.validationService.showValidationInfo();
        }
    }
    
    onSidebarEndStateChange(state) {
        console.log('onSidebarEndStateChange', state);
    }

    onItemDuplicateClicked() {
        this.surveysService.duplicateSelectedItem();
    }

    onItemDeleteClicked() {
        this.surveysService.deleteSelectedItem();
        this.validationService.validateSurvey();
    }
}
