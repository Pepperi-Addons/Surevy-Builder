import { FormControl } from '@angular/forms';

export interface IQuestionForm {
    Key?: FormControl<string | null>;
    Type?: FormControl<string | null>;
    Text?: FormControl<string | null>;
    Description?: FormControl<string | null>;
}
