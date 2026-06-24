import test from "#index";
import spy from "#spy";

test.case("spy", assert => {
  const fn = (a: number, b: number) => a + b;
  const tracked = spy(fn);

  assert(tracked.called).type<boolean>();
  assert(tracked.calls).type<[number, number][]>();

  assert(tracked.called).equals(false);
  assert(tracked.calls).equals([]);

  tracked(1, 2);

  assert(tracked.called).equals(true);
  assert(tracked.calls).equals([[1, 2]]);

  tracked(3, 4);

  assert(tracked.calls).equals([[1, 2], [3, 4]]);
});

test.case("spy with mocker", assert => {
  const fn = (a: number, b: number) => a + b;
  const mocker = (a: number, b: number) => a * b;
  const tracked = spy(fn, mocker);

  assert(tracked(2, 3)).equals(6);
  assert(tracked.called).equals(true);
  assert(tracked.calls).equals([[2, 3]]);
});

test.case("spy return type", assert => {
  const fn = (a: number, b: number) => a + b;
  const tracked = spy(fn);

  assert(tracked(1, 2)).type<number>();
  assert(tracked(1, 2)).equals(3);
});
