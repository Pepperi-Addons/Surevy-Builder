import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { SurveyTemplateQuestion, SurveyTemplateQuestionType } from "shared";
import { IPepMenuStateChangeEvent } from '@pepperi-addons/ngx-lib/menu';

@Component({
    selector: 'section',
    templateUrl: './section.component.html',
    styleUrls: ['./section.component.scss', './section.component.theme.scss']
})
export class SectionComponent implements OnInit {
    private _index = -1;
    @Input()
    set index(value: number) {
        this._index = value;
        this.sectionContainerKeyPrefix = this.surveysService.getSectionContainerKey(value.toString());
    }
    get index(): number {
        return this._index;
    }

    @Input() title: string;
    @Input() description: string;
    @Input() disabled: boolean = false;
    @Input() isActive: boolean = false;
    @Input() hasError: boolean = false;

    @Input() questions: Array<SurveyTemplateQuestion>;
    @Input() showIf: boolean = false;
    
    @Input() sectionsQuestionsDropList = [];

    private _editable = false;
    @Input()
    set editable(value: boolean) {
        this._editable = value;
    }
    get editable(): boolean {
        return this._editable;
    }

    @Input() previewMode: boolean = false;

    private _screenSize: PepScreenSizeType;
    @Input()
    set screenSize(value: PepScreenSizeType) {
        this._screenSize = value;
    }
    get screenSize(): PepScreenSizeType {
        return this._screenSize;
    }

    protected sectionContainerKeyPrefix = ''
    protected selectedQuestion: SurveyTemplateQuestion = null;
    protected isGrabbing = false;
    protected isQuestionTypeMenuOpen = false;

    constructor(
        private renderer: Renderer2,
        private surveysService: SurveysService
        // private translate: TranslateService,
    ) { }

   
    ngOnInit(): void {
        if (this.editable) {
            this.surveysService.selectedQuestionChange$.subscribe((question: SurveyTemplateQuestion) => {
                this.selectedQuestion = question;
            });

            this.surveysService.isGrabbingChange$.subscribe((value: boolean) => {
                this.isGrabbing = value;
            });
        }
    }

    onSectionClicked(event: any) {
        this.surveysService.setSelected(this.editable, this.index);
        // This is for click.
        // event.stopPropagation();
    }

    onQuestionDropped(event: CdkDragDrop<any[]>) {
        this.surveysService.onQuestionDropped(event, this.index);
    }
    
    onDragStart(event: CdkDragStart) {
        this.surveysService.onSectionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onSectionDragEnd(event);
    }

    onQuestionClicked(questionIndex: number) {
        this.surveysService.setSelected(this.editable, this.index, questionIndex);
    }
    
    onAddSectionClicked() {
        this.surveysService.addSection(this.index + 1);
    }

    onAddQuestionClicked(type: SurveyTemplateQuestionType, questionIndex: number = -1) {
        this.surveysService.addQuestion(type, this.index, questionIndex);
    }
    onStateChange(event: IPepMenuStateChangeEvent) {
        this.isQuestionTypeMenuOpen = event.state === 'visible';
    }
}
