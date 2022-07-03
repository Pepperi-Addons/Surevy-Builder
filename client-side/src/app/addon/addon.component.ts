import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';

import { AddonService } from "./addon.service";
import { IPepFormFieldClickEvent } from "@pepperi-addons/ngx-lib/form";

@Component({
    selector: 'addon-block',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss']
})
export class BlockComponent implements OnInit {
    @Input() hostObject: any;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    screenSize: PepScreenSizeType;
    public hasSurevy = false;

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

    navigateSurevyPage(fieldClickEvent: IPepFormFieldClickEvent = null){
        //this.navigationService.navigateToPage(fieldClickEvent.id);
    }
}
