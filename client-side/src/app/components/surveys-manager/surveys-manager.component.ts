import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { first, Subscription, firstValueFrom } from 'rxjs';
import { PepAddonService, PepLayoutService, PepScreenSizeType, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { IPepGenericListDataSource, IPepGenericListPager, IPepGenericListActions, IPepGenericListInitData, PepGenericListService } from "@pepperi-addons/ngx-composite-lib/generic-list";
import { DataViewFieldType, GridDataViewField, Page } from '@pepperi-addons/papi-sdk';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { NavigationService } from "../../services/navigation.service";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { SurveysService } from "../../services/surveys.service";
import { MY_DATE_FORMATS, MomentUtcDateAdapter, MomentUtcDateTimeAdapter } from "../../model/survey.model";
import { Survey, SurveyRowProjection } from "shared";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { getCalture } from "@pepperi-addons/ngx-lib/date";
import { DatetimeAdapter, MAT_DATETIME_FORMATS } from '@mat-datetimepicker/core';

import { utc } from "moment";

@Component({
    selector: 'surveys-manager',
    templateUrl: './surveys-manager.component.html',
    styleUrls: ['./surveys-manager.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useFactory: getCalture, deps:[PepLayoutService] },
        { provide: DateAdapter, useClass: MomentUtcDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
        { provide: DatetimeAdapter, useClass: MomentUtcDateTimeAdapter },
        { provide: MAT_DATETIME_FORMATS, useValue: MY_DATE_FORMATS },
    ],
})
export class ServeysManagerComponent implements OnInit, OnDestroy {
    screenSize: PepScreenSizeType;

    dataSource: IPepGenericListDataSource;
    //actions: IPepGenericListActions;

    totalSurveys: number = 0;
    surveys: SurveyRowProjection[];
    //imagesPath = '';
    //hasSurevy = true;
    private _subscriptions: Subscription[] = [];

    constructor(
        public layoutService: PepLayoutService,
        private pepAddonService: PepAddonService,
        public translate: TranslateService,
        private _navigationService: NavigationService,        
        private _activatedRoute: ActivatedRoute,
        private surveysService: SurveysService,
        private dialog: PepDialogService,
        private adapter: DateAdapter<any>,
        private utilitiesService: PepUtilitiesService,
    ) {
        this.pepAddonService.setShellRouterData({ showSidebar: true, addPadding: true});
       
        this._subscriptions.push(this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        }));
    }

    ngOnInit() {
        //
        this.dataSource = this.setDataSource();
        //this.actions = this.setActions();
    }

    formatDate(value,isDateTime){
        const parseDate = this.utilitiesService.parseDate(value, isDateTime);
        const dateModel = utc(parseDate);

        if (dateModel === null || !dateModel.isValid()) {
            return '';
        } else {
            const format = isDateTime
                ? MY_DATE_FORMATS.display.datetimeInput
                : MY_DATE_FORMATS.display.dateInput;
            return this.adapter.format(dateModel, format);
        }
    }
    setDataSource() {
        return {
            init: async (params) => {

                let options = 'order_by=';

                if (params.sorting) {
                    options += `${params.sorting.sortBy} ${params.sorting?.isAsc ? 'ASC' : 'DESC'}`;
                } else {
                    options += 'Name ASC';
                }
                if (params.searchString?.length > 0) {
                    options += `&where=${params.searchString}`;
                }
                
                this.surveys = await firstValueFrom(this.surveysService.getSurveys(this._navigationService.addonUUID, encodeURI(options)));

                this.surveys.forEach(sur => {
                    let fromDate = '';
                    if(sur?.ActiveDateRange != null && sur?.ActiveDateRange.From != null){
                        fromDate = this.formatDate(sur.ActiveDateRange.From,false);
                    }
                    let toDate = '';
                    if(sur?.ActiveDateRange != null && sur?.ActiveDateRange.To != null){
                        toDate = this.formatDate(sur.ActiveDateRange.To,false);
                    }

                    sur['DateRange'] = fromDate.length || toDate.length ? fromDate +' - ' + toDate : '';
                });
                
                this.totalSurveys = this.surveys.length;

                return {
                    items: this.surveys,
                    totalCount: this.surveys.length,
                    dataView: {
                        Context: {
                            Name: '',
                            Profile: { InternalID: 0 },
                            ScreenSize: 'Landscape'
                        },
                        Type: 'Grid',
                        Title: '',
                        Fields: [
                            this.getRegularReadOnlyColumn('Name', 'Link',),
                            this.getRegularReadOnlyColumn('Description'),
                            this.getRegularReadOnlyColumn('Active', 'Boolean'),
                            this.getRegularReadOnlyColumn('DateRange'),
                            this.getRegularReadOnlyColumn('Draft', 'Boolean'),
                            this.getRegularReadOnlyColumn('Published', 'Boolean'),
                            //this.getRegularReadOnlyColumn('CreationDate', 'DateAndTime'),
                            this.getRegularReadOnlyColumn('ModificationDate', 'DateAndTime'),
                            // this.getRegularReadOnlyColumn('Status')
                        ],
                        Columns: [
                            { Width: 20 },
                            { Width: 25 },
                            { Width: 8 },
                            { Width: 24 },
                            { Width: 6 },
                            { Width: 10 },
                            { Width: 17 }
                        ],
                        FrozenColumnsCount: 0,
                        MinimumColumnWidth: 0
                    }
                } as IPepGenericListInitData;
            }
        }
    }

    actions: IPepGenericListActions = {        
        get: async (data: PepSelectionData) => {
            if (data?.rows.length === 1 ) {
                return [{
                        title: this.translate.instant("ACTIONS.EDIT"),
                        handler: async (data: PepSelectionData) => {
                            this._navigationService.navigateToSurvey(data?.rows[0]);
                        }
                    }, {
                        title: this.translate.instant("ACTIONS.DELETE"),
                        handler: async (data: PepSelectionData) => {
                            if (data?.rows.length > 0) {
                                this.deleteSurvey(data?.rows[0]);
                            }
                        }
                    }
                ]
            } 
            else {
                return [];
            }
        }
    }

    private getRegularReadOnlyColumn(columnId: string, columnType: DataViewFieldType = 'TextBox'): GridDataViewField {
        return {
            FieldID: columnId,
            Type: columnType,
            Title: this.translate.instant(`SURVEYS_MANAGER.GRID_HEADER.${columnId.toUpperCase()}`),
            Mandatory: false,
            ReadOnly: true
        }
    }

    onSurveyClicked(event) {
        this._navigationService.navigateToSurvey(event.id);
    }

    onAddSurveyClicked() {
        this.surveysService.createNewSurvey(this._navigationService.addonUUID, this.totalSurveys).pipe(first()).subscribe((survey: Survey) => {
            if (survey) {
                this._navigationService.navigateToSurvey(survey.Key);
            } else {
                // TODO: show error.
            }
        });
    }

    deleteSurvey(surveyID: string) {
        const content = this.translate.instant('SURVEYS_MANAGER.DELETE_SURVEY.MSG');
        const title = this.translate.instant('SURVEYS_MANAGER.DELETE_SURVEY.TITLE');
        const dataMsg = new PepDialogData({title, actionsType: "cancel-delete", content});

        this.dialog.openDefaultDialog(dataMsg).afterClosed().pipe(first()).subscribe((isDeletePressed) => {
            if (isDeletePressed) {
                this.surveysService.deleteSurvey(this._navigationService.addonUUID, surveyID).pipe(first()).subscribe((res) => {
                         this.dataSource = this.setDataSource();
                 });
            }
        });
    }

    ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe);
    }

}