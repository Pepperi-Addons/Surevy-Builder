import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable, Subject, takeUntil } from "rxjs";
import { CdkDragDrop, CdkDragEnd, CdkDragStart  } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { PepLayoutService, PepScreenSizeType, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
import { NavigationService } from '../../services/navigation.service';
import { SurveyTemplate, SurveyTemplateSection } from "shared";

export interface ISurveyRuntimeHostObject {
    // surveyParams: any;
    pageParameters: {
        survey_key: string,
        [key: string]: any;
    };
}

@Component({
    selector: 'survey-builder-internal',
    templateUrl: './survey-builder-internal.component.html',
    styleUrls: ['./survey-builder-internal.component.scss']
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
    @ViewChild('sectionsCont', { static: true }) sectionsContainer: ElementRef;

    @Input() editMode: boolean = false;
    @Input() sectionsQuestionsDropList = [];
    
    // For loading the survey in runtime.
    private _hostObject: ISurveyRuntimeHostObject;
    @Input()
    set hostObject(value: ISurveyRuntimeHostObject) {
        this._hostObject = value;
    }
    get hostObject(): ISurveyRuntimeHostObject {
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
    
    private _sectionsSubject: BehaviorSubject<SurveyTemplateSection[]> = new BehaviorSubject<SurveyTemplateSection[]>([]);
    get sections$(): Observable<SurveyTemplateSection[]> {
        return this._sectionsSubject.asObservable();
    }

    protected isGrabbing = false;
    protected selectedSection: SurveyTemplateSection = null;
    private readonly _destroyed: Subject<void>;

    constructor(
        private route: ActivatedRoute,
        private renderer: Renderer2,
        private navigationService: NavigationService,
        private utilitiesService: PepUtilitiesService,
        private layoutService: PepLayoutService,
        private surveysService: SurveysService,
        private validationService: ValidationService
    ) {
        this._destroyed = new Subject();
    }

    private getDestroyer() {
        return takeUntil(this._destroyed);
    }

    private setSurveyDataProperties(survey: SurveyTemplate) {
        if (survey && this.sectionsContainer?.nativeElement) {
            
        }
    }

    ngOnInit() {
        const addonUUID = this.navigationService.addonUUID;
        // This is survey key if it's runtime an if not it's the survey template key (for builder)
        const key = this.hostObject?.pageParameters?.survey_key || this.route?.snapshot?.params['survey_template_key'] || '';

        console.log((this.editMode ? 'surveyTemplateKey - ' : 'surveyKey - ') + key);
        if (key.length > 0) {
            const queryParams = this.route?.snapshot?.queryParams;
            
            this.surveysService.loadSurveyBuilder(addonUUID, key, this.editMode, queryParams);

            this.layoutService.onResize$.pipe(this.getDestroyer()).subscribe((size: PepScreenSizeType) => {
                this.screenSize = size;
            });
            
            if (this.editMode) {
                this.surveysService.sectionsChange$.pipe(this.getDestroyer()).subscribe((sections: SurveyTemplateSection[]) => {
                    this._sectionsSubject.next(sections);
                });
    
                this.surveysService.surveyDataChange$.pipe(this.getDestroyer()).subscribe((survey: SurveyTemplate) => {
                    this.setSurveyDataProperties(survey);
                });

                this.surveysService.selectedSectionChange$.pipe(this.getDestroyer()).subscribe((section: SurveyTemplateSection) => {
                    this.selectedSection = section;
                });

                this.surveysService.isGrabbingChange$.pipe(this.getDestroyer()).subscribe((value: boolean) => {
                    this.isGrabbing = value;
                });
            }
        } else {
            // TODO: Show error message key isn't supply.
        }
    }

    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();

        this.surveysService.unloadSurveyBuilder();
    }

    onSectionDropped(event: CdkDragDrop<any[]>) {
        this.surveysService.onSectionDropped(event);
    }

    isValidSection(index){
        return this.validationService?.failedOnValidation?.includes('section'+(index+1));
    }
}
