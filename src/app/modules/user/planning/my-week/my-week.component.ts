import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { ResidencePlanningPanelComponent } from './residence-panel/residence-panel.component';
import { TransportPlanningPanelComponent } from './transport-panel/transport-panel.component';

@Component({
    selector: 'user-weekly-planning-page',
    templateUrl: './my-week.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatTabsModule,
        TranslocoModule,
        ResidencePlanningPanelComponent,
        TransportPlanningPanelComponent,
    ],
})
export class WeeklyPlanningPageComponent implements OnInit {
    ngOnInit(): void {
        // Component initialization
    }
}
