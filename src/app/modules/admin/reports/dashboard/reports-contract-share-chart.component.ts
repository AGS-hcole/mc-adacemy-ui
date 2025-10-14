import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import {
    ApexChart,
    ApexLegend,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ChartComponent,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { SessionsSummaryDto } from 'app/core/reports/reports.types';

export type DonutChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    responsive: ApexResponsive[];
    colors: string[];
};

@Component({
    selector: 'reports-contract-share-chart',
    templateUrl: './reports-contract-share-chart.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule, NgApexchartsModule],
})
export class ReportsContractShareChartComponent implements OnChanges {
    @ViewChild('chart') chart!: ChartComponent;
    @Input() summary: SessionsSummaryDto | null = null;
    @Input() loading = false;

    chartOptions: Partial<DonutChartOptions> = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['summary'] && this.summary) {
            this.updateChart();
        }
    }

    private updateChart(): void {
        if (!this.summary) return;

        this.chartOptions = {
            series: [
                this.summary.totals.underContract,
                this.summary.totals.offContract,
            ],
            chart: {
                type: 'donut',
                height: 280,
                fontFamily: 'inherit',
            },
            labels: ['Contract', 'Non-Contract'],
            colors: ['#10b981', '#f59e0b'],
            legend: {
                position: 'right',
                fontSize: '12px',
                offsetY: 0,
                height: 280,
                formatter: function(seriesName, opts) {
                    const value = opts.w.globals.series[opts.seriesIndex];
                    const total = opts.w.globals.series.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                }
            },
            responsive: [
                {
                    breakpoint: 1024,
                    options: {
                        chart: {
                            height: 240,
                        },
                        legend: {
                            position: 'bottom',
                            fontSize: '11px',
                        },
                    },
                },
                {
                    breakpoint: 640,
                    options: {
                        chart: {
                            height: 200,
                        },
                        legend: {
                            position: 'bottom',
                            fontSize: '10px',
                        },
                    },
                },
            ],
        };
    }
}
