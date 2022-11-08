import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPepQueryBuilderField } from "@pepperi-addons/ngx-lib/query-builder";

@Component({
    selector: 'show-if-dialog',
    templateUrl: './show-if-dialog.component.html',
    styleUrls: ['./show-if-dialog.component.scss']
})
export class ShowIfDialogComponent implements OnInit {
    ngOnInit(): void {

    }

    fields: Array<IPepQueryBuilderField>;
    query: any;
    isValid: boolean = true;
    outputData = { query: '' };

    constructor(public dialogRef: MatDialogRef<ShowIfDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public incoming: any) {
        this.fields = incoming.content.fields;
        this.query = incoming.content.query;
        this.outputData = { query: this.query };
    }

    onDialogClose() {
        this.dialogRef.close(this.outputData);
    }
}