export interface Address {
  id: number;
  lastName: string;
  firstName: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  email: string;
  dob: Date | null;
}

export interface ResultRow {
  format: string;
  uncompressed: number;
  compressed: number;
  uncompressedComparison: number;
  compressedComparison: number;
  spaceSavings: number;
}

export const RESULT_DATA: ResultRow[] = [
  {format: 'XML', uncompressed: 292, compressed: 76.2},
  {format: 'JSON', uncompressed: 225, compressed: 72.3},
  {format: 'JSON Array', uncompressed: 139, compressed: 64.2},
  {format: 'CBOR', uncompressed: 177, compressed: 73.6},
  {format: 'CBOR Array', uncompressed: 112, compressed: 64.4},
  {format: 'SMILE', uncompressed: 126, compressed: 68.3},
  {format: 'SMILE Array', uncompressed: 115, compressed: 64.7},
  {format: 'MsgPack', uncompressed: 175, compressed: 74.4},
  {format: 'MsgPack Array', uncompressed: 111, compressed: 65.0},
  {format: 'CSV', uncompressed: 127, compressed: 62.7},
  {format: 'Protocol Buffers', uncompressed: 119, compressed: 69.1},
  {format: 'FlatBuffers', uncompressed: 161, compressed: 81.2}
].map((r) => ({
  ...r,
  uncompressedComparison: r.uncompressed / 2.25, // baseline: JSON uncompressed = 225 KB
  compressedComparison: r.compressed / 0.723, // baseline: JSON compressed   =  72.3 KB
  spaceSavings: 100 - (r.compressed * 100) / r.uncompressed
}));
