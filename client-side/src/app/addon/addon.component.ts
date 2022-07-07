import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';

import { AddonService } from "./addon.service";

@Component({
    selector: 'addon-block',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss']
})
export class BlockComponent implements OnInit {
    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    screenSize: PepScreenSizeType;

    businesUnitOptions: any[] = [{key: '1', value: '1'}, {key: '2', value: '2'}, {key: '3', value: '4'}]; //TEMP

    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService
    ) {
        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });        
    }

    ngOnInit() {
    }

    openDialog() {

    }

    onSidebarStateChange(state) {
        console.log('onSidebarStateChange', state);
    }

    onNavigateBackFromEditor() {

    }

    onAddSectionClicked() {
        
    }
}
