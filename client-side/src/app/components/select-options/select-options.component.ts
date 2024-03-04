import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { SurveysService } from 'src/app/services/surveys.service';
// import { ValidationService } from 'src/app/services/validation.service';
import { SurveyOptionStateType } from '../../model/survey.model';
import { SurveyTemplateQuestion } from 'shared';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { TranslateService } from '@ngx-translate/core';

class SelectOption {
    state: SurveyOptionStateType; 
    id: number;
    option: IPepOption;
    hide: boolean;

    constructor(state: SurveyOptionStateType, id: number, option: IPepOption, hide: boolean) { 
        this.id = id || 0;
        this.state = state || 'collapse';
        this.option = option || { key: '', value: '' };
        this.hide = hide ?? false;
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
    actionsMenu: Array<PepMenuItem> = [];

    constructor(
        private translate: TranslateService,
        private surveysService: SurveysService,
        // private validationService: ValidationService
    ) { }

    ngOnInit(): void {
        this.numOfColumn = [
            { key: '1', value: '1', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)},
            { key: '2', value: '2', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)},
            { key: '3', value: '3', callback: (event: any) => this.onQuestionEditorFieldChanged('selectionColumns',event.source.key)}
        ];

        this.actionsMenu = [
            { key: 'delete', text: this.translate.instant('SURVEY_MANAGER.SURVEY_EDITOR.RIGHT_SIDE.ACTIONS.DELETE') },
            { key: 'hide', text: this.translate.instant('SURVEY_MANAGER.SURVEY_EDITOR.RIGHT_SIDE.ACTIONS.HIDE') },
            { key: 'show', text: this.translate.instant('SURVEY_MANAGER.SURVEY_EDITOR.RIGHT_SIDE.ACTIONS.SHOW') }
        ]
    }

    setOptionalValues(){
        this.selectOptions = [];
        this._question?.OptionalValues?.forEach((optVal, index) => {
            const optSel: IPepOption = { key: optVal.key, value: optVal.value };
            
            const opt = new SelectOption('collapse',this.selectOptions.length, optSel, optVal.hide);
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
        const opt = new SelectOption('collapse', this.selectOptions.length,optSel, false);
        this.selectOptions.push(opt);
        this.optionChanged.emit(this.selectOptions);
    }

    // onRemoveClick(option: SelectOption) {
    //     const index = this.selectOptions.findIndex(opt => opt.id === option.id);

    //     this.selectOptions.splice(index, 1);
    //     this.selectOptions.forEach((opt, index) => {opt.id = index; });

    //     this.optionChanged.emit(this.selectOptions);
    // }
    
    getActionsMenuForOption(option: SelectOption): Array<PepMenuItem> {
        if (option.hide) {
            return this.actionsMenu.filter(action => action.key !== 'hide');
        } else {
            return this.actionsMenu.filter(action => action.key !== 'show');
        }
    }

    onMenuItemClick(item: IPepMenuItemClickEvent, option: SelectOption){
        if(item?.source?.key == 'delete') {
            const index = this.selectOptions.findIndex(opt => opt.id === option.id);
            this.selectOptions.splice(index, 1);
            this.selectOptions.forEach((opt, index) => {opt.id = index; });
            this.optionChanged.emit(this.selectOptions);

        } else if(item?.source?.key == 'show') {
            option.hide = false;
            this.optionChanged.emit(this.selectOptions);
        } else if(item?.source?.key == 'hide') {
            option.hide = true;
            this.optionChanged.emit(this.selectOptions);
        }
    }

    onEditClick(event: any, option: SelectOption) {
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
