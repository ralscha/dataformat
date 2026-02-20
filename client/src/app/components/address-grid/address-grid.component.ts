import {Component, OnInit, signal, input} from '@angular/core';
import {DatePipe, DecimalPipe} from '@angular/common';
import {Observable} from 'rxjs';
import {Address} from '../../models/address';

@Component({
  selector: 'app-address-grid',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './address-grid.component.html',
  styleUrl: './address-grid.component.css'
})
export class AddressGridComponent implements OnInit {
  readonly loader = input.required<() => Observable<Address[]>>();
  readonly autoLoad = input(false);

  addresses = signal<Address[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.autoLoad()) {
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const start = performance.now();
    this.loader()().subscribe({
      next: (data) => {
        console.log(
          `Loaded ${data.length} records in ${(performance.now() - start).toFixed(1)} ms`
        );
        this.addresses.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err?.message ?? err));
        this.loading.set(false);
      }
    });
  }
}
