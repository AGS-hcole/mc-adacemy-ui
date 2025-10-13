import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { OnboardingDraft } from '../models/onboarding.types';

@Component({
    selector: 'onboarding-summary-step',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        TranslocoModule,
    ],
    templateUrl: './summary-step.component.html',
})
export class SummaryStepComponent {
    @Input() draft: OnboardingDraft | null = null;
    @Input() email: string = '';
}
