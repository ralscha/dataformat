export const FORMATS = [
  {id: 'xml', label: 'XML', format: 'xml'},
  {id: 'json', label: 'JSON', format: 'json'},
  {id: 'json-array', label: 'JSON Array', format: 'json', array: true},
  {id: 'cbor', label: 'CBOR', format: 'cbor'},
  {id: 'cbor-array', label: 'CBOR Array', format: 'cbor', array: true},
  {id: 'smile', label: 'SMILE', format: 'smile'},
  {id: 'smile-array', label: 'SMILE Array', format: 'smile', array: true},
  {id: 'msgpack', label: 'MessagePack', format: 'msgpack'},
  {id: 'msgpack-array', label: 'MessagePack Array', format: 'msgpack', array: true},
  {id: 'csv', label: 'CSV', format: 'csv'},
  {id: 'protobuf', label: 'Protocol Buffers', format: 'protobuf'},
  {id: 'flatbuffers', label: 'FlatBuffers', format: 'flatbuffers'}
] as const satisfies readonly Format[];

export interface Format {
  id: string;
  label: string;
  format: string;
  array?: boolean;
}
