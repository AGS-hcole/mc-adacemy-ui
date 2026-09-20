import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { TransportsTimeseriesDto } from 'app/core/reports/reports.types';
import { DateTime } from 'luxon';
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

export type TransportsChartOptions = {
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
    selector: 'reports-transports-timeseries-chart',
    templateUrl: './reports-transports-timeseries-chart.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule, NgApexchartsModule],
})
export class ReportsTransportsTimeseriesChartComponent implements OnChanges {
    @ViewChild('chart') chart!: ChartComponent;
    @Input() timeseries: TransportsTimeseriesDto | null = null;
    @Input() loading = false;

    chartOptions: Partial<TransportsChartOptions> = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['timeseries'] && this.timeseries) {
            this.updateChart();
        }
    }

    private updateChart(): void {
        if (!this.timeseries) {
            return;
        }

        const dates = this.timeseries.buckets.map((bucket) =>
            DateTime.fromISO(bucket.date).setZone('Europe/Paris').toFormat('dd/MM')
        );

        this.chartOptions = {
            series: [
                {
                    name: 'Total',
                    data: this.timeseries.buckets.map((bucket) => bucket.total),
                },
                {
                    name: 'Confirmées',
                    data: this.timeseries.buckets.map((bucket) => bucket.confirmed),
                },
                {
                    name: 'Annulées',
                    data: this.timeseries.buckets.map((bucket) => bucket.cancelled),
                },
            ],
            chart: {
                type: 'area',
                height: 350,
                fontFamily: 'inherit',
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            dataLabels: { enabled: false },
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
