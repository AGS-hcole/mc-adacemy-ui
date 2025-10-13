import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule } from '@jsverse/transloco';
import { OnboardingDraft } from '../models/onboarding.types';

@Component({
    selector: 'onboarding-contract-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        TranslocoModule,
    ],
    templateUrl: './contract-step.component.html',
})
export class ContractStepComponent implements OnInit {
    @Input() draft: OnboardingDraft['contract'] | null = null;
    @Input() hasPhone: boolean = false;
    @Output() formChange = new EventEmitter<{ form: FormGroup; data: OnboardingDraft['contract'] }>();

    form!: FormGroup;
    
    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.form = this.fb.group({
            notifyEmail: [this.draft?.notifyEmail ?? true],
            notifySMS: [this.draft?.notifySMS ?? false],
            notifyWhatsApp: [this.draft?.notifyWhatsApp ?? false],
        });

        // Emit initial state
        this.emitFormState();

        // Listen to form changes
        this.form.valueChanges.subscribe(() => {
            this.emitFormState();
        });
    }

    get showSmsWarning(): boolean {
        return this.form.get('notifySMS')?.value && !this.hasPhone;
    }

    private emitFormState(): void {
        const formValue = this.form.value;
        const data: OnboardingDraft['contract'] = {
            notifyEmail: formValue.notifyEmail,
            notifySMS: formValue.notifySMS,
            notifyWhatsApp: formValue.notifyWhatsApp,
        };

        this.formChange.emit({ form: this.form, data });
    }
}
