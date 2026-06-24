import is from "@rcompat/is";

type AnyFunction = (...args: any[]) => any;

type Tracked<F extends AnyFunction> = F & {
  calls: Parameters<F>[];
  called: boolean;
};

export default function spy<F extends AnyFunction>(fn: F, mocker?: F):
  Tracked<F> {
  const calls: Parameters<F>[] = [];
  const callee = is.defined(mocker) ? mocker : fn;

  const tracked = ((...args: Parameters<F>): ReturnType<F> => {
    calls.push(args);
    return callee(...args) as ReturnType<F>;
  }) as Tracked<F>;

  tracked.calls = calls;

  Object.defineProperty(tracked, "called", {
    get: () => calls.length > 0,
  });

  return tracked;
}
