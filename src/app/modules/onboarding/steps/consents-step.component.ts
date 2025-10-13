import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoModule } from '@jsverse/transloco';
import { OnboardingDraft } from '../models/onboarding.types';

@Component({
    selector: 'onboarding-consents-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        TranslocoModule,
    ],
    templateUrl: './consents-step.component.html',
})
export class ConsentsStepComponent implements OnInit {
    @Input() draft: OnboardingDraft['consents'] | null = null;
    @Output() formChange = new EventEmitter<{ form: FormGroup; data: OnboardingDraft['consents'] }>();

    form!: FormGroup;
    
    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.form = this.fb.group({
            acceptPrivacy: [this.draft?.acceptPrivacy ?? false, Validators.requiredTrue],
            acceptPhoto: [this.draft?.acceptPhoto ?? false],
            acceptMarketing: [this.draft?.acceptMarketing ?? false],
        });

        // Emit initial state
        this.emitFormState();

        // Listen to form changes
        this.form.valueChanges.subscribe(() => {
            this.emitFormState();
        });
    }

    private emitFormState(): void {
        const formValue = this.form.value;
        const data: OnboardingDraft['consents'] = {
            acceptPrivacy: formValue.acceptPrivacy,
            acceptPhoto: formValue.acceptPhoto,
            acceptMarketing: formValue.acceptMarketing,
        };

        this.formChange.emit({ form: this.form, data });
    }
}
