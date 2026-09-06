# Data format comparison

A Spring Boot API serves the same 1,000 sample addresses in 12 representations. The Angular client decodes each format, lets you search and page through the records, and compares current payload sizes.

## Run locally

Use JDK 25 and Node.js 24.15 or newer, with the pnpm version declared in [client/package.json](client/package.json). Maven Wrapper downloads Maven; the first server build also downloads the Protocol Buffers and FlatBuffers compilers. No separate schema-generation step is needed.

Start the API:

```sh
cd server
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd` instead of `./mvnw`. Ensure `JAVA_HOME` points to JDK 25.

In another terminal:

```sh
cd client
pnpm install --frozen-lockfile
pnpm start
```

Open http://localhost:4200. The development proxy forwards API requests to port 8080. Select a format and click **Load**, or open **Result** and click **Measure all formats**.

## API

Choose the format using an `Accept` header or the `format` query parameter, for example `/addresses?format=cbor`. JSON is the default. Unsupported formats return HTTP 406.

| Format parameter | Media type                  | Positional array endpoint |
| ---------------- | --------------------------- | ------------------------- |
| json             | application/json            | /addressesArray           |
| xml              | application/xml             | —                         |
| cbor             | application/cbor            | /addressesArray           |
| smile            | application/x-jackson-smile | /addressesArray           |
| msgpack          | application/x-msgpack       | /addressesArray           |
| csv              | text/csv                    | —                         |
| protobuf         | application/x-protobuf      | —                         |
| flatbuffers      | application/x-flatbuffers   | —                         |

All formats use `/addresses`; the additional positional-array endpoint omits field names. Array and CSV columns are:

```text
id,lastName,firstName,street,zip,city,country,lat,lng,email,dob
```

CSV responses have no header. Text is UTF-8, ZIP codes are strings, and dates are signed days since 1970-01-01. Day zero is a valid date, including when omitted as a default scalar in Protocol Buffers or FlatBuffers. The grid displays dates in UTC so local timezones cannot shift the calendar day.

Protocol Buffers schemas live in `server/src/main/protobuf` and `client/src/assets`; keep their wire fields in sync when changing the model. The FlatBuffers schema is in `server/src/main/flatbuffers`; its field order is also used by the client decoder.

## Measurements

The Result tab fetches each current representation and measures its uncompressed byte length. It then gzips that same body with the browser's `CompressionStream`. Values are in KiB (1,024 bytes), with ratios against the measured JSON baseline. A failure in one format does not stop the remaining measurements.

Browser gzip sizes exclude HTTP headers and can differ from the server's compression settings. Server compression is enabled by default; the `development` Spring profile disables it. Grid load times include fetching and decoding and are not isolated serialization benchmarks.

## Verification

```sh
cd server
./mvnw verify
cd ../client
pnpm test
pnpm build
```

The server tests cover all 12 formats, both negotiation methods, empty collections, Unicode, quoted CSV, leading zeroes, and epoch-day zero. Client unit tests cover decoding and invalid data. With the API running, set `ADDRESS_API_URL=http://localhost:8080` before `pnpm test` to also compare every record across all 12 live representations. In PowerShell: `$env:ADDRESS_API_URL = 'http://localhost:8080'`.

For browser checks, keep both servers running:

```sh
cd client
pnpm exec playwright-core install chromium
pnpm test:e2e
```

Set `CLIENT_URL` to override the default http://localhost:4200. Browser checks exercise every format, dates in a US timezone, search, pagination, live measurements, tab state, keyboard navigation, request retry, and a narrow viewport.
