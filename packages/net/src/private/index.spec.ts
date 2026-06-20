import type { Asserter } from "@rcompat/test";
import test from "@rcompat/test";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

import index from "#index";

async function rejects(assert: Asserter, fn: () => Promise<any>) {
  try {
    await fn();
    assert(false).true();
  } catch {
    assert(true).true();
  }
}

function unix_path() {
  return path.join(os.tmpdir(), `rcompat-net-${process.pid}-${Date.now()}.sock`);
}

test.case("unix socket: writes and reads back an echo", async assert => {
  const socket_path = unix_path();

  const server = net.createServer(connection => {
    connection.on("data", chunk => connection.write(chunk));
    connection.on("end", () => connection.end());
  });

  await new Promise<void>(resolve => server.listen(socket_path, resolve));

  const socket = await index.open({ path: socket_path });
  await socket.write("hello\n");
  await socket.end();

  assert(await socket.text()).equals("hello\n");

  server.close();
  fs.rmSync(socket_path, { force: true });
});

test.case("tcp socket: writes and reads back an echo", async assert => {
  const server = net.createServer(connection => {
    connection.on("data", chunk => connection.write(chunk));
    connection.on("end", () => connection.end());
  });

  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as net.AddressInfo;

  const socket = await index.open({ host: "127.0.0.1", port });
  await socket.write("world\n");
  await socket.end();

  assert(await socket.text()).equals("world\n");

  server.close();
});

test.case("connect rejects on a non-existent unix socket", async assert => {
  const socket_path = unix_path();

  await rejects(assert, () => index.open({ path: socket_path }));
});

test.case("for await iterates raw chunks before text() is called", async assert => {
  const socket_path = unix_path();

  const server = net.createServer(connection => {
    connection.write("a");
    connection.write("b");
    connection.end();
  });

  await new Promise<void>(resolve => server.listen(socket_path, resolve));

  const socket = await index.open({ path: socket_path });
  const chunks: string[] = [];
  for await (const chunk of socket) {
    chunks.push(new TextDecoder().decode(chunk));
  }

  assert(chunks.join("")).equals("ab");

  server.close();
  fs.rmSync(socket_path, { force: true });
});
