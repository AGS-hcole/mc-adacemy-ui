import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { ReportsApiService } from './reports-api.service';
import { RatingsSummaryDto } from './reports.types';

describe('ReportsApiService - Ratings Summary', () => {
    let service: ReportsApiService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    const mockRatingsSummary: RatingsSummaryDto = {
        period: {
            from: '2025-01-01',
            to: '2025-01-31',
        },
        scope: {
            userId: undefined,
            contractScope: 'all',
        },
        global: {
            average: 7.4,
            count: 50,
            ratedSessions: 20,
            unratedSessions: 5,
            distribution: {
                '1': 2,
                '2': 1,
                '3': 3,
                '4': 5,
                '5': 8,
                '6': 10,
                '7': 12,
                '8': 5,
                '9': 3,
                '10': 1,
            },
        },
        contractSplit: {
            contractCount: 35,
            nonContractCount: 15,
        },
        perUser: [
            {
                user: {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                average: 8.5,
                count: 10,
            },
            {
                user: {
                    id: 'user-2',
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
                average: 7.2,
                count: 8,
            },
        ],
        topUsers: [
            {
                userId: 'user-1',
                average: 8.5,
                count: 10,
            },
        ],
        bottomUsers: [
            {
                userId: 'user-2',
                average: 7.2,
                count: 8,
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ReportsApiService],
        });

        service = TestBed.inject(ReportsApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getRatingsSummary', () => {
        it('should get ratings summary with basic params', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';

            service.getRatingsSummary(from, to).subscribe((summary) => {
                expect(summary).toEqual(mockRatingsSummary);
                expect(summary.global.average).toBe(7.4);
                expect(summary.global.count).toBe(50);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsSummary);
        });

        it('should include userId param when provided', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';
            const userId = 'user-123';

            service
                .getRatingsSummary(from, to, userId)
                .subscribe((summary) => {
                    expect(summary).toEqual(mockRatingsSummary);
                });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to &&
                    request.params.get('userId') === userId
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsSummary);
        });

        it('should include contractScope param when provided and not "all"', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';
            const contractScope = 'under';

            service
                .getRatingsSummary(from, to, undefined, contractScope)
                .subscribe((summary) => {
                    expect(summary).toEqual(mockRatingsSummary);
                });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to &&
                    request.params.get('contractScope') === contractScope
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsSummary);
        });

        it('should exclude contractScope param when value is "all"', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';
            const contractScope = 'all';

            service
                .getRatingsSummary(from, to, undefined, contractScope)
                .subscribe((summary) => {
                    expect(summary).toEqual(mockRatingsSummary);
                });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to &&
                    !request.params.has('contractScope')
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsSummary);
        });

        it('should include all params when provided', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';
            const userId = 'user-123';
            const contractScope = 'under';

            service
                .getRatingsSummary(from, to, userId, contractScope)
                .subscribe((summary) => {
                    expect(summary).toEqual(mockRatingsSummary);
                });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to &&
                    request.params.get('userId') === userId &&
                    request.params.get('contractScope') === contractScope
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockRatingsSummary);
        });

        it('should handle errors', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';

            service.getRatingsSummary(from, to).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error).toBeTruthy();
                },
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/reports/ratings/summary`
            );
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });
});
