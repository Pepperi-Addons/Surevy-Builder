import { Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnInit, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { TranslateService } from '@ngx-translate/core';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { SurveySection } from "../../model/survey.model";

@Component({
    selector: 'section',
    templateUrl: './section.component.html',
    styleUrls: ['./section.component.scss', './section.component.theme.scss']
})
export class SectionComponent implements OnInit {
    @ViewChild('sectionContainer') sectionContainerRef: ElementRef;
    
    @Input() section: SurveySection;
    @Input() sectionsColumnsDropList = [];

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

    constructor(
        private renderer: Renderer2,
        private surveysService: SurveysService
        // private translate: TranslateService,
    ) { }

   
    ngOnInit(): void {
    }

    onDragStart(event: CdkDragStart) {
        this.surveysService.onSectionDragStart(event);
    }

    onDragEnd(event: CdkDragEnd) {
        this.surveysService.onSectionDragEnd(event);
    }

}
