import type Body from "#Body";
import type End from "#End";
import Test from "#Test";
import type { FileRef } from "@rcompat/fs";

export default class Suite {
  #file: FileRef;
  #tests: Test[] = [];
  #ends: End[] = [];
  #between: (() => void)[] = [];

  constructor(file: FileRef) {
    this.#file = file;
  }

  test(name: string, body: Body, group?: string) {
    this.#tests.push(new Test(name, body, group));
  }

  ended(end: End) {
    this.#ends.push(end);
  }

  get file() {
    return this.#file;
  }

  between(fn: () => void) {
    this.#between.push(fn);
  }

  async *run() {
    for (const test of this.#tests) {
      const start = performance.now();
      const result = await test.run();
      const duration = performance.now() - start;

      yield { test: result, duration };

      for (const fn of this.#between) {
        fn();
      }
    }
  }

  async end() {
    for (const end of this.#ends) {
      await end();
    }
  }
}
