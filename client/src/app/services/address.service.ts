import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {forkJoin, from, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {decode as decodeCbor} from 'cbor-x';
import {decode as decodeMsgpack} from '@msgpack/msgpack';
import {XMLParser} from 'fast-xml-parser';
import {ByteBuffer} from 'flatbuffers';
import Papa from 'papaparse';
import * as protobuf from 'protobufjs';

import {Address} from '../models/address';

@Injectable({providedIn: 'root'})
export class AddressService {
  private http = inject(HttpClient);

  private protobufRoot: protobuf.Root | null = null;

  // ──────────── helpers ────────────

  private mapObj(obj: Record<string, unknown>): Address {
    const dob = obj['dob'];
    return {
      id: Number(obj['id']),
      lastName: String(obj['lastName'] ?? ''),
      firstName: String(obj['firstName'] ?? ''),
      street: String(obj['street'] ?? ''),
      zip: String(obj['zip'] ?? ''),
      city: String(obj['city'] ?? ''),
      country: String(obj['country'] ?? ''),
      lat: Number(obj['lat']),
      lng: Number(obj['lng']),
      email: String(obj['email'] ?? ''),
      dob: dob != null && dob !== '' ? new Date(Number(dob) * 86400000) : null
    };
  }

  /** Map an array row following @JsonPropertyOrder: id,lastName,firstName,street,zip,city,country,lat,lng,email,dob */
  private mapArr(row: unknown[]): Address {
    const dob = row[10];
    return {
      id: Number(row[0]),
      lastName: String(row[1] ?? ''),
      firstName: String(row[2] ?? ''),
      street: String(row[3] ?? ''),
      zip: String(row[4] ?? ''),
      city: String(row[5] ?? ''),
      country: String(row[6] ?? ''),
      lat: Number(row[7]),
      lng: Number(row[8]),
      email: String(row[9] ?? ''),
      dob: dob != null && dob !== '' ? new Date(Number(dob) * 86400000) : null
    };
  }

  private binary(format: string, array = false): Observable<ArrayBuffer> {
    return this.http.get(array ? '/addressesArray' : '/addresses', {
      params: {format},
      responseType: 'arraybuffer'
    });
  }

  // ──────────── formats ────────────

  fetchJson(): Observable<Address[]> {
    return this.http
      .get<Record<string, unknown>[]>('/addresses', {params: {format: 'json'}})
      .pipe(map((data) => data.map((o) => this.mapObj(o))));
  }

  fetchJsonArray(): Observable<Address[]> {
    return this.http
      .get<unknown[][]>('/addressesArray', {params: {format: 'json'}})
      .pipe(map((data) => data.map((r) => this.mapArr(r))));
  }

  fetchXml(): Observable<Address[]> {
    return this.http.get('/addresses', {params: {format: 'xml'}, responseType: 'text'}).pipe(
      map((xml) => {
        const parser = new XMLParser({ignoreAttributes: true});
        const parsed = parser.parse(xml);
        const records: Record<string, unknown>[] = parsed?.addresses?.address ?? [];
        return (Array.isArray(records) ? records : [records]).map((o) => this.mapObj(o));
      })
    );
  }

  fetchCbor(): Observable<Address[]> {
    return this.binary('cbor').pipe(
      map((buf) => {
        const decoded = decodeCbor(new Uint8Array(buf)) as Record<string, unknown>[];
        return decoded.map((o) => this.mapObj(o));
      })
    );
  }

  fetchCborArray(): Observable<Address[]> {
    return this.binary('cbor', true).pipe(
      map((buf) => {
        const decoded = decodeCbor(new Uint8Array(buf)) as unknown[][];
        return decoded.map((r) => this.mapArr(r));
      })
    );
  }

  fetchSmile(): Observable<Address[]> {
    return this.binary('smile').pipe(
      map((buf) => {
        const decoded = Smile.Parser.parse(buf) as Record<string, unknown>[];
        return decoded.map((o) => this.mapObj(o));
      })
    );
  }

  fetchSmileArray(): Observable<Address[]> {
    return this.binary('smile', true).pipe(
      map((buf) => {
        const decoded = Smile.Parser.parse(buf) as unknown[][];
        return decoded.map((r) => this.mapArr(r));
      })
    );
  }

  fetchMsgpack(): Observable<Address[]> {
    return this.binary('msgpack').pipe(
      map((buf) => {
        const decoded = decodeMsgpack(new Uint8Array(buf)) as Record<string, unknown>[];
        return decoded.map((o) => this.mapObj(o));
      })
    );
  }

  fetchMsgpackArray(): Observable<Address[]> {
    return this.binary('msgpack', true).pipe(
      map((buf) => {
        const decoded = decodeMsgpack(new Uint8Array(buf)) as unknown[][];
        return decoded.map((r) => this.mapArr(r));
      })
    );
  }

  fetchCsv(): Observable<Address[]> {
    return this.http.get('/addresses', {params: {format: 'csv'}, responseType: 'text'}).pipe(
      map((csvText) => {
        const result = Papa.parse<string[]>(csvText, {
          skipEmptyLines: true,
          dynamicTyping: false
        });
        let rows = result.data;
        // Skip header row if first field looks like a column name
        if (rows.length > 0 && isNaN(Number(rows[0][0]))) {
          rows = rows.slice(1);
        }
        return rows.map((r) => this.mapArr(r));
      })
    );
  }

  fetchProtoBuf(): Observable<Address[]> {
    const protoLoad$ = this.protobufRoot
      ? of(this.protobufRoot)
      : from(protobuf.load('/assets/address.proto')).pipe(
          tap((root) => (this.protobufRoot = root))
        );

    return forkJoin([protoLoad$, this.binary('protobuf')]).pipe(
      map(([root, buf]) => {
        const AddressesType = root.lookupType('Addresses');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = AddressesType.decode(new Uint8Array(buf)) as any;
        return (msg.address as Record<string, unknown>[]).map((a) => ({
          id: Number(a['id']),
          lastName: String(a['lastName'] ?? ''),
          firstName: String(a['firstName'] ?? ''),
          street: String(a['street'] ?? ''),
          zip: String(a['zip'] ?? ''),
          city: String(a['city'] ?? ''),
          country: String(a['country'] ?? ''),
          lat: Number(a['lat']),
          lng: Number(a['lng']),
          email: String(a['email'] ?? ''),
          dob: a['dob'] != null ? new Date(Number(a['dob']) * 86400000) : null
        }));
      })
    );
  }

  fetchFlatBuffers(): Observable<Address[]> {
    return this.binary('flatbuffers').pipe(map((buf) => this.decodeFlatbuffers(buf)));
  }

  private decodeFlatbuffers(buf: ArrayBuffer): Address[] {
    const bb = new ByteBuffer(new Uint8Array(buf));

    // root Addresses table
    const rootPos = bb.readInt32(bb.position()) + bb.position();

    // Addresses.address vector at vtable offset 4
    const vecFieldOffset = bb.__offset(rootPos, 4);
    if (!vecFieldOffset) return [];

    const vecRef = rootPos + vecFieldOffset;
    const vecStart = bb.__vector(vecRef);
    const vecLen = bb.__vector_len(vecRef);

    const result: Address[] = [];
    for (let i = 0; i < vecLen; i++) {
      const adrPos = bb.__indirect(vecStart + i * 4);

      const str = (vtOff: number): string => {
        const o = bb.__offset(adrPos, vtOff);
        // __string returns string | Uint8Array depending on encoding arg
        return o ? String(bb.__string(adrPos + o) ?? '') : '';
      };
      const u32 = (vtOff: number): number => {
        const o = bb.__offset(adrPos, vtOff);
        return o ? bb.readUint32(adrPos + o) : 0;
      };
      const f32 = (vtOff: number): number => {
        const o = bb.__offset(adrPos, vtOff);
        return o ? bb.readFloat32(adrPos + o) : 0;
      };
      const i32 = (vtOff: number): number => {
        const o = bb.__offset(adrPos, vtOff);
        return o ? bb.readInt32(adrPos + o) : 0;
      };

      const dobDays = i32(24);
      result.push({
        id: u32(4),
        lastName: str(6),
        firstName: str(8),
        street: str(10),
        zip: str(12),
        city: str(14),
        country: str(16),
        lat: f32(18),
        lng: f32(20),
        email: str(22),
        dob: dobDays ? new Date(dobDays * 86400000) : null
      });
    }
    return result;
  }
}
