import {Component, OnInit} from '@angular/core';
import {DecimalPipe, PercentPipe} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import * as echarts from 'echarts/core';
import {BarChart, BarSeriesOption} from 'echarts/charts';
import {
  GridComponent,
  GridComponentOption,
  LegendComponent,
  TooltipComponent
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import type {ComposeOption} from 'echarts/core';
import {RESULT_DATA, ResultRow} from '../../models/address';

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

type EChartsOption = ComposeOption<BarSeriesOption | GridComponentOption>;

@Component({
  selector: 'app-result-panel',
  imports: [NgxEchartsDirective, DecimalPipe, PercentPipe],
  providers: [provideEchartsCore({echarts})],
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.css'
})
export class ResultPanelComponent implements OnInit {
  readonly rows: ResultRow[] = RESULT_DATA;
  chartOptions: EChartsOption = {};
  highlightedFormat: string | null = null;

  ngOnInit(): void {
    this.chartOptions = this.buildChartOptions();
  }

  private buildChartOptions(): EChartsOption {
    const formats = this.rows.map((r) => r.format);
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const items = params as {seriesName: string; value: number; name: string}[];
          return items.map((p) => `${p.seriesName}: ${p.value.toLocaleString()} KB`).join('<br/>');
        }
      },
      legend: {data: ['Uncompressed', 'Compressed'], top: 8},
      grid: {left: 80, right: 20, bottom: 100, top: 60},
      xAxis: {
        type: 'category',
        data: formats,
        axisLabel: {rotate: -45, interval: 0}
      },
      yAxis: {
        type: 'value',
        name: 'KB',
        axisLabel: {formatter: (v: number) => v.toLocaleString()}
      },
      color: ['#82CAFA', '#FAB282'],
      series: [
        {
          name: 'Uncompressed',
          type: 'bar',
          data: this.rows.map((r) => r.uncompressed),
          label: {
            show: true,
            position: 'insideTop',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => `${params.value} KB`,
            fontSize: 10
          }
        },
        {
          name: 'Compressed',
          type: 'bar',
          data: this.rows.map((r) => r.compressed),
          label: {
            show: true,
            position: 'insideTop',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => `${params.value} KB`,
            fontSize: 10
          }
        }
      ]
    };
  }

  onRowClick(row: ResultRow): void {
    this.highlightedFormat = row.format;
  }
}
