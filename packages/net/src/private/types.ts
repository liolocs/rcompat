export interface TCPOptions {
  host: string;
  port: number;
}

export interface UnixOptions {
  path: string;
}

export type NetOptions = TCPOptions | UnixOptions;

export interface Streams {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}
