import type { NetOptions, Streams } from "#types";
import type { Socket } from "bun";

export default function connect(options: NetOptions): Promise<Streams> {
  return new Promise((resolve, reject) => {
    let controller: ReadableStreamDefaultController<Uint8Array>;
    let bun_socket: Socket;

    const readable = new ReadableStream<Uint8Array>({
      start(c) {
        controller = c;
      },
    });

    const writable = new WritableStream<Uint8Array>({
      write(chunk) {
        bun_socket.write(chunk);
      },
      close() {
        bun_socket.end();
      },
    });

    const socket = {
      open(socket: Socket) {
        bun_socket = socket;
        resolve({ readable, writable });
      },
      data(_socket: Socket, chunk: Buffer) {
        controller.enqueue(chunk);
      },
      close() {
        controller.close();
      },
      error(_socket: Socket, error: Error) {
        controller.error(error);
        reject(error);
      },
    };

    const connecting = "path" in options
      ? Bun.connect({ unix: options.path, socket })
      : Bun.connect({ hostname: options.host, port: options.port, socket });

    connecting.catch(reject);
  });
}
