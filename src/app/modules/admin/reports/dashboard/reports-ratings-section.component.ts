import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ReportsExportService } from 'app/core/reports/reports-export.service';
import { RatingsSummaryDto } from 'app/core/reports/reports.types';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexGrid,
    ApexLegend,
    ApexPlotOptions,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule,
} from 'ng-apexcharts';

export type DistributionChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    legend: ApexLegend;
};

export type PieChartOptions = {
    series: number[];
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
};

@Component({
    selector: 'reports-ratings-section',
    templateUrl: './reports-ratings-section.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        DecimalPipe,
        TranslocoModule,
        NgApexchartsModule,
    ],
})
export class ReportsRatingsSectionComponent {
    @Input() set ratingsSummary(value: RatingsSummaryDto | null) {
        this._ratingsSummary = value;
        if (value) {
            this.updateCharts(value);
        }
    }
    get ratingsSummary(): RatingsSummaryDto | null {
        return this._ratingsSummary;
    }

    @Input() loading = false;
    @Input() filteredUserId: string | undefined = undefined;

    private _ratingsSummary: RatingsSummaryDto | null = null;

    distributionChartOptions: Partial<DistributionChartOptions> | null = null;
    pieChartOptions: Partial<PieChartOptions> | null = null;

    sortBy: 'average' | 'count' = 'average';
    sortAsc = false;

    /**
     * Constructor
     */
    constructor(private _exportService: ReportsExportService) {}

    /**
     * Get sorted user stats
     */
    get sortedUserStats() {
        console.log('sortedUserStats', this.ratingsSummary);
        console.log('filteredUserId', this.filteredUserId);
        if (!this.ratingsSummary?.perUser) {
            return [];
        }

        const users = [...this.ratingsSummary.perUser];
        users.sort((a, b) => {
            const aVal = this.sortBy === 'average' ? a.average : a.count;
            const bVal = this.sortBy === 'average' ? b.average : b.count;
            return this.sortAsc ? aVal - bVal : bVal - aVal;
        });

        return users;
    }

    /**
     * Get filtered user stats when userId filter is set
     */
    get filteredUserStats() {
        console.log('filteredUserStats', this.ratingsSummary);
        console.log('filteredUserId', this.filteredUserId);
        if (!this.filteredUserId || !this.ratingsSummary?.perUser) {
            return null;
        }
        return this.ratingsSummary.perUser.find(
            (u) => u.user.id === this.filteredUserId
        );
    }

    /**
     * Get user full name from PerUserRatingDto
     */
    getUserName(user: {
        user: { firstName: string; lastName: string };
    }): string {
        return `${user.user.firstName} ${user.user.lastName}`;
    }

    /**
     * Get user initials from PerUserRatingDto
     */
    getUserInitials(user: {
        user: { firstName: string; lastName: string };
    }): string {
        return `${user.user.firstName.charAt(0)}${user.user.lastName.charAt(0)}`.toUpperCase();
    }

    /**
     * Toggle sort
     */
    toggleSort(field: 'average' | 'count'): void {
        if (this.sortBy === field) {
            this.sortAsc = !this.sortAsc;
        } else {
            this.sortBy = field;
            this.sortAsc = false;
        }
    }

    /**
     * Update charts with new data
     */
    private updateCharts(data: RatingsSummaryDto): void {
        // Distribution chart
        const distribution = this.getDistributionSegments(
            data?.global?.distribution
        );
        this.distributionChartOptions = {
            series: [
                {
                    name: 'Count',
                    data: distribution.slice(1), // Skip 0, show 1-10
                },
            ],
            chart: {
                type: 'bar',
                height: 300,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    dataLabels: {
                        position: 'top',
                    },
                },
            },
            dataLabels: {
                enabled: true,
                offsetX: 30,
            },
            xaxis: {
                categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                title: {
                    text: 'Number of Ratings',
                },
            },
            yaxis: {
                title: {
                    text: 'Rating',
                },
            },
            grid: {
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            legend: {
                show: false,
            },
        };

        // Pie chart for contract vs non-contract
        this.pieChartOptions = {
            series: [
                data.contractSplit?.contractCount || 0,
                data.contractSplit?.nonContractCount || 0,
            ],
            chart: {
                type: 'pie',
                height: 160,
            },
            labels: ['Contract', 'Non-Contract'],
            legend: {
                position: 'right',
                fontSize: '12px',
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => {
                    return val.toFixed(1) + '%';
                },
            },
        };
    }

    private getDistributionSegments(d: unknown): number[] {
        if (!d) {
            return Array(11).fill(0);
        }

        // Handle Record<'1'|'2'|...|'10', number> format
        const obj = d as Record<string, number>;
        return Array.from({ length: 11 }, (_, i) => {
            if (i === 0) return 0; // Skip 0 rating
            return Number(obj[String(i)] ?? 0);
        });
    }

    /**
     * Export ratings as CSV
     */
    exportCsv(): void {
        if (this.ratingsSummary?.perUser && this.ratingsSummary.perUser.length > 0) {
            this._exportService.exportRatingsCsv(this.ratingsSummary.perUser, 'ratings-export');
        }
    }

    /**
     * Export ratings as JSON
     */
    exportJson(): void {
        if (this.ratingsSummary?.perUser && this.ratingsSummary.perUser.length > 0) {
            this._exportService.exportRatingsJson(this.ratingsSummary.perUser, 'ratings-export');
        }
    }
}
