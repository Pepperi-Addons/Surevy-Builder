import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

@Injectable({ providedIn: 'root' })
export class UtilitiesService {
    
    constructor(
        private translate: TranslateService,
        private dialogService: PepDialogService,
        ) {
        //
    }

    showDialogMsg(message: string, title: string = ''): any {
        title = title.length > 0 ? title: this.translate.instant('MESSAGES.TITLE_NOTICE');

        const data = new PepDialogData({
            title: title,
            content: message,
        });

        return this.dialogService.openDefaultDialog(data);
    }
}
