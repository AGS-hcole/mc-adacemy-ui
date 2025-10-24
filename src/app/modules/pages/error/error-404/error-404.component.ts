import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'error-404',
    templateUrl: './error-404.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, TranslocoPipe],
})
export class Error404Component {
    /**
     * Constructor
     */
    constructor() {}
}
