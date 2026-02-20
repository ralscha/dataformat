import {Component, signal, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {Address} from './models/address';
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

  readonly tabs: Tab[];

  constructor() {
    const svc = inject(AddressService);

    this.tabs = [
      {label: 'XML', type: 'grid', loader: () => svc.fetchXml()},
      {label: 'JSON', type: 'grid', loader: () => svc.fetchJson()},
      {label: 'JSON Array', type: 'grid', loader: () => svc.fetchJsonArray()},
      {label: 'CBOR', type: 'grid', loader: () => svc.fetchCbor()},
      {label: 'CBOR Array', type: 'grid', loader: () => svc.fetchCborArray()},
      {label: 'SMILE', type: 'grid', loader: () => svc.fetchSmile()},
      {label: 'SMILE Array', type: 'grid', loader: () => svc.fetchSmileArray()},
      {label: 'MessagePack', type: 'grid', loader: () => svc.fetchMsgpack()},
      {label: 'MessagePack Array', type: 'grid', loader: () => svc.fetchMsgpackArray()},
      {label: 'CSV', type: 'grid', loader: () => svc.fetchCsv()},
      {label: 'Protocol Buffers', type: 'grid', loader: () => svc.fetchProtoBuf()},
      {label: 'FlatBuffers', type: 'grid', loader: () => svc.fetchFlatBuffers()},
      {label: 'Result', type: 'result'}
    ];
  }

  selectTab(index: number): void {
    this.activeIndex.set(index);
  }
}
