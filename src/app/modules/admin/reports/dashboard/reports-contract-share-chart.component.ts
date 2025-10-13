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
                height: 350,
                fontFamily: 'inherit',
            },
            labels: ['Sous contrat', 'Hors contrat'],
            colors: ['#10b981', '#f59e0b'],
            legend: {
                position: 'bottom',
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300,
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            ],
        };
    }
}
