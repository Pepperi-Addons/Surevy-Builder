import { FormControl } from '@angular/forms';

export interface ISurveyEditorForm {
    Key?: FormControl<string | null>;
    Name?: FormControl<string | null>;
    Description?: FormControl<string | null>;
    IsActive: FormControl<boolean | null>;
    ActiveFromDate?: FormControl<string | null>;
    ActiveToDate?: FormControl<string | null>;
}
