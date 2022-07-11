import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { first, Subscription, firstValueFrom } from 'rxjs';
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { IPepGenericListDataSource, IPepGenericListPager, IPepGenericListActions, IPepGenericListInitData, PepGenericListService } from "@pepperi-addons/ngx-composite-lib/generic-list";
import { DataViewFieldType, GridDataViewField, Page } from '@pepperi-addons/papi-sdk';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { NavigationService } from "src/app/services/navigation.service";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { SurveysService, Survey, ISurveyRowModel } from "../../services/surveys.service";


@Component({
    selector: 'surveys-manager',
    templateUrl: './surveys-manager.component.html',
    styleUrls: ['./surveys-manager.component.scss']
})
export class ServeysManagerComponent implements OnInit, OnDestroy {
    screenSize: PepScreenSizeType;

    dataSource: IPepGenericListDataSource;
    //actions: IPepGenericListActions;

    addPadding = true;
    totalSurveys: number = 0;
    surveys: ISurveyRowModel[];
    //imagesPath = '';
    //hasSurevy = true;
    private _subscriptions: Subscription[] = [];

    constructor(
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        private _navigationService: NavigationService,        
        private _activatedRoute: ActivatedRoute,
        private surveysService: SurveysService,
        private dialog: PepDialogService,
    ) {
        this._subscriptions.push(this._activatedRoute.data.subscribe(data => {
            this.addPadding = data.addPadding ?? true;
        }));

        this._subscriptions.push(this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        }));
    }

    ngOnInit() {
        //
        this.dataSource = this.setDataSource();
        //this.actions = this.setActions();
    }

    setDataSource() {
        return {
            init: async (params) => {
                //TODO - get serveys from api and set the hasSurvey to true/false when get surveys
                // const serveys: any[] = [
                //     {
                //         Name: 'Survey 1',
                //         Description: 'Survey 1 description',
                //         CreationDate: '2022-07-04T07:16:28.928Z',
                //         ModificationDate: '2022-07-04T09:00:00.928Z',
                //         Published: false
                //     },
                //     {
                //         Name: 'Survey 2',
                //         Description: 'Survey 2 description',
                //         CreationDate: '2022-08-06T08:15:30.928Z',
                //         ModificationDate: '2022-08-06T08:15:30.928Z',
                //         Published: false
                //     }
                // ]; 

                // this.totalSurveys = 2;

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
                            this.getRegularReadOnlyColumn('CreationDate', 'DateAndTime'),
                            this.getRegularReadOnlyColumn('ModificationDate', 'DateAndTime'),
                            this.getRegularReadOnlyColumn('Published', 'Boolean'),
                            // this.getRegularReadOnlyColumn('Status')
                        ],
                        Columns: [
                            { Width: 20 },
                            { Width: 25 },
                            { Width: 20 },
                            { Width: 20 },
                            { Width: 15 }
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
            Title: `SURVEYS_MANAGER.GRID_HEADER.${columnId.toUpperCase()}`,// this.translate.instant(`SURVEYS_MANAGER.GRID_HEADER_${columnId.toUpperCase()}`),
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