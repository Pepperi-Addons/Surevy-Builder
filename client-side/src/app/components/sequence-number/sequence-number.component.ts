import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'survey-sequence-number',
    templateUrl: './sequence-number.component.html',
    styleUrls: ['./sequence-number.component.scss']
})

export class SequenceNumberComponent implements OnInit {
    @Input() value: string;
    
    protected isHoverOnSequenceNumber = false;
    
    constructor() { 
        
    }

    ngOnInit(): void {
      
    }

    onSequenceNumberMouseEnter() {
        this.isHoverOnSequenceNumber = true;
    }
    
    onSequenceNumberMouseLeave() {
        this.isHoverOnSequenceNumber = false;
    }
}
