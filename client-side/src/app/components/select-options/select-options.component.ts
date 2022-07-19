import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyOptionState, SurveyQuestion, SurveyQuestionOption} from '../../model/survey.model';

class selectOption{
    state: SurveyOptionState; 
    id: number;
    option: SurveyQuestionOption;

    constructor(state,id,option) { 
        this.id = id || 0;
        this.state = state || 'collapse';
        this.option = option || new SurveyQuestionOption('','');
    }
}
    
@Component({
    selector: 'question-select-options',
    templateUrl: './select-options.component.html',
    styleUrls: ['./select-options.component.scss', './select-options.component.theme.scss']
})

export class QuestionSelectOptionsComponent implements OnInit {
    
    @Input() question: SurveyQuestion;
    // @Input() OptionalValues: Array<SurveyQuestionOption> = [];

    @Output() optionChanged: EventEmitter<any> = new EventEmitter();
    @Output() questionValueChanged: EventEmitter<any> = new EventEmitter<any>();
    

    selectOptions: Array<selectOption> = [];
    
    constructor(
        private surveysService: SurveysService
    ) { }

    ngOnInit(): void {

        this.question?.OptionalValues?.forEach((optVal, index) => {
            const optSel = new SurveyQuestionOption(optVal.key,optVal.value);
            
            const opt = new selectOption('collapse',this.selectOptions.length,optSel);
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
        
    }

    onQuestionEditorFieldChanged(key, event) {
        this.questionValueChanged.emit({key: key,value: event});
        //this.surveyEditor.name = value;
        //this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    addNewSelectOption(event){
        const optSel = new SurveyQuestionOption('','');
        const opt = new selectOption('collapse',this.selectOptions.length,optSel);
        this.selectOptions.push(opt);
        this.optionChanged.emit(this.selectOptions);
        
    }

    onRemoveClick(option) {
        const index = this.selectOptions.findIndex(opt => opt.id === option.id);

        this.selectOptions.splice(index, 1);
        this.selectOptions.forEach(function(opt, index) {opt.id = index; });

        this.optionChanged.emit(this.selectOptions);

        
    }

    onEditClick(option) {
        option['state'] = option['state'] === 'collapse' ? 'expand' : 'collapse';
    }
}
