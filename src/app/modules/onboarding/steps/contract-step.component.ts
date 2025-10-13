import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule } from '@jsverse/transloco';
import { FormulaType, OnboardingDraft } from '../models/onboarding.types';

@Component({
    selector: 'onboarding-contract-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
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
    formulaOptions: FormulaType[] = ['MORNING', 'AFTERNOON', 'FULL'];
    
    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.form = this.fb.group({
            formula: [this.draft?.formula || null, Validators.required],
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
            formula: formValue.formula,
            notifyEmail: formValue.notifyEmail,
            notifySMS: formValue.notifySMS,
            notifyWhatsApp: formValue.notifyWhatsApp,
        };

        this.formChange.emit({ form: this.form, data });
    }
}
