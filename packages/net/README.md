# @rcompat/net

TCP and unix socket connections for JavaScript runtimes.

## What is @rcompat/net?

A cross-runtime module for opening raw TCP and unix domain socket
connections, backed by native Web Streams. Works consistently across Node,
Deno, and Bun — each runtime uses its own native socket implementation under
the hood (`node:net`, `Bun.connect`, `Deno.connect`), so there's no shared
polyfill or compatibility shim sitting between you and the runtime.

## Installation

```bash
npm install @rcompat/net
```

```bash
pnpm add @rcompat/net
```

```bash
yarn add @rcompat/net
```

```bash
bun add @rcompat/net
```

## Usage

### Opening a connection

```js
import net from "@rcompat/net";

// unix domain socket
const socket = await net.open({ path: "/var/run/example.sock" });

// tcp
const socket = await net.open({ host: "127.0.0.1", port: 9999 });
```

### Writing and reading

```js
import net from "@rcompat/net";

const socket = await net.open({ path: "/var/run/example.sock" });

await socket.write("ping\n");
await socket.end(); // half-close — stop writing, keep reading

const response = await socket.text(); // drains readable to a string
```

### Streaming chunks

```js
import net from "@rcompat/net";

const socket = await net.open({ host: "127.0.0.1", port: 9999 });

await socket.write("subscribe\n");

for await (const chunk of socket) {
  console.log(new TextDecoder().decode(chunk));
}
```

### Closing

```js
import net from "@rcompat/net";

const socket = await net.open({ path: "/var/run/example.sock" });

await socket.write("hello\n");
await socket.close(); // closes both write and read sides
```

`end()` only closes the write side (sends FIN, server can still respond) —
use it when you expect a response after writing. `close()` tears down both
sides — use it when you're done with the connection entirely.

## API Reference

### net

```ts
function open(options: NetOptions): Promise<Socket>;
```

### NetOptions

```ts
type TCPOptions = { host: string; port: number };
type UnixOptions = { path: string };
type NetOptions = TCPOptions | UnixOptions;
```

A plain discriminated union — pass `{ host, port }` for TCP or `{ path }`
for a unix domain socket. No separate `transport` tag needed.

### Socket

```ts
class Socket {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;

  write(data: string | Uint8Array): Promise<void>;
  end(): Promise<void>;
  close(): Promise<void>;
  text(): Promise<string>;

  [Symbol.asyncIterator](): AsyncIterator<Uint8Array>;
}
```

`Socket` isn't constructed directly — instances only come from `net.open()`.
The type is exported for annotating function parameters and return types.

## Examples

### Talking to a control-plane socket (e.g. HAProxy)

```js
import net from "@rcompat/net";

async function command(input) {
  const socket = await net.open({ path: "/var/run/haproxy.sock" });
  await socket.write(`${input}\n`);
  await socket.end();
  return socket.text();
}

await command("show info");
```

### Simple TCP request/response

```js
import net from "@rcompat/net";

const socket = await net.open({ host: "api.internal", port: 8080 });
await socket.write("STATUS\n");
await socket.end();

console.log(await socket.text());
```

## Cross-Runtime Compatibility

| Runtime | Supported |
| ------- | --------- |
| Node.js | ✓         |
| Deno    | ✓         |
| Bun     | ✓         |

No configuration required — `@rcompat/net` resolves the correct native
implementation per runtime via package export conditions.

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.
