import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { RatingsService } from './ratings.service';
import { Rating, SessionRatingsResponse } from './session.types';

describe('RatingsService', () => {
    let service: RatingsService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    const mockRating: Rating = {
        id: '1',
        sessionId: 'session-1',
        userId: 'user-1',
        score: 8,
        comment: 'Great performance',
        createdAt: '2025-01-01T00:00:00Z',
    };

    const mockRatingsResponse: SessionRatingsResponse = {
        ratings: [mockRating],
        stats: {
            average: 8.0,
            count: 1,
            distribution: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RatingsService],
        });

        service = TestBed.inject(RatingsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('upsert', () => {
        it('should create/update a rating via PUT', () => {
            const sessionId = 'session-1';
            const userId = 'user-1';
            const dto = { score: 8, comment: 'Great performance' };

            service.upsert(sessionId, userId, dto).subscribe((rating) => {
                expect(rating).toEqual(mockRating);
            });

            const req = httpMock.expectOne(
                `${apiUrl}/sessions/${sessionId}/ratings/${userId}`
            );
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(dto);
            req.flush(mockRating);
        });

        it('should handle errors when upserting', () => {
            const sessionId = 'session-1';
            const userId = 'user-1';
            const dto = { score: 8 };

            service.upsert(sessionId, userId, dto).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error).toBeTruthy();
                },
            });

            const req = httpMock.expectOne(
                `${apiUrl}/sessions/${sessionId}/ratings/${userId}`
            );
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('getForSession', () => {
        it('should get all ratings for a session', () => {
            const sessionId = 'session-1';

            service
                .getForSession(sessionId)
                .subscribe((response) => {
                    expect(response).toEqual(mockRatingsResponse);
                    expect(response.ratings.length).toBe(1);
                    expect(response.stats.average).toBe(8.0);
                });

            const req = httpMock.expectOne(
                `${apiUrl}/sessions/${sessionId}/ratings`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsResponse);
        });
    });

    describe('delete', () => {
        it('should delete a rating via DELETE', () => {
            const sessionId = 'session-1';
            const userId = 'user-1';

            service.delete(sessionId, userId).subscribe((result) => {
                expect(result).toBeNull();
            });

            const req = httpMock.expectOne(
                `${apiUrl}/sessions/${sessionId}/ratings/${userId}`
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getForUser', () => {
        it('should get ratings for a user without date filters', () => {
            const userId = 'user-1';
            const mockRatings: Rating[] = [mockRating];

            service.getForUser(userId).subscribe((ratings) => {
                expect(ratings).toEqual(mockRatings);
            });

            const req = httpMock.expectOne(`${apiUrl}/users/${userId}/ratings`);
            expect(req.request.method).toBe('GET');
            req.flush(mockRatings);
        });

        it('should get ratings for a user with date filters', () => {
            const userId = 'user-1';
            const from = '2025-01-01';
            const to = '2025-12-31';
            const mockRatings: Rating[] = [mockRating];

            service.getForUser(userId, from, to).subscribe((ratings) => {
                expect(ratings).toEqual(mockRatings);
            });

            const req = httpMock.expectOne(
                `${apiUrl}/users/${userId}/ratings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatings);
        });
    });
});
