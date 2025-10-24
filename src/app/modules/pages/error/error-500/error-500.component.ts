import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'error-500',
    templateUrl: './error-500.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, TranslocoPipe],
})
export class Error500Component {
    /**
     * Constructor
     */
    constructor() {}
}
