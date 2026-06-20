import type { NetOptions, Streams } from "#types";
import net from "node:net";
import { Duplex } from "node:stream";

export default function connect(options: NetOptions): Promise<Streams> {
  return new Promise((resolve, reject) => {
    const socket = "path" in options
      ? net.createConnection(options.path)
      : net.createConnection(options.port, options.host);

    function on_error(error: Error) {
      socket.off("connect", on_connect);
      reject(error);
    }

    function on_connect() {
      socket.off("error", on_error);
      const { readable, writable } = Duplex.toWeb(socket);
      resolve({ readable, writable } as unknown as Streams);
    }

    socket.once("connect", on_connect);
    socket.once("error", on_error);
  });
}
