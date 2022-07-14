import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyOptionState, SurveyQuestion, SurveyQuestionType } from '../../model/survey.model';

@Component({
    selector: 'question-select-options',
    templateUrl: './select-options.component.html',
    styleUrls: ['./select-options.component.scss', './select-options.component.theme.scss']
})

export class QuestionSelectOptionsComponent implements OnInit {
    
    @Input() question: SurveyQuestion;
    @Input() id: number = 0
   
    optionState: SurveyOptionState = 'collapse';

    constructor(
        private surveysService: SurveysService
    ) { }

    ngOnInit(): void {
        
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    
    onQuestionEditorFieldChanged(event) {
        //this.surveyEditor.name = value;
        //this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    addNewSelectOption(event){
        //let option = new ();
        //option.id = (this.configuration?.cards.length);

        //this.configuration?.cards.push( card); 
        //this.updateHostObject(); 
    }

    onRemoveClick() {
        //this.removeClick.emit({id: this.id});
    }

    onEditClick() {
        this.optionState = this.optionState === 'collapse' ? 'expand' : 'collapse';
    }
}
