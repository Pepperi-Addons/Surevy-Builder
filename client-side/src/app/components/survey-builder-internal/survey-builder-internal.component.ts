import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CdkDragDrop  } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { TranslateService } from '@ngx-translate/core';
import { PepLayoutService, PepScreenSizeType, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
import { NavigationService } from 'src/app/services/navigation.service';
import { Survey, SurveySection } from "../../model/survey.model";

export interface ISurveyBuilderHostObject {
    surveyKey: string;
    surveyParams: any;
}

@Component({
    selector: 'survey-builder-internal',
    templateUrl: './survey-builder-internal.component.html',
    styleUrls: ['./survey-builder-internal.component.scss']
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
    @ViewChild('sectionsCont', { static: true }) sectionsContainer: ElementRef;

    @Input() editMode: boolean = false;
    @Input() sectionsColumnsDropList = [];
    
    // For loading the survey from the client apps.
    private _hostObject: ISurveyBuilderHostObject;
    @Input()
    set hostObject(value: ISurveyBuilderHostObject) {
        this._hostObject = value;
    }
    get hostObject(): ISurveyBuilderHostObject {
        return this._hostObject;
    }

    private _screenSize: PepScreenSizeType;
    @Input()
    set screenSize(value: PepScreenSizeType) {
        this._screenSize = value;
    }
    get screenSize(): PepScreenSizeType {
        return this._screenSize;
    }
    
    private _sectionsSubject: BehaviorSubject<SurveySection[]> = new BehaviorSubject<SurveySection[]>([]);
    get sections$(): Observable<SurveySection[]> {
        return this._sectionsSubject.asObservable();
    }

    constructor(
        private route: ActivatedRoute,
        private renderer: Renderer2,
        private navigationService: NavigationService,
        private utilitiesService: PepUtilitiesService,
        private layoutService: PepLayoutService,
        private surveysService: SurveysService
    ) {
    }

    private setSurveyDataProperties(survey: Survey) {
        if (survey && this.sectionsContainer?.nativeElement) {
            
        }
    }

    ngOnInit() {
        const addonUUID = this.navigationService.addonUUID;
        const surveyKey = this.hostObject?.surveyKey || this.route.snapshot.data['survey_key'] || this.route?.snapshot?.params['survey_key'] || '';

        console.log('surveyKey - ' + surveyKey);
        if (surveyKey.length > 0) {
            const queryParams = this.hostObject?.surveyParams || this.route?.snapshot?.queryParams;
            
            this.surveysService.loadSurveyBuilder(addonUUID, surveyKey, this.editMode, queryParams);

            this.layoutService.onResize$.subscribe((size: PepScreenSizeType) => {
                this.screenSize = size;
            });

            this.surveysService.sectionsChange$.subscribe(res => {
                this._sectionsSubject.next(res);
            });

            this.surveysService.surveyDataChange$.subscribe((survey: Survey) => {
                this.setSurveyDataProperties(survey);
            });
        } else {
            // TODO: Show error message key isn't supply.
        }
    }

    ngOnDestroy() {
        this.surveysService.unloadSurveyBuilder();
    }

    onSectionDropped(event: CdkDragDrop<any[]>) {
        this.surveysService.onSectionDropped(event);
    }

}
