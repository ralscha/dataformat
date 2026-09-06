import {Component, DestroyRef, OnInit, computed, inject, input, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DatePipe, DecimalPipe} from '@angular/common';
import {Observable, defer, finalize} from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  addresses = signal<Address[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  readonly loaded = signal(false);
  readonly elapsed = signal<number | null>(null);
  readonly query = signal('');
  readonly page = signal(0);
  readonly pageSize = 100;
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return query
      ? this.addresses().filter((address) =>
          [
            address.id,
            address.lastName,
            address.firstName,
            address.street,
            address.zip,
            address.city,
            address.country,
            address.email
          ].some((value) => String(value).toLocaleLowerCase().includes(query))
        )
      : this.addresses();
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );
  readonly visibleAddresses = computed(() =>
    this.filtered().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );

  search(query: string): void {
    this.query.set(query);
    this.page.set(0);
  }

  ngOnInit(): void {
    if (this.autoLoad()) {
      this.load();
    }
  }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const start = performance.now();
    defer(() => this.loader()())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.elapsed.set(performance.now() - start);
          this.addresses.set(data);
          this.page.set(0);
          this.loaded.set(true);
        },
        error: (err) => {
          this.error.set(String(err?.message ?? err));
        }
      });
  }
}
