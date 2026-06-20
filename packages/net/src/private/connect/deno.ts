import type { NetOptions, Streams } from "#types";

export default function connect(options: NetOptions): Promise<Streams> {
  const conn = "path" in options
    ? Deno.connect({ transport: "unix", path: options.path })
    : Deno.connect({ transport: "tcp", hostname: options.host, port: options.port });

  return conn;
}
