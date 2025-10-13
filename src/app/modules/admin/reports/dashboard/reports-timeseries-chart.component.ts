import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexGrid,
    ApexLegend,
    ApexStroke,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    ChartComponent,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { DateTime } from 'luxon';
import { SessionsTimeseriesDto } from 'app/core/reports/reports.types';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    legend: ApexLegend;
};

@Component({
    selector: 'reports-timeseries-chart',
    templateUrl: './reports-timeseries-chart.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule, NgApexchartsModule],
})
export class ReportsTimeseriesChartComponent implements OnChanges {
    @ViewChild('chart') chart!: ChartComponent;
    @Input() timeseries: SessionsTimeseriesDto | null = null;
    @Input() loading = false;

    chartOptions: Partial<ChartOptions> = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['timeseries'] && this.timeseries) {
            this.updateChart();
        }
    }

    private updateChart(): void {
        if (!this.timeseries) return;

        const dates = this.timeseries.buckets.map((b) =>
            DateTime.fromISO(b.date).setZone('Europe/Paris').toFormat('dd/MM')
        );
        const totalData = this.timeseries.buckets.map((b) => b.total);
        const underData = this.timeseries.buckets.map((b) => b.underContract);
        const offData = this.timeseries.buckets.map((b) => b.offContract);

        this.chartOptions = {
            series: [
                {
                    name: 'Total',
                    data: totalData,
                },
                {
                    name: 'Sous contrat',
                    data: underData,
                },
                {
                    name: 'Hors contrat',
                    data: offData,
                },
            ],
            chart: {
                type: 'area',
                height: 350,
                fontFamily: 'inherit',
                toolbar: {
                    show: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            xaxis: {
                categories: dates,
                labels: {
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            grid: {
                borderColor: '#e0e0e0',
                strokeDashArray: 4,
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yyyy',
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
            },
        };
    }
}
