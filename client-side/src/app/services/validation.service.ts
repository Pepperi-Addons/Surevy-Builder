import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PepHttpService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { NavigationService } from "./navigation.service";
import { SurveyObjValidator } from "../model/survey.model";
import { SurveyTemplate, SurveyTemplateQuestion } from "shared";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { SurveysService } from "./surveys.service";
@Injectable({
    providedIn: 'root',
})
export class ValidationService {

    public mandaitoryfields: Array<SurveyObjValidator>;
    public failedOnValidation: Array<string> = [];
    private keysValidation = [];

    constructor(
        private translate: TranslateService,
        // private sessionService: PepSessionService,
        // private httpService: PepHttpService,
        // private navigationService: NavigationService,
        private dialog: PepDialogService,
        private surveysService: SurveysService
    ) {}

    validateSurvey(): boolean{
        this.failedOnValidation = [];
        
        const survey: SurveyTemplate = this.surveysService.getSurvey();
        this.mandaitoryfields =  [];
        this.keysValidation = [];
        const mandetoryFieldsArr = ['multiple-selection-dropdown','boolean-toggle'];

        survey.Sections.forEach((section,secIndex) => {
            //Checking the name & Title of the section
            this.keyAndTitleValidator(section, secIndex);
            
            section.Questions.forEach((question,quesIndex) => {
                //Checking the name & Title of the section
                this.keyAndTitleValidator(question, secIndex, quesIndex);
                    //Check if question type has mandatory fields
                if(mandetoryFieldsArr.includes(question.Type)){
                        this.checkQuestionMandatoryFields(question,secIndex, quesIndex);
                }
            });
        });


        const duplicateIds = this.keysValidation.map(v => v.key)
                                                .filter((v, i, vIds) => vIds.indexOf(v) === i)
        const duplicates = this.keysValidation.filter(obj => duplicateIds.includes(obj.key));
        
        duplicateIds.forEach( dupKey => {
            const dupArr = duplicates.filter(field => field.key === dupKey) || [];
            
            if(dupArr.length > 1){
                    const dupKeys = dupArr.map( field => field.index ).join(' & ') || ''; 
                    let text = '';
                    //push hidden objects just for the coloring in red. 
                    dupArr.forEach( (obj,index) => {
                        let type = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
                        text += `${type} ${obj.index} `+ (index < dupArr.length -1 ? '& ' : '');
                        this.mandaitoryfields.push( (new SurveyObjValidator(obj.type,'Key', obj.index ,'',true)));
                    });
        
                    const msg = `${text} ${this.translate.instant('VALIDATION.USING_SAME_KEY')}`;
                    this.mandaitoryfields.push( (new SurveyObjValidator('question','Key', dupKeys ,msg)));
                }
        });

        return this.mandaitoryfields.length ? false : true;
    }

    checkQuestionMandatoryFields(question: SurveyTemplateQuestion, secIndex, quesIndex){
        secIndex++;
        quesIndex++;
        switch(question.Type){
            case 'multiple-selection-dropdown':{
                question.OptionalValues.forEach((opt, optIndex) => {
                    const index = `${secIndex.toString()}.${quesIndex.toString()}`; // .${(optIndex+1).toString()}
                    if(opt.key.trim() == ''){
                        const msg = `'question' ${index} ${this.translate.instant('VALIDATION.KEY_MISSING')}`;
                        this.mandaitoryfields.push( (new SurveyObjValidator('question','Key', index , msg)));
                        
                    }
                    if(opt.value.trim() == ''){
                        const msg = `'question' ${index} ${this.translate.instant('VALIDATION.VALUE_MISSING')}`;
                        this.mandaitoryfields.push( new SurveyObjValidator('question','Value', index , msg));
                    }
                });
                break;
            }
        }
    }

    keyAndTitleValidator(obj, secIndex, quesIndex = 1){
        secIndex ++;
        quesIndex ++;
        const type = "Type" in obj ? 'question' : 'section';
        const index = type == 'section' ? `${secIndex.toString()}` : `${secIndex.toString()}.${quesIndex.toString()}`;
        
        // add key with index to array for duplicate keys validation
        this.keysValidation.push({key: obj.Key, index: index, type: type});
        
        if(obj.Key.trim() == ''){
            const msg = `${type} ${index} ${this.translate.instant('VALIDATION.KEY_MISSING')}`;
            this.mandaitoryfields.push( new SurveyObjValidator(type,'Key', index, msg));
        }

        if(obj.Title.trim() == ''){
            const msg = `${type} ${index} ${type == 'section' ? this.translate.instant('VALIDATION.NAME_MISSING') : this.translate.instant('VALIDATION.QUESTION_MISSING')}`;
            this.mandaitoryfields.push( (new SurveyObjValidator(type,'Title', index, msg)));
        }
    }

    showValidationInfo(){
        
        let content = '';
        
        this.mandaitoryfields.forEach((field,index) => { 
                if(!this.failedOnValidation.includes((field.type)+(field.index))){
                    this.failedOnValidation.push((field.type)+(field.index));
                }
                if(!field.hidden){
                    content +=  `${(field.error)}.${index < (this.mandaitoryfields.length - 1) ? '</br>' : ''}`;

                }
        });
       
        const title = this.translate.instant('VALIDATION.FAILED_MSG');
        const dataMsg = new PepDialogData({title, actionsType: "close", content});

        this.dialog.openDefaultDialog(dataMsg);
    }

}