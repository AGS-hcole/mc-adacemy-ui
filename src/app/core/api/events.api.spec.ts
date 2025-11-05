import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { EventsApi } from './events.api';
import { PaginatedResponse, PublicEvent } from '../models/public-event.model';

describe('EventsApi', () => {
    let service: EventsApi;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    const mockEvent: PublicEvent = {
        id: '1',
        slug: 'test-event',
        name: 'Test Event',
        description: 'A test event',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T12:00:00Z',
        backgroundImageUrl: 'https://example.com/image.jpg',
        externalRegistrationUrl: 'https://example.com/register',
        isPublished: true,
        orderIndex: 1,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
    };

    const mockPaginatedResponse: PaginatedResponse<PublicEvent> = {
        items: [mockEvent],
        page: 1,
        pageSize: 12,
        total: 1,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EventsApi],
        });

        service = TestBed.inject(EventsApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('list', () => {
        it('should get public events with default params', () => {
            service.list().subscribe((response) => {
                expect(response).toEqual(mockPaginatedResponse);
                expect(response.items.length).toBe(1);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/events` &&
                    request.params.get('sort') === 'order'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPaginatedResponse);
        });

        it('should include pagination params when provided', () => {
            service.list({ page: 2, pageSize: 10, sort: 'recent' }).subscribe();

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/events` &&
                    request.params.get('page') === '2' &&
                    request.params.get('pageSize') === '10' &&
                    request.params.get('sort') === 'recent'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPaginatedResponse);
        });
    });

    describe('getBySlug', () => {
        it('should get event by slug', () => {
            const slug = 'test-event';

            service.getBySlug(slug).subscribe((event) => {
                expect(event).toEqual(mockEvent);
                expect(event.slug).toBe(slug);
            });

            const req = httpMock.expectOne(`${apiUrl}/events/slug/${slug}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockEvent);
        });
    });

    describe('create', () => {
        it('should create event', () => {
            const dto: Partial<PublicEvent> = {
                name: 'New Event',
                isPublished: false,
                orderIndex: 1,
            };

            service.create(dto).subscribe((event) => {
                expect(event).toEqual(mockEvent);
            });

            const req = httpMock.expectOne(`${apiUrl}/events`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(dto);
            req.flush(mockEvent);
        });
    });

    describe('update', () => {
        it('should update event', () => {
            const id = '1';
            const dto: Partial<PublicEvent> = {
                name: 'Updated Event',
            };

            service.update(id, dto).subscribe((event) => {
                expect(event).toEqual(mockEvent);
            });

            const req = httpMock.expectOne(`${apiUrl}/events/${id}`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(dto);
            req.flush(mockEvent);
        });
    });

    describe('delete', () => {
        it('should delete event', () => {
            const id = '1';

            service.delete(id).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/events/${id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getQrPng', () => {
        it('should get QR code blob', () => {
            const url = 'https://example.com/events';
            const mockBlob = new Blob(['fake-image'], { type: 'image/png' });

            service.getQrPng(url).subscribe((blob) => {
                expect(blob).toEqual(mockBlob);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/events/qr` &&
                    request.params.get('url') === url
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockBlob);
        });

        it('should get QR code without URL param', () => {
            const mockBlob = new Blob(['fake-image'], { type: 'image/png' });

            service.getQrPng().subscribe((blob) => {
                expect(blob).toEqual(mockBlob);
            });

            const req = httpMock.expectOne(`${apiUrl}/events/qr`);
            expect(req.request.method).toBe('GET');
            req.flush(mockBlob);
        });
    });
});
