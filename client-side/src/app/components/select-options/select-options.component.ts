import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { SurveysService } from 'src/app/services/surveys.service';
// import { ValidationService } from 'src/app/services/validation.service';
import { SurveyOptionStateType } from '../../model/survey.model';
import { SurveyTemplateQuestion } from 'shared';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PepButton } from '@pepperi-addons/ngx-lib/button';

class SelectOption {
    state: SurveyOptionStateType; 
    id: number;
    option: IPepOption;

    constructor(state: SurveyOptionStateType, id: number, option: IPepOption) { 
        this.id = id || 0;
        this.state = state || 'collapse';
        this.option = option || { key: '', value: '' };
    }
}
    
@Component({
    selector: 'question-select-options',
    templateUrl: './select-options.component.html',
    styleUrls: ['./select-options.component.scss', './select-options.component.theme.scss']
})

export class QuestionSelectOptionsComponent implements OnInit {
    
    public _question: SurveyTemplateQuestion;

    @Input()
    set question(value: SurveyTemplateQuestion) {
        this._question = value;
        this.setOptionalValues();
    }

    @Output() optionChanged: EventEmitter<any> = new EventEmitter();
    @Output() questionValueChanged: EventEmitter<any> = new EventEmitter<any>();
    

    selectOptions: Array<SelectOption> = [];
    optionsDropList = [];
    public numOfColumn : Array<PepButton> = [];

    constructor(
        private surveysService: SurveysService,
        // private validationService: ValidationService
    ) { }

    ngOnInit(): void {
        this.numOfColumn = [
            { key: '1', value: '1', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)},
            { key: '2', value: '2', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)},
            { key: '3', value: '3', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)}
        ] 
    }

    setOptionalValues(){
        this.selectOptions = [];
        this._question?.OptionalValues?.forEach((optVal, index) => {
            const optSel: IPepOption = { key: optVal.key, value: optVal.value };
            
            const opt = new SelectOption('collapse',this.selectOptions.length, optSel);
            this.selectOptions.push(opt);
        });

        if(this.selectOptions.length == 0) {
            this.addNewSelectOption(null);
            
        }
    }
    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    onQuestionOptionChanged(key, value ,event) {
        event.option[key] = value;
        this.optionChanged.emit(this.selectOptions);

        // if(!this.validationService.validateSurvey()){
        //     this.validationService.showValidationInfo();
        //   }
        
    }

    onQuestionEditorFieldChanged(key, event) {
        this.questionValueChanged.emit({key: key,value: event});
        //this.surveyEditor.name = value;
        //this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    addNewSelectOption(event){
        const optSel = { key: `Key_${this.selectOptions.length + 1}`, value: `Value ${this.selectOptions.length + 1}` };
        const opt = new SelectOption('collapse', this.selectOptions.length,optSel);
        this.selectOptions.push(opt);
        this.optionChanged.emit(this.selectOptions);
        
    }

    onRemoveClick(option) {
        const index = this.selectOptions.findIndex(opt => opt.id === option.id);

        this.selectOptions.splice(index, 1);
        this.selectOptions.forEach((opt, index) => {opt.id = index; });

        this.optionChanged.emit(this.selectOptions);

        
    }

    onEditClick(option) {
        option['state'] = option['state'] === 'collapse' ? 'expand' : 'collapse';
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
             moveItemInArray(this.selectOptions, event.previousIndex, event.currentIndex);
             this.optionChanged.emit(this.selectOptions);
        } 
    }

    onDragStart(event: CdkDragStart) {
        this.surveysService.onSectionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onSectionDragEnd(event);
    }
}
