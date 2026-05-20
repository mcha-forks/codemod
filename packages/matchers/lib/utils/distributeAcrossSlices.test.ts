import { oneOrMore, slice, zeroOrMore } from "../matchers/slice.ts";
import { distributeAcrossSlices } from "./distributeAcrossSlices.ts";
import { assertEquals } from "@std/assert";

Deno.test("allocates nothing given an empty list of slices", () => {
  assertEquals(Array.from(distributeAcrossSlices([], 1)), [[]]);
});

Deno.test("allocates available to a single slice within its bounds", () => {
  assertEquals(
    Array.from(distributeAcrossSlices([slice({ min: 0, max: 3 })], 2)),
    [[2]],
  );
  assertEquals(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 3)),
    [[3]],
  );
});

Deno.test("allocates nothing if available is outside single slice bounds", () => {
  assertEquals(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 1)),
    [],
  );
  assertEquals(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 5)),
    [],
  );
});

Deno.test("allocates a single space across multiple slices", () => {
  assertEquals(
    Array.from(
      distributeAcrossSlices(
        [slice({ min: 0, max: 1 }), slice({ min: 0, max: 1 })],
        1,
      ),
    ),
    [
      [1, 0],
      [0, 1],
    ],
  );
});

Deno.test("allocates multiple spaces across multiple slices", () => {
  assertEquals(
    Array.from(
      distributeAcrossSlices(
        [
          slice({ min: 1, max: 2 }),
          slice({ min: 0, max: 1 }),
          slice({ min: 2, max: 3 }),
        ],
        5,
      ),
    ),
    [
      [2, 1, 2],
      [2, 0, 3],
      [1, 1, 3],
    ],
  );
});

Deno.test("never allocates to empty slices", () => {
  assertEquals(
    Array.from(
      distributeAcrossSlices(
        [slice(0), slice({ min: 0, max: 1 }), slice({ min: 0, max: 1 })],
        1,
      ),
    ),
    [
      [0, 1, 0],
      [0, 0, 1],
    ],
  );
});

Deno.test("allocates correctly when slices have no upper bound", () => {
  assertEquals(Array.from(distributeAcrossSlices([zeroOrMore()], 2)), [[2]]);
});

Deno.test("allocates correctly with a trailing unbounded slice", () => {
  assertEquals(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 1),
    ),
    [],
  );
  assertEquals(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 2),
    ),
    [[0, 1, 1]],
  );
  assertEquals(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 3),
    ),
    [
      [1, 1, 1],
      [0, 1, 2],
    ],
  );
});
