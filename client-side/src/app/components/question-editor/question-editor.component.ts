import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyQuestion, SurveyQuestionType } from '../../model/survey.model';
import { DestoyerDirective } from '../../model/destroyer';

@Component({
    selector: 'survey-question-editor',
    templateUrl: './question-editor.component.html',
    styleUrls: ['./question-editor.component.scss', './question-editor.component.theme.scss']
})

export class QuestionEditorComponent extends DestoyerDirective implements OnInit, OnDestroy {
    
    question: SurveyQuestion;
   
    forNextVersion = false;
    constructor(
        
        private surveysService: SurveysService
    ) { 
        super();
        this.surveysService.selectedQuestionChange$.pipe(this.destroy$).subscribe(res => {
           if(res){
             this.question = res;
           }
        });
    }

    ngOnInit(): void {
      
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    
    onQuestionEditorFieldChanged(key,value) {
        this.question[key] = value;
        // TODO - WAIT TO NEW FUNCTION FROM TOMER 
        //this.surveysService.notifySelectedQuestionChange(this.question);
        //this.surveysService.updateSurveyFromEditor()
        //this._surveysService.updateSurveyFromEditor(this.surveyEditor);
    }

    onShowLogicClick(event) {
      
    }

    addNewSelectOption(event){
        //let option = new ();
        //option.id = (this.configuration?.cards.length);

        //this.configuration?.cards.push( card); 
        //this.updateHostObject(); 
    }
}
