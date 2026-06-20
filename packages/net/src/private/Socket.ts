import type { Streams } from "#types";

export default class Socket {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  #writer: WritableStreamDefaultWriter<Uint8Array>;

  constructor({ readable, writable }: Streams) {
    this.readable = readable;
    this.writable = writable;
    this.#writer = writable.getWriter();
  }

  write(data: string | Uint8Array) {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    return this.#writer.write(bytes);
  }

  end() {
    return this.#writer.close();
  }

  close() {
    this.#writer.close();
    return this.readable.cancel();
  }

  async text() {
    const reader = this.readable.getReader();
    const decoder = new TextDecoder();
    let output = "";
    for (; ;) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
    }
    return output;
  }

  [Symbol.asyncIterator]() {
    return this.readable[Symbol.asyncIterator]();
  }
}
