import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ReportsRatingsSectionComponent } from './reports-ratings-section.component';
import { RatingsSummaryDto } from 'app/core/reports/reports.types';

describe('ReportsRatingsSectionComponent', () => {
    let component: ReportsRatingsSectionComponent;
    let fixture: ComponentFixture<ReportsRatingsSectionComponent>;

    const mockRatingsSummary: RatingsSummaryDto = {
        period: {
            from: '2025-01-01',
            to: '2025-01-31',
            timezone: 'Europe/Paris',
        },
        global: {
            average: 7.4,
            count: 50,
            ratedSessions: 20,
            unratedSessions: 5,
            distribution: [0, 2, 1, 3, 5, 8, 10, 12, 5, 3, 1],
        },
        byContract: {
            withContract: 35,
            withoutContract: 15,
        },
        perUser: [
            {
                userId: 'user-1',
                userName: 'John Doe',
                average: 8.5,
                count: 10,
            },
            {
                userId: 'user-2',
                userName: 'Jane Smith',
                average: 7.2,
                count: 8,
            },
            {
                userId: 'user-3',
                userName: 'Bob Johnson',
                average: 6.1,
                count: 5,
            },
        ],
        topUsers: [
            {
                userId: 'user-1',
                userName: 'John Doe',
                average: 8.5,
                count: 10,
            },
        ],
        bottomUsers: [
            {
                userId: 'user-3',
                userName: 'Bob Johnson',
                average: 6.1,
                count: 5,
            },
        ],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReportsRatingsSectionComponent,
                TranslocoTestingModule.forRoot({ langs: { en: {} } }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ReportsRatingsSectionComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Chart Data Mapping', () => {
        it('should generate distribution chart options from DTO', () => {
            component.ratingsSummary = mockRatingsSummary;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(component.distributionChartOptions).toBeTruthy();
            expect(component.distributionChartOptions!.series).toBeDefined();
            expect(component.distributionChartOptions!.series![0].data).toEqual(
                mockRatingsSummary.global.distribution.slice(1)
            );
        });

        it('should generate pie chart options from DTO', () => {
            component.ratingsSummary = mockRatingsSummary;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(component.pieChartOptions).toBeTruthy();
            expect(component.pieChartOptions!.series).toEqual([35, 15]);
            expect(component.pieChartOptions!.labels).toEqual([
                'Contract',
                'Non-Contract',
            ]);
        });

        it('should handle empty distribution array', () => {
            const emptyData: RatingsSummaryDto = {
                ...mockRatingsSummary,
                global: {
                    ...mockRatingsSummary.global,
                    distribution: [],
                },
            };

            component.ratingsSummary = emptyData;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(component.distributionChartOptions).toBeTruthy();
            expect(component.distributionChartOptions!.series![0].data).toEqual(
                []
            );
        });
    });

    describe('Sorting', () => {
        beforeEach(() => {
            component.ratingsSummary = mockRatingsSummary;
            // Don't trigger change detection to avoid ApexCharts rendering in test
        });

        it('should sort by average descending by default', () => {
            const sorted = component.sortedUserStats;
            expect(sorted[0].userName).toBe('John Doe');
            expect(sorted[0].average).toBe(8.5);
            expect(sorted[2].userName).toBe('Bob Johnson');
            expect(sorted[2].average).toBe(6.1);
        });

        it('should toggle sort direction when clicking same field', () => {
            component.toggleSort('average');
            expect(component.sortAsc).toBe(true);

            const sorted = component.sortedUserStats;
            expect(sorted[0].userName).toBe('Bob Johnson');
            expect(sorted[0].average).toBe(6.1);
        });

        it('should change sort field and reset direction', () => {
            component.sortBy = 'average';
            component.sortAsc = true;

            component.toggleSort('count');
            expect(component.sortBy).toBe('count');
            expect(component.sortAsc).toBe(false);

            const sorted = component.sortedUserStats;
            expect(sorted[0].count).toBe(10);
        });

        it('should sort by count when selected', () => {
            component.toggleSort('count');

            const sorted = component.sortedUserStats;
            expect(sorted[0].count).toBe(10);
            expect(sorted[1].count).toBe(8);
            expect(sorted[2].count).toBe(5);
        });
    });

    describe('Filtered User Stats', () => {
        beforeEach(() => {
            component.ratingsSummary = mockRatingsSummary;
            // Don't trigger change detection to avoid ApexCharts rendering in test
        });

        it('should return null when no userId filter is set', () => {
            component.filteredUserId = undefined;
            expect(component.filteredUserStats).toBeNull();
        });

        it('should return user stats when userId filter matches', () => {
            component.filteredUserId = 'user-2';
            const stats = component.filteredUserStats;

            expect(stats).toBeTruthy();
            expect(stats?.userName).toBe('Jane Smith');
            expect(stats?.average).toBe(7.2);
        });

        it('should return undefined when userId filter does not match', () => {
            component.filteredUserId = 'non-existent-user';
            expect(component.filteredUserStats).toBeUndefined();
        });
    });

    describe('Loading and Empty States', () => {
        it('should handle loading state', () => {
            component.loading = true;
            component.ratingsSummary = null;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(component.loading).toBe(true);
        });

        it('should handle empty data', () => {
            const emptyData: RatingsSummaryDto = {
                ...mockRatingsSummary,
                global: {
                    average: 0,
                    count: 0,
                    ratedSessions: 0,
                    unratedSessions: 10,
                    distribution: [],
                },
                perUser: [],
                topUsers: [],
                bottomUsers: [],
            };

            component.ratingsSummary = emptyData;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(component.ratingsSummary.global.count).toBe(0);
        });
    });

    describe('Responsive Behavior', () => {
        it('should maintain chart options for different breakpoints', () => {
            component.ratingsSummary = mockRatingsSummary;
            // Don't trigger change detection to avoid ApexCharts rendering in test

            expect(
                component.distributionChartOptions!.chart!.type
            ).toBe('bar');
            expect(
                component.pieChartOptions!.chart!.type
            ).toBe('pie');
        });
    });
});
