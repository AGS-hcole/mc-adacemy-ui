import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'star-rating',
    templateUrl: './star-rating.component.html',
    styleUrls: ['./star-rating.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        NgClass,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class StarRatingComponent {
    @Input() value: number = 0; // Current rating (0-10)
    @Input() max: number = 10; // Maximum rating
    @Input() readonly: boolean = false; // If true, rating is not editable
    @Output() change = new EventEmitter<number>(); // Emits new rating value

    hoveredIndex: number = -1;

    /**
     * Constructor
     */
    constructor(private _translocoService: TranslocoService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get stars array for template
     */
    get stars(): number[] {
        return Array.from({ length: this.max }, (_, i) => i);
    }

    /**
     * Check if star should be filled
     */
    isStarFilled(index: number): boolean {
        const displayValue =
            this.hoveredIndex >= 0 ? this.hoveredIndex + 1 : this.value;
        return index < displayValue;
    }

    /**
     * Handle star click
     */
    onStarClick(index: number): void {
        if (this.readonly) return;

        const newValue = index + 1;
        this.value = newValue;
        this.change.emit(newValue);
    }

    /**
     * Handle mouse enter on star
     */
    onStarMouseEnter(index: number): void {
        if (this.readonly) return;
        this.hoveredIndex = index;
    }

    /**
     * Handle mouse leave from stars container
     */
    onStarsMouseLeave(): void {
        this.hoveredIndex = -1;
    }

    /**
     * Handle keyboard navigation
     */
    onKeyDown(event: KeyboardEvent): void {
        if (this.readonly) return;

        let newValue = this.value;

        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                event.preventDefault();
                newValue = Math.min(this.value + 1, this.max);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                event.preventDefault();
                newValue = Math.max(this.value - 1, 0);
                break;
            case 'Home':
                event.preventDefault();
                newValue = 0;
                break;
            case 'End':
                event.preventDefault();
                newValue = this.max;
                break;
            default:
                return;
        }

        if (newValue !== this.value) {
            this.value = newValue;
            this.change.emit(newValue);
        }
    }

    /**
     * Get tooltip text for a star
     */
    getTooltip(index: number): string {
        const value = index + 1;
        return this._translocoService.translate(
            'SESSIONS.ADMIN.RATINGS.SET_RATING',
            { value, max: this.max }
        );
    }

    /**
     * Get ARIA label for the rating slider
     */
    getAriaLabel(): string {
        return this._translocoService.translate(
            'SESSIONS.ADMIN.RATINGS.RATING_LABEL',
            { value: this.value, max: this.max }
        );
    }
}
