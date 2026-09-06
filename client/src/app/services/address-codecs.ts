import {decode as decodeCbor} from 'cbor-x';
import {decode as decodeMsgpack} from '@msgpack/msgpack';
import {XMLParser, XMLValidator} from 'fast-xml-parser';
import {ByteBuffer} from 'flatbuffers';
import Papa from 'papaparse';
import type {Type} from 'protobufjs';
import type {Address} from '../models/address';
import type {Format} from '../models/format';

const FIELDS = [
  'id',
  'lastName',
  'firstName',
  'street',
  'zip',
  'city',
  'country',
  'lat',
  'lng',
  'email',
  'dob'
] as const;

function epochDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const days = Number(value);
  const date = new Date(days * 86_400_000);
  if (!Number.isInteger(days) || !Number.isFinite(date.getTime())) {
    throw new Error('Invalid date of birth');
  }
  return date;
}

function mapObject(obj: Record<string, unknown>): Address {
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
    dob: epochDate(obj['dob'])
  };
}

function mapArray(row: unknown[]): Address {
  if (!Array.isArray(row) || row.length !== FIELDS.length) {
    throw new Error('Expected 11 address columns');
  }
  return mapObject(Object.fromEntries(FIELDS.map((field, index) => [field, row[index]])));
}

export function decodeAddresses(
  descriptor: Format,
  buffer: ArrayBuffer,
  protobufType?: Type
): Address[] {
  const bytes = new Uint8Array(buffer);
  const text = () => new TextDecoder().decode(bytes);
  let data: unknown;
  switch (descriptor.format) {
    case 'json':
      data = JSON.parse(text());
      break;
    case 'cbor':
      data = decodeCbor(bytes);
      break;
    case 'smile':
      data = Smile.Parser.parse(buffer);
      break;
    case 'msgpack':
      data = decodeMsgpack(bytes);
      break;
    case 'xml': {
      const xml = text();
      if (XMLValidator.validate(xml) !== true) throw new Error('Invalid XML response');
      const parsed = new XMLParser({
        ignoreAttributes: true,
        parseTagValue: false,
        trimValues: false
      }).parse(xml);
      if (!Object.hasOwn(parsed, 'addresses'))
        throw new Error('Expected an addresses XML document');
      const records = parsed.addresses?.address ?? [];
      data = Array.isArray(records) ? records : [records];
      break;
    }
    case 'csv': {
      const result = Papa.parse<string[]>(text(), {
        delimiter: ',',
        skipEmptyLines: true,
        dynamicTyping: false
      });
      if (result.errors.length) throw new Error(result.errors[0].message);
      let rows = result.data;
      if (rows[0]?.[0] === 'id') {
        if (rows[0].join(',') !== FIELDS.join(',')) throw new Error('Unexpected CSV columns');
        rows = rows.slice(1);
      }
      return rows.map(mapArray);
    }
    case 'protobuf': {
      if (!protobufType) throw new Error('Protocol Buffers schema is not loaded');
      const message = protobufType.toObject(protobufType.decode(bytes), {defaults: true});
      data = message['address'];
      break;
    }
    case 'flatbuffers':
      return decodeFlatbuffers(bytes);
    default:
      throw new Error('Unsupported format: ' + descriptor.format);
  }
  if (!Array.isArray(data)) throw new Error('Expected an address list');
  return descriptor.array ? data.map(mapArray) : data.map(mapObject);
}

function decodeFlatbuffers(bytes: Uint8Array): Address[] {
  if (bytes.length < 4) throw new Error('Invalid FlatBuffers response');
  const bb = new ByteBuffer(bytes);
  const root = bb.readInt32(0);
  if (root < 4 || root + 4 > bytes.length) throw new Error('Invalid FlatBuffers root');
  const offset = bb.__offset(root, 4);
  if (!offset) return [];
  const start = bb.__vector(root + offset);
  const length = bb.__vector_len(root + offset);
  if (length < 0 || start < 0 || start + length * 4 > bytes.length) {
    throw new Error('Invalid FlatBuffers address vector');
  }
  const result: Address[] = [];
  for (let i = 0; i < length; i++) {
    const position = bb.__indirect(start + i * 4);
    const str = (field: number): string => {
      const o = bb.__offset(position, field);
      return o ? String(bb.__string(position + o) ?? '') : '';
    };
    const number = (field: number, read: (position: number) => number): number => {
      const o = bb.__offset(position, field);
      return o ? read(position + o) : 0;
    };
    result.push({
      id: number(4, (p) => bb.readUint32(p)),
      lastName: str(6),
      firstName: str(8),
      street: str(10),
      zip: str(12),
      city: str(14),
      country: str(16),
      lat: number(18, (p) => bb.readFloat32(p)),
      lng: number(20, (p) => bb.readFloat32(p)),
      email: str(22),
      // FlatBuffers omits scalar defaults: an absent dob represents epoch day zero.
      dob: epochDate(number(24, (p) => bb.readInt32(p)))
    });
  }
  return result;
}
