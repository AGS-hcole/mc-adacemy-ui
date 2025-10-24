import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { EventsApi } from 'app/core/api/events.api';
import { of } from 'rxjs';
import { PublicEventsPageComponent } from './public-events-page.component';

describe('PublicEventsPageComponent', () => {
    let component: PublicEventsPageComponent;
    let fixture: ComponentFixture<PublicEventsPageComponent>;
    let eventsApiSpy: jasmine.SpyObj<EventsApi>;

    const mockEventsData = {
        items: [
            {
                id: '1',
                slug: 'event-1',
                name: 'Test Event 1',
                description: 'Description 1',
                startTime: '2025-01-15T10:00:00Z',
                endTime: '2025-01-15T12:00:00Z',
                backgroundImageUrl: null,
                externalRegistrationUrl: 'https://example.com/register',
                isPublished: true,
                orderIndex: 1,
                isActive: true,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-10T00:00:00Z',
            },
        ],
        page: 1,
        pageSize: 12,
        total: 1,
    };

    beforeEach(async () => {
        eventsApiSpy = jasmine.createSpyObj('EventsApi', ['list']);

        await TestBed.configureTestingModule({
            imports: [PublicEventsPageComponent, TranslocoModule],
            providers: [
                { provide: EventsApi, useValue: eventsApiSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            data: {
                                events: mockEventsData,
                            },
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PublicEventsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with events from resolver', () => {
        expect(component.events().length).toBe(1);
        expect(component.events()[0].name).toBe('Test Event 1');
        expect(component.currentPage()).toBe(1);
        expect(component.total()).toBe(1);
    });

    it('should check if there are more events to load', () => {
        component.events.set([mockEventsData.items[0]]);
        component.total.set(5);
        expect(component.hasMore()).toBe(true);

        component.total.set(1);
        expect(component.hasMore()).toBe(false);
    });

    it('should format time range correctly', () => {
        const event = mockEventsData.items[0];
        const timeRange = component.formatTimeRange(event);
        expect(timeRange).toBeTruthy();
    });

    it('should check if event is happening now', () => {
        const event = { ...mockEventsData.items[0] };
        // Set times to past
        event.startTime = '2020-01-01T10:00:00Z';
        event.endTime = '2020-01-01T12:00:00Z';
        expect(component.isHappeningNow(event)).toBe(false);
    });
});
