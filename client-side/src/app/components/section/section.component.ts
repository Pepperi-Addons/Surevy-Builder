import { Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnInit, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { TranslateService } from '@ngx-translate/core';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { SurveyQuestion, SurveySection } from "../../model/survey.model";

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
        this.sectionQuestionKeyPrefix = this.surveysService.getSectionQuestionKey(value);
    }
    get index(): number {
        return this._index;
    }

    @Input() name: string;
    // @Input() description: string;
    @Input() isActive: boolean = false;
    @Input() questions: Array<SurveyQuestion>;
    @Input() selectedQuestionIndex: number = -1;

    @Input() sectionsQuestionsDropList = [];

    private _editable = false;
    @Input()
    set editable(value: boolean) {
        this._editable = value;
    }
    get editable(): boolean {
        return this._editable;
    }

    private _screenSize: PepScreenSizeType;
    @Input()
    set screenSize(value: PepScreenSizeType) {
        this._screenSize = value;
    }
    get screenSize(): PepScreenSizeType {
        return this._screenSize;
    }

    protected sectionQuestionKeyPrefix = ''
    protected selectedQuestion: SurveyQuestion = null;

    constructor(
        private renderer: Renderer2,
        private surveysService: SurveysService
        // private translate: TranslateService,
    ) { }

   
    ngOnInit(): void {
        if (this.editable) {
            this.surveysService.selectedQuestionChange$.subscribe((question: SurveyQuestion) => {
                this.selectedQuestion = question;
            })
        }
    }

    onSectionClicked(event: any) {
        this.surveysService.setSelected(this.index);
        event.stopPropagation();
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

    onQuestionClicked(event: any, questionIndex: number) {
        this.surveysService.setSelected(this.index, questionIndex);
        event.stopPropagation();
    }
}
