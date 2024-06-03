import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable, Subject, takeUntil } from "rxjs";
import { CdkDragDrop, CdkDragEnd, CdkDragStart  } from '@angular/cdk/drag-drop';
import { SurveysService } from '../../services/surveys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { BaseDestroyerDirective, PepLayoutService, PepScreenSizeType, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
import { NavigationService } from '../../services/navigation.service';
import { SurveyTemplate, SurveyTemplateSection } from "shared";
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import * as _ from 'lodash';

export interface ISurveyRuntimeHostObject {
    // surveyParams: any;
    [key: string]: any;
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
export class SurveyBuilderComponent extends BaseDestroyerDirective implements OnInit, OnDestroy {
    @ViewChild('sectionsCont', { static: true }) sectionsContainer: ElementRef;

    @Input() editMode: boolean = false;
    @Input() previewMode: boolean = false;
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
    protected pepMenuItems: Array<PepMenuItem> = null;
    protected isSubmitted = false;
    protected surveyName = '';

    constructor(
        private route: ActivatedRoute,
        private renderer: Renderer2,
        private navigationService: NavigationService,
        private utilitiesService: PepUtilitiesService,
        private layoutService: PepLayoutService,
        private surveysService: SurveysService,
        private validationService: ValidationService
    ) {
        super();
    }

    private setSurveyDataProperties(survey: SurveyTemplate) {
        if (survey) {
            this.isSubmitted = survey?.StatusName === 'Submitted';
            this.surveyName = survey?.Name;
        }
    }

    ngOnInit() {
        // debugger;
        const addonUUID = this.navigationService.addonUUID;
        // This is survey key if it's runtime an if not it's the survey template key (for builder)
        const key = 
            this.hostObject?.state?.survey_key || // This is the new pages way to pass the parameters (Pages 1.0).
            this.hostObject?.pageParameters?.survey_key || 
            this.route?.snapshot?.params['survey_template_key'] || '';

        console.log((this.editMode ? 'surveyTemplateKey - ' : 'surveyKey - ') + key);
        if (key.length > 0) {
            const queryParams = this.route?.snapshot?.queryParams;
            
            // If it's edit mode get the data of the survey and the relations from the Server side, Else - get the survey from the CPI side.
            if (this.editMode) {
                this.surveysService.loadSurveyTemplateBuilder(addonUUID, key, queryParams);
            } else { 
                this.surveysService.loadSurvey(key);
            }

            this.layoutService.onResize$.pipe(this.getDestroyer()).subscribe((size: PepScreenSizeType) => {
                this.screenSize = size;
            });
            
            this.surveysService.sectionsChange$.pipe(this.getDestroyer()).subscribe((sections: SurveyTemplateSection[]) => {
                if (this.editMode) {
                    this._sectionsSubject.next(sections);
                } else {
                    // Use the merge for let UI update and not override the existing.
                    // NOTICE: I use _.merge only cause in runtime the sections are not change only the questions inside. 
                    const tmp = _.merge(this._sectionsSubject.value, sections);
                    this._sectionsSubject.next(tmp);
                }
            });
            
            this.surveysService.surveyLoad$.subscribe((survey: SurveyTemplate) => {
                this.setSurveyDataProperties(survey);
            });

            this.surveysService.surveyDataChange$.subscribe((survey: SurveyTemplate) => {
                this.setSurveyDataProperties(survey);
            });

            if (this.editMode) {
                this.surveysService.selectedSectionChange$.pipe(this.getDestroyer()).subscribe((section: SurveyTemplateSection) => {
                    this.selectedSection = section;
                });

                this.surveysService.isGrabbingChange$.pipe(this.getDestroyer()).subscribe((value: boolean) => {
                    this.isGrabbing = value;
                });
            } else {
                // // Load menu items.
                // this.pepMenuItems = new Array<PepMenuItem>();
                // this.pepMenuItems.push({
                //     key: 'key',
                //     text: 'test',
                //     type: 'regular'
                // });
            }
        } else {
            // TODO: Show error message key isn't supply.
        }
    }

    ngOnDestroy() {
        this.surveysService.unloadSurveyData();
    }

    onSectionDropped(event: CdkDragDrop<any[]>) {
        this.surveysService.onSectionDropped(event);
    }

    isValidSection(index){
        return this.validationService?.failedOnValidation?.includes('section'+(index+1));
    }

    onCloseSurvey() {
        this.surveysService.unloadSurvey();
    }

    onChangeSurveyStatus() {
        this.surveysService.changeSurveyStatus(this.isSubmitted ? 'InCreation' : 'Submitted');
    }

    onMenuItemClicked(event: IPepMenuItemClickEvent) {

    }
}
