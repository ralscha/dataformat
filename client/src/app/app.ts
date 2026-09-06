import {Component, inject, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {Address} from './models/address';
import {FORMATS} from './models/format';
import {AddressService} from './services/address.service';
import {AddressGridComponent} from './components/address-grid/address-grid.component';
import {ResultPanelComponent} from './components/result-panel/result-panel.component';

interface Tab {
  label: string;
  type: 'grid' | 'result';
  loader?: () => Observable<Address[]>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AddressGridComponent, ResultPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeIndex = signal(0);
  readonly visited = signal(new Set([0]));

  readonly tabs: Tab[];

  constructor() {
    const svc = inject(AddressService);

    this.tabs = [
      ...FORMATS.map((format): Tab => ({
        label: format.label,
        type: 'grid',
        loader: () => svc.fetch(format)
      })),
      {label: 'Result', type: 'result'}
    ];
  }

  selectTab(index: number): void {
    this.visited.update((visited) => new Set([...visited, index]));
    this.activeIndex.set(index);
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        next = (index + this.tabs.length - 1) % this.tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.selectTab(next);
    const button = event.currentTarget as HTMLElement;
    (button.parentElement?.children[next] as HTMLElement)?.focus();
  }
}
