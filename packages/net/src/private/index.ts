import connect from "#connect";
import Socket from "#Socket";
import type { NetOptions } from "#types";

async function open(options: NetOptions) {
  const streams = await connect(options);
  return new Socket(streams);
}

export default { open };
export type { NetOptions, TCPOptions, UnixOptions } from "#types";
