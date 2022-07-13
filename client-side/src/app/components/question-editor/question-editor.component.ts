import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyQuestion, SurveyQuestionType } from '../../model/survey.model';

@Component({
    selector: 'survey-question-editor',
    templateUrl: './question-editor.component.html',
    styleUrls: ['./question-editor.component.scss', './question-editor.component.theme.scss']
})

export class QuestionEditorComponent implements OnInit {
    
    @Input() questionType: SurveyQuestionType;
    @Input() question: SurveyQuestion;
   
    constructor(
        private surveysService: SurveysService
    ) { }

    ngOnInit(): void {
        
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    
    onQuestionEditorFieldChanged(value) {
        //this.surveyEditor.name = value;
        //this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }
}
