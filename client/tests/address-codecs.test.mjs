import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {encode as encodeCbor} from 'cbor-x';
import {encode as encodeMsgpack} from '@msgpack/msgpack';
import {Builder} from 'flatbuffers';
import protobuf from 'protobufjs';
import {decodeAddresses} from '../src/app/services/address-codecs.ts';
import {FORMATS} from '../src/app/models/format.ts';

vm.runInThisContext(
  '(function(window) {' +
    readFileSync(new URL('../src/smile.min.js', import.meta.url), 'utf8') +
    '})(globalThis);'
);
const type = protobuf
  .parse(readFileSync(new URL('../src/assets/address.proto', import.meta.url), 'utf8'))
  .root.lookupType('Addresses');
const row = {
  id: 1,
  lastName: 'Müller',
  firstName: 'Zoë',
  street: '12, Main St.',
  zip: '00123',
  city: 'Zürich',
  country: 'CH',
  lat: 0,
  lng: -1.25,
  email: 'test@example.com',
  dob: 0
};
const expected = {...row, dob: new Date('1970-01-01T00:00:00Z')};
const buffer = (bytes) => Uint8Array.from(bytes).buffer;
const text = (value) => new TextEncoder().encode(value).buffer;
const descriptor = (id) => FORMATS.find((format) => format.id === id);
const decode = (id, bytes) => decodeAddresses(descriptor(id), bytes, type);

for (const [format, encode] of [
  ['json', (data) => new TextEncoder().encode(JSON.stringify(data))],
  ['cbor', encodeCbor],
  ['msgpack', encodeMsgpack]
]) {
  test(format + ' object and array forms retain ZIP codes and epoch day zero', () => {
    assert.deepEqual(decode(format, buffer(encode([row]))), [expected]);
    assert.deepEqual(decode(format + '-array', buffer(encode([Object.values(row)]))), [expected]);
    assert.deepEqual(decode(format, buffer(encode([]))), []);
  });
}

test('dates before the epoch remain signed and null remains absent', () => {
  const records = [
    {...row, dob: -1},
    {...row, dob: null}
  ];
  assert.deepEqual(
    decode('json', text(JSON.stringify(records))).map((a) => a.dob?.toISOString() ?? null),
    ['1969-12-31T00:00:00.000Z', null]
  );
  assert.throws(
    () => decode('json', text(JSON.stringify([{...row, dob: 'bad'}]))),
    /date of birth/
  );
});

test('XML keeps numeric-looking text, whitespace, singleton and empty lists', () => {
  const xml =
    '<addresses><address>' +
    Object.entries(row)
      .map(([key, value]) => '<' + key + '>' + value + '</' + key + '>')
      .join('') +
    '</address></addresses>';
  assert.deepEqual(decode('xml', text(xml)), [expected]);
  assert.deepEqual(decode('xml', text('<addresses/>')), []);
  assert.equal(decode('xml', text(xml.replace('Zoë', ' 123 ')))[0].firstName, ' 123 ');
  assert.throws(() => decode('xml', text('<addresses>')), /Invalid XML/);
  assert.throws(() => decode('xml', text('<html/>')), /addresses XML/);
});

test('CSV handles quoting, optional headers and malformed records', () => {
  const csv = '1,Müller,Zoë,"12, Main St.",00123,Zürich,CH,0,-1.25,test@example.com,0\r\n';
  assert.deepEqual(decode('csv', text(csv)), [expected]);
  assert.deepEqual(decode('csv', text(Object.keys(row).join(',') + '\n' + csv)), [expected]);
  assert.deepEqual(decode('csv', text('')), []);
  assert.throws(() => decode('csv', text('1,Müller')), /11 address columns/);
  assert.throws(() => decode('csv', text('1,"Müller')), /quote/i);
});

test('Protocol Buffers fills omitted scalar defaults and handles empty lists', () => {
  assert.deepEqual(decode('protobuf', buffer(type.encode({address: [row]}).finish())), [expected]);
  assert.deepEqual(decode('protobuf', buffer(type.encode({}).finish())), []);
  const defaults = decode('protobuf', buffer(type.encode({address: [{}]}).finish()))[0];
  assert.equal(defaults.id, 0);
  assert.equal(defaults.lat, 0);
  assert.equal(defaults.dob.toISOString(), '1970-01-01T00:00:00.000Z');
});

function flatbuffer(records) {
  const builder = new Builder(256);
  const offsets = records.map((record) => {
    const strings = Object.values(record).map((value) =>
      typeof value === 'string' ? builder.createString(value) : 0
    );
    builder.startObject(11);
    Object.values(record).forEach((value, index) => {
      if (typeof value === 'string') builder.addFieldOffset(index, strings[index], 0);
      else if (index === 7 || index === 8) builder.addFieldFloat32(index, value, 0);
      else builder.addFieldInt32(index, value, 0);
    });
    return builder.endObject();
  });
  builder.startVector(4, offsets.length, 4);
  for (const offset of offsets.toReversed()) builder.addOffset(offset);
  const vector = builder.endVector();
  builder.startObject(1);
  builder.addFieldOffset(0, vector, 0);
  builder.finish(builder.endObject());
  return buffer(builder.asUint8Array());
}

test('FlatBuffers omitted zero date is 1970-01-01, with signed dates and empty vectors', () => {
  assert.deepEqual(decode('flatbuffers', flatbuffer([row])), [expected]);
  assert.equal(
    decode('flatbuffers', flatbuffer([{...row, dob: -1}]))[0].dob.toISOString(),
    '1969-12-31T00:00:00.000Z'
  );
  assert.deepEqual(decode('flatbuffers', flatbuffer([])), []);
  assert.throws(() => decode('flatbuffers', new ArrayBuffer(0)), /Invalid FlatBuffers/);
});

// Run against a real server as well: ADDRESS_API_URL=http://localhost:8080 pnpm test.
test(
  'all server formats decode to the same addresses',
  {skip: !process.env['ADDRESS_API_URL']},
  async () => {
    let baseline;
    for (const format of [
      descriptor('json'),
      ...FORMATS.filter((format) => format.id !== 'json')
    ]) {
      const path = format.array ? '/addressesArray' : '/addresses';
      const response = await fetch(
        process.env['ADDRESS_API_URL'] + path + '?format=' + format.format
      );
      assert.equal(response.status, 200, format.label);
      const records = decodeAddresses(format, await response.arrayBuffer(), type);
      // Binary codecs retain the full float32 value; JSON prints its shorter decimal representation.
      const normalized = records.map((record) => ({
        ...record,
        lat: Math.fround(record.lat),
        lng: Math.fround(record.lng)
      }));
      if (format.id === 'json') baseline = normalized;
      else assert.deepEqual(normalized, baseline, format.label);
    }
  }
);
