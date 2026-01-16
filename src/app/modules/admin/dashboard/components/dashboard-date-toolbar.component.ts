import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'dashboard-date-toolbar',
    templateUrl: './dashboard-date-toolbar.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class DashboardDateToolbarComponent {
    @Input() selectedDate: Date = new Date();
    @Output() dateChange = new EventEmitter<Date>();

    /**
     * Go to today
     */
    goToToday(): void {
        const today = new Date();
        this.dateChange.emit(today);
    }

    /**
     * Go to previous day
     */
    previousDay(): void {
        const prev = new Date(this.selectedDate);
        prev.setDate(prev.getDate() - 1);
        this.dateChange.emit(prev);
    }

    /**
     * Go to next day
     */
    nextDay(): void {
        const next = new Date(this.selectedDate);
        next.setDate(next.getDate() + 1);
        this.dateChange.emit(next);
    }

    /**
     * Handle date picker change
     */
    onDatePickerChange(date: Date | null): void {
        if (date) {
            this.dateChange.emit(date);
        }
    }

    /**
     * Format date for display using user's locale
     */
    getFormattedDate(): string {
        if (!this.selectedDate) {
            return '';
        }
        // TODO: Use application's i18n locale setting instead of hardcoded 'fr-FR'
        return this.selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}
