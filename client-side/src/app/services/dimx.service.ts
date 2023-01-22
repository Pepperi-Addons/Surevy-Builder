import { Injectable, ViewContainerRef } from "@angular/core";
import { NavigationService } from "./navigation.service";
import { PepDIMXHelperService } from "@pepperi-addons/ngx-composite-lib";
import { DRAFT_SURVEY_TEMPLATES_TABLE_NAME } from "shared";

@Injectable()
export class DIMXService {
    constructor(
        private navigationService: NavigationService,
        private dimxService: PepDIMXHelperService
    ) {
    }

    register(viewContainerRef: ViewContainerRef, onDIMXProcessDoneCallback: (dimxEvent: any) => void) {
        const dimxHostObject = {
            DIMXAddonUUID: this.navigationService.addonUUID,
            DIMXResource: DRAFT_SURVEY_TEMPLATES_TABLE_NAME
        };

        this.dimxService.register(viewContainerRef, dimxHostObject, onDIMXProcessDoneCallback);
    }

    import() {
        const options = {
            OwnerID: this.navigationService.addonUUID,
        };

        this.dimxService.import(options);
    }

    export(templateKey: string, templateName: string) {
        const options = { 
            DIMXExportFormat: 'json',
            DIMXExportIncludeDeleted: true,
            DIMXExportFileName: templateName || `template_${templateKey}`,
            DIMXExportWhere: 'Key="' + templateKey + '"'
        };
        this.dimxService.export(options);
    }
}