import {HttpClient} from '@angular/common/http';
import {Service, inject} from '@angular/core';
import {Observable, defer, forkJoin, from, of} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import * as protobuf from 'protobufjs';
import {Address} from '../models/address';
import {Format} from '../models/format';
import {decodeAddresses} from './address-codecs';

@Service()
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly protobufType = this.http
    .get('assets/address.proto', {responseType: 'text'})
    .pipe(
      map((schema) => protobuf.parse(schema).root.lookupType('Addresses')),
      shareReplay({bufferSize: 1, refCount: true})
    );

  private response(format: Format): Observable<ArrayBuffer> {
    return this.http.get(format.array ? '/addressesArray' : '/addresses', {
      params: {format: format.format},
      responseType: 'arraybuffer'
    });
  }

  fetch(format: Format): Observable<Address[]> {
    return forkJoin({
      buffer: this.response(format),
      type: format.format === 'protobuf' ? this.protobufType : of(undefined)
    }).pipe(map(({buffer, type}) => decodeAddresses(format, buffer, type)));
  }

  measure(format: Format): Observable<{uncompressed: number; compressed: number}> {
    return this.response(format).pipe(
      switchMap((buffer) =>
        defer(() => {
          if (typeof CompressionStream === 'undefined') {
            throw new Error('This browser does not support gzip measurements.');
          }
          const stream = new Blob([buffer]).stream().pipeThrough(new CompressionStream('gzip'));
          return from(new Response(stream).arrayBuffer()).pipe(
            map((compressed) => ({
              uncompressed: buffer.byteLength,
              compressed: compressed.byteLength
            }))
          );
        })
      )
    );
  }
}
