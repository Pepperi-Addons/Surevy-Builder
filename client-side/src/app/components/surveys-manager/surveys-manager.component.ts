import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { IPepGenericListDataSource, IPepGenericListPager, IPepGenericListActions, IPepGenericListInitData, PepGenericListService } from "@pepperi-addons/ngx-composite-lib/generic-list";
import { DataViewFieldType, GridDataViewField, Page } from '@pepperi-addons/papi-sdk';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { NavigationService } from "src/app/services/navigation.service";


@Component({
    selector: 'surveys-manager',
    templateUrl: './surveys-manager.component.html',
    styleUrls: ['./surveys-manager.component.scss']
})
export class ServeysManagerComponent implements OnInit {
    screenSize: PepScreenSizeType;

    dataSource: IPepGenericListDataSource;
    actions: IPepGenericListActions;

    addPadding = true;
    imagesPath = '';
    hasSurevy = true;

    constructor(
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        private _navigationService: NavigationService,        
        private _activatedRoute: ActivatedRoute,
    ) {
        this._activatedRoute.data.subscribe(data => {
            this.addPadding = data.addPadding ?? true;
        })

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });
    }

    ngOnInit() {
        //
        this.dataSource = this.setDataSource();
        this.actions = this.setActions();
    }

    setDataSource() {
        return {
            init: async (params) => {
                //TODO - get serveys from api
                const serveys: any[] = [
                    {
                        Name: 'Survey 1',
                        Description: 'Survey 1 description',
                        CreationDate: '2022-07-04T07:16:28.928Z',
                        ModificationDate: '2022-07-04T09:00:00.928Z',
                        Published: false
                    },
                    {
                        Name: 'Survey 2',
                        Description: 'Survey 2 description',
                        CreationDate: '2022-08-06T08:15:30.928Z',
                        ModificationDate: '2022-08-06T08:15:30.928Z',
                        Published: false
                    }
                ]; //TEMP
                return {

                    items: serveys,
                    totalCount: serveys.length,
                    dataView: {
                        Context: {
                            Name: '',
                            Profile: { InternalID: 0 },
                            ScreenSize: 'Landscape'
                        },
                        Type: 'Grid',
                        Title: '',
                        Fields: [
                            this.getRegularReadOnlyColumn('Name', 'Link'),
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

    setActions(): IPepGenericListActions {
        return {
            get: async (data: PepSelectionData) => {
                return [];
            }
        }
    }

    private getRegularReadOnlyColumn(columnId: string, columnType: DataViewFieldType = 'TextBox'): GridDataViewField {
        return {
            FieldID: columnId,
            Type: columnType,
            Title: this.translate.instant(`SURVEYS_MANAGER.GRID_HEADER_${columnId.toUpperCase()}`),
            Mandatory: false,
            ReadOnly: true
        }
    }

    onSurveyClicked(event) {
        // this._router.navigate([`./addons/cf17b569-1af4-45a9-aac5-99f23cae45d8/surveys/123abc?dev=true`]);
        this._navigationService.navigateToSurvey('123abc');
    }

    onAddSurveyClicked() {

    }


}