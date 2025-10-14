import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import {
    TranslocoModule,
    TranslocoService,
    provideTranslocoScope,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
    let component: StarRatingComponent;
    let fixture: ComponentFixture<StarRatingComponent>;
    let translocoService: jasmine.SpyObj<TranslocoService>;
    let iconRegistry: jasmine.SpyObj<MatIconRegistry>;

    beforeEach(async () => {
        const translocoSpy = jasmine.createSpyObj('TranslocoService', [
            'translate',
        ]);
        translocoSpy.translate.and.returnValue('Mock translation');

        const iconRegistrySpy = jasmine.createSpyObj('MatIconRegistry', [
            'getNamedSvgIcon',
        ]);
        iconRegistrySpy.getNamedSvgIcon.and.returnValue(of(null));

        await TestBed.configureTestingModule({
            imports: [
                StarRatingComponent,
                MatIconModule,
                MatTooltipModule,
                TranslocoModule,
            ],
            providers: [
                { provide: TranslocoService, useValue: translocoSpy },
                { provide: MatIconRegistry, useValue: iconRegistrySpy },
                provideTranslocoScope('sessions'),
            ],
        }).compileComponents();

        translocoService = TestBed.inject(
            TranslocoService
        ) as jasmine.SpyObj<TranslocoService>;
        iconRegistry = TestBed.inject(
            MatIconRegistry
        ) as jasmine.SpyObj<MatIconRegistry>;
        fixture = TestBed.createComponent(StarRatingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.value).toBe(0);
        expect(component.max).toBe(10);
        expect(component.readonly).toBe(false);
    });

    it('should generate correct number of stars', () => {
        component.max = 10;
        expect(component.stars.length).toBe(10);
    });

    describe('isStarFilled', () => {
        it('should return true for stars within value', () => {
            component.value = 5;
            expect(component.isStarFilled(0)).toBeTrue();
            expect(component.isStarFilled(4)).toBeTrue();
            expect(component.isStarFilled(5)).toBeFalse();
        });

        it('should use hovered value when hovering', () => {
            component.value = 3;
            component.hoveredIndex = 6;
            expect(component.isStarFilled(5)).toBeTrue();
            expect(component.isStarFilled(6)).toBeTrue();
            expect(component.isStarFilled(7)).toBeFalse();
        });
    });

    describe('onStarClick', () => {
        it('should emit change event with new value', () => {
            spyOn(component.change, 'emit');
            component.onStarClick(7);
            expect(component.value).toBe(8);
            expect(component.change.emit).toHaveBeenCalledWith(8);
        });

        it('should not change value when readonly', () => {
            component.readonly = true;
            component.value = 5;
            spyOn(component.change, 'emit');

            component.onStarClick(7);
            expect(component.value).toBe(5);
            expect(component.change.emit).not.toHaveBeenCalled();
        });
    });

    describe('keyboard navigation', () => {
        it('should increase value on ArrowRight', () => {
            component.value = 5;
            spyOn(component.change, 'emit');

            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            spyOn(event, 'preventDefault');

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(component.value).toBe(6);
            expect(component.change.emit).toHaveBeenCalledWith(6);
        });

        it('should decrease value on ArrowLeft', () => {
            component.value = 5;
            spyOn(component.change, 'emit');

            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            spyOn(event, 'preventDefault');

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(component.value).toBe(4);
            expect(component.change.emit).toHaveBeenCalledWith(4);
        });

        it('should set value to 0 on Home', () => {
            component.value = 5;
            spyOn(component.change, 'emit');

            const event = new KeyboardEvent('keydown', { key: 'Home' });
            spyOn(event, 'preventDefault');

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(component.value).toBe(0);
            expect(component.change.emit).toHaveBeenCalledWith(0);
        });

        it('should set value to max on End', () => {
            component.value = 5;
            component.max = 10;
            spyOn(component.change, 'emit');

            const event = new KeyboardEvent('keydown', { key: 'End' });
            spyOn(event, 'preventDefault');

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(component.value).toBe(10);
            expect(component.change.emit).toHaveBeenCalledWith(10);
        });

        it('should not exceed max value', () => {
            component.value = 10;
            component.max = 10;

            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            component.onKeyDown(event);

            expect(component.value).toBe(10);
        });

        it('should not go below 0', () => {
            component.value = 0;

            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            component.onKeyDown(event);

            expect(component.value).toBe(0);
        });

        it('should not respond to keyboard when readonly', () => {
            component.readonly = true;
            component.value = 5;
            spyOn(component.change, 'emit');

            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            component.onKeyDown(event);

            expect(component.value).toBe(5);
            expect(component.change.emit).not.toHaveBeenCalled();
        });
    });

    describe('hover behavior', () => {
        it('should update hoveredIndex on mouse enter', () => {
            component.onStarMouseEnter(5);
            expect(component.hoveredIndex).toBe(5);
        });

        it('should reset hoveredIndex on mouse leave', () => {
            component.hoveredIndex = 5;
            component.onStarsMouseLeave();
            expect(component.hoveredIndex).toBe(-1);
        });

        it('should not update hoveredIndex when readonly', () => {
            component.readonly = true;
            component.hoveredIndex = -1;
            component.onStarMouseEnter(5);
            expect(component.hoveredIndex).toBe(-1);
        });
    });

    describe('accessibility', () => {
        it('should call translation service for tooltip', () => {
            component.getTooltip(5);
            expect(translocoService.translate).toHaveBeenCalledWith(
                'SESSIONS.ADMIN.RATINGS.SET_RATING',
                { value: 6, max: 10 }
            );
        });

        it('should call translation service for aria label', () => {
            component.value = 7;
            component.getAriaLabel();
            expect(translocoService.translate).toHaveBeenCalledWith(
                'SESSIONS.ADMIN.RATINGS.RATING_LABEL',
                { value: 7, max: 10 }
            );
        });
    });
});
