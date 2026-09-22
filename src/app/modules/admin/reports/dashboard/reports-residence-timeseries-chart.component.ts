import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ResidenceTimeseriesDto } from 'app/core/reports/reports.types';
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

export type ResidenceChartOptions = {
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
    selector: 'reports-residence-timeseries-chart',
    templateUrl: './reports-residence-timeseries-chart.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule, NgApexchartsModule],
})
export class ReportsResidenceTimeseriesChartComponent implements OnChanges {
    @ViewChild('chart') chart!: ChartComponent;
    @Input() timeseries: ResidenceTimeseriesDto | null = null;
    @Input() loading = false;

    chartOptions: Partial<ResidenceChartOptions> = {};

    constructor(private _translocoService: TranslocoService) {}

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
                    name: this._translocoService.translate('REPORTS.SERIES.TOTAL'),
                    data: this.timeseries.buckets.map((bucket) => bucket.total),
                },
                {
                    name: this._translocoService.translate(
                        'REPORTS.RESIDENCE.STATUS.PLANNED'
                    ),
                    data: this.timeseries.buckets.map((bucket) => bucket.planned),
                },
                {
                    name: this._translocoService.translate(
                        'REPORTS.RESIDENCE.STATUS.CANCELED'
                    ),
                    data: this.timeseries.buckets.map((bucket) => bucket.canceled),
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
                    formatter: (_value, { dataPointIndex }) =>
                        dataPointIndex >= 0
                            ? DateTime.fromISO(
                                  this.timeseries!.buckets[dataPointIndex].date
                              )
                                  .setZone('Europe/Paris')
                                  .toFormat('dd/MM/yyyy')
                            : '',
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
            },
        };
    }
}
