import {Component, DestroyRef, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe, PercentPipe} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import * as echarts from 'echarts/core';
import {BarChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TooltipComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import type {EChartsCoreOption} from 'echarts/core';
import {catchError, concatMap, finalize, from, map, of} from 'rxjs';
import {FORMATS} from '../../models/format';
import {AddressService} from '../../services/address.service';

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

interface Measurement {
  id: string;
  label: string;
  uncompressed?: number;
  compressed?: number;
  error?: string;
}

@Component({
  selector: 'app-result-panel',
  imports: [NgxEchartsDirective, DecimalPipe, PercentPipe],
  providers: [provideEchartsCore({echarts})],
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.css'
})
export class ResultPanelComponent {
  private readonly service = inject(AddressService);
  private readonly destroyRef = inject(DestroyRef);
  readonly measurements = signal<Measurement[]>([]);
  readonly loading = signal(false);
  readonly formatCount = FORMATS.length;
  readonly rows = computed(() => {
    const baseline = this.measurements().find((row) => row.id === 'json');
    return this.measurements().map((row) => ({
      ...row,
      uncompressedComparison:
        baseline?.uncompressed && row.uncompressed != null
          ? row.uncompressed / baseline.uncompressed
          : null,
      compressedComparison:
        baseline?.compressed && row.compressed != null
          ? row.compressed / baseline.compressed
          : null,
      spaceSavings:
        row.uncompressed && row.compressed != null ? 1 - row.compressed / row.uncompressed : null
    }));
  });
  readonly chartOptions = computed<EChartsCoreOption>(() => {
    const rows = this.measurements().filter((row) => !row.error);
    return {
      tooltip: {trigger: 'axis', valueFormatter: (value: number) => value.toFixed(2) + ' KiB'},
      legend: {data: ['Uncompressed', 'Gzip'], top: 8},
      grid: {left: 70, right: 20, bottom: 130, top: 60},
      xAxis: {
        type: 'category',
        data: rows.map((row) => row.label),
        axisLabel: {rotate: 45, interval: 0}
      },
      yAxis: {type: 'value', name: 'KiB'},
      color: ['#82CAFA', '#FAB282'],
      series: [
        {name: 'Uncompressed', type: 'bar', data: rows.map((row) => row.uncompressed! / 1024)},
        {name: 'Gzip', type: 'bar', data: rows.map((row) => row.compressed! / 1024)}
      ]
    };
  });

  measure(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.measurements.set([]);
    from(FORMATS)
      .pipe(
        concatMap((format) =>
          this.service.measure(format).pipe(
            map((sizes): Measurement => ({id: format.id, label: format.label, ...sizes})),
            catchError((error: unknown) =>
              of<Measurement>({
                id: format.id,
                label: format.label,
                error:
                  typeof error === 'object' && error !== null && 'message' in error
                    ? String(error.message)
                    : String(error)
              })
            )
          )
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe((row) => this.measurements.update((rows) => [...rows, row]));
  }
}
