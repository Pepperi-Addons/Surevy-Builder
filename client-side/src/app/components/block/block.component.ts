import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    // selector: 'survey-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
    @Input() hostObject: any;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    protected editMode = false;

    constructor(private translate: TranslateService) {
    }

    ngOnInit(): void {
        // debugger;
    }

    ngOnChanges(e: any): void {

    }
}
