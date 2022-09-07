import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SurveysService } from 'src/app/services/surveys.service';
import { SurveyQuestion, SurveySection } from '../../model/survey.model';
import { DestoyerDirective } from '../../model/destroyer';

@Component({
    selector: 'survey-selected-item-editor',
    templateUrl: './selected-item-editor.component.html',
    styleUrls: ['./selected-item-editor.component.scss', './selected-item-editor.component.theme.scss']
})

export class SelectedItemEditorComponent extends DestoyerDirective implements OnInit, OnDestroy {
    
    question: SurveyQuestion = null;
    section: SurveySection = null;

    forNextVersion = false;
    
    constructor(
        protected surveysService: SurveysService
    ) { 
        super();

        this.surveysService.selectedSectionChange$.pipe(this.destroy$).subscribe(res => {
            this.section = res;
        });

        this.surveysService.selectedQuestionChange$.pipe(this.destroy$).subscribe(res => {
            this.question = res;
        });
    }

    ngOnInit(): void {
      
    }

    onQuestionValueChanged(value: any): void {
        // TODO: implement
    }

    
    onQuestionEditorFieldChanged(key,value) {
        this.question[key] = value;
        this.surveysService.updateQuestionFromEditor(this.question);

        if(key == 'Key' || key == 'Title'){
            if(!this.surveysService.validateSurvey()){
              this.surveysService.showValidationInfo();
            }
         }
    }

    onSelectQuestionFieldChanged(event){
        this.onQuestionEditorFieldChanged(event.key, event.value);
    }

    onSectionEditorFieldChanged(key,value) {
        this.section[key] = value;
        this.surveysService.updateSectionFromEditor(this.section);
        
        if(key == 'Key' || key == 'Title'){
           if(!this.surveysService.validateSurvey()){
             this.surveysService.showValidationInfo();
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

    selectOptionChanged(event){
        let options: Array<any> = [];
        event.forEach(opt => {
            options.push({key: opt.option.key, value: opt.option.value});
        });

        this.question['OptionalValues'] = options;
        this.surveysService.updateQuestionFromEditor(this.question);
    }
    
    onSidebarEndStateChange(state) {
        console.log('onSidebarEndStateChange', state);
    }

    onItemDuplicateClicked() {
        this.surveysService.duplicateSelectedItem();
    }

    onItemDeleteClicked() {
        this.surveysService.deleteSelectedItem();
    }
}
