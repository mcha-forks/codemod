import * as t from "@babel/types";
import { js } from "@codemod/utils";
import * as m from "@codemod/matchers";
import { assert, assertEquals, assertFalse } from "@std/assert";

function assertType<T>(_value: T): void {
  // nothing to do
}

Deno.test("anyString matches strings", () => {
  assert(m.anyString().match(""));
  assert(m.anyString().match("abc"));
  assert(m.anyString().match("hi\nthere"));
  assert(m.anyString().match(String("even this")));

  assertFalse(m.anyString().match(0));
  assertFalse(m.anyString().match(null));
  assertFalse(m.anyString().match(undefined));
  assertFalse(m.anyString().match([]));
  assertFalse(m.anyString().match({}));

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anyString().match(value)) {
    void (() => value.toLowerCase());
  }
});

Deno.test("anyNumber matches numbers", () => {
  assert(m.anyNumber().match(0));
  assert(m.anyNumber().match(Number.NaN));
  assert(m.anyNumber().match(Number(1)));
  assert(m.anyNumber().match(Infinity));
  assert(m.anyNumber().match(Number.MAX_VALUE));

  assertFalse(m.anyNumber().match("string!?"));
  assertFalse(m.anyNumber().match(null));
  assertFalse(m.anyNumber().match(undefined));
  assertFalse(m.anyNumber().match([]));
  assertFalse(m.anyNumber().match({}));

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anyNumber().match(value)) {
    void (() => value.toFixed());
  }
});

Deno.test("anything matches everything", () => {
  assert(m.anything().match(0));
  assert(m.anything().match(""));
  assert(m.anything().match([]));
  assert(m.anything().match({}));
  assert(m.anything().match(Number));
  assert(m.anything().match(null));
  assert(m.anything().match(undefined));

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anything<number>().match(value)) {
    void (() => value.toFixed());
  }
});

Deno.test("arrayOf matches a variable-length homogenous array", () => {
  assert(m.arrayOf(m.anyString()).match([]));
  assert(m.arrayOf(m.anyString()).match(["a", "b"]));
  assert(m.arrayOf(m.arrayOf(m.anyString())).match([[], ["a"]]));

  assertFalse(m.arrayOf(m.anyString()).match(["a", 1]));
  assertFalse(m.arrayOf(m.anyString()).match([0, 1]));

  assertFalse(m.arrayOf(m.anything()).match(null));
  assertFalse(m.arrayOf(m.anything()).match(undefined));
  assertFalse(m.arrayOf(m.anything()).match({}));
  assertFalse(m.arrayOf(m.anything()).match(Number));

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.arrayOf(m.anyString()).match(value)) {
    void (() => value.push("element"));
  }
});

Deno.test("tupleOf matches a fixed-length array", () => {
  const stringNumberAnything = m.tupleOf<unknown>(
    m.anyString(),
    m.anyNumber(),
    m.anything(),
  );

  // happy path
  assert(stringNumberAnything.match(["a", 1, {}]));

  // out of order matchers
  assertFalse(stringNumberAnything.match([1, "", {}]));

  // too few elements
  assertFalse(stringNumberAnything.match([]));

  // too many elements
  assertFalse(stringNumberAnything.match(["a", 1, {}, []]));

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (stringNumberAnything.match(value)) {
    void (() => value.length);
  }
});

Deno.test("oneOf matches a single-element array", () => {
  assert(m.oneOf(m.anyString()).match([""]));
  assert(m.oneOf(m.anything()).match([{}]));

  assertFalse(m.oneOf(m.anyString()).match(["", ""]));
  assertFalse(m.oneOf(m.anyString()).match([0]));
  assertFalse(m.oneOf(m.anyString()).match([]));
});

Deno.test("anyNode matches any known AST node type", () => {
  assert(m.anyNode().match(t.identifier("abc")));
  assert(m.anyNode().match(t.blockStatement([])));

  assertFalse(m.anyNode().match("Identifier"));
  assertFalse(m.anyNode().match(0));
  assertFalse(m.anyNode().match({}));
  assertFalse(m.anyNode().match({ type: "not a known type" }));
  assertFalse(m.anyNode().match(null));
  assertFalse(m.anyNode().match(undefined));
});

Deno.test("anyExpression matches any known AST expression node type", () => {
  assert(m.anyExpression().match(t.identifier("abc")));
  assert(
    m
      .anyExpression()
      .match(t.functionExpression(null, [], t.blockStatement([]))),
  );

  assertFalse(m.anyExpression().match(t.file(t.program([]), [], [])));
  assertFalse(m.anyExpression().match(t.blockStatement([])));
  assertFalse(m.anyExpression().match(t.emptyStatement()));
  assertFalse(m.anyExpression().match(t.returnStatement()));
  assertFalse(m.anyExpression().match(t.blockStatement([])));
});

Deno.test("anyStatement matches any known AST statement node type", () => {
  assert(m.anyStatement().match(t.emptyStatement()));
  assert(m.anyStatement().match(t.returnStatement()));
  assert(m.anyStatement().match(t.blockStatement([])));

  assertFalse(m.anyStatement().match(t.thisExpression()));
  assertFalse(m.anyStatement().match(t.program([])));
  assertFalse(m.anyStatement().match(t.file(t.program([]), [], [])));
  assertFalse(m.anyStatement().match(t.program([])));
});

Deno.test("m.function( matches any known function node type", () => {
  assert(
    m.function().match(t.functionDeclaration(null, [], t.blockStatement([]))),
  );
  assert(
    m.function().match(t.functionExpression(null, [], t.blockStatement([]))),
  );
  assert(
    m.function().match(t.arrowFunctionExpression([], t.blockStatement([]))),
  );

  assertFalse(m.function().match(t.thisExpression()));
  assertFalse(m.function().match(t.blockStatement([])));
});

Deno.test("anyList reduces to tupleOf without any slices", () => {
  assert(m.anyList().match([]));
  assert(
    m.anyList<number | string>(m.anyString(), m.anyNumber()).match(["", 0]),
  );
});

Deno.test("anyList with a fixed-width leading slice", () => {
  const list = m.anyList(m.slice(1), m.anyString());
  assertFalse(list.match([""]));
  assert(list.match([{}, ""]));
  assertFalse(list.match([{}, {}, ""]));
});

Deno.test("anyList with slices with specific matchers", () => {
  const list = m.anyList<number | string>(
    m.slice({ min: 1, max: 2, matcher: m.anyNumber() }),
    m.anyString(),
  );
  assertFalse(list.match([""]));
  assert(list.match([0, ""]));
  assert(list.match([0, 0, ""]));
  assertFalse(list.match([0, "", ""]));

  const matcher = m.anyList<string | number>(
    m.anyString(),
    m.oneOrMore(m.anyNumber()),
    m.anyString(),
  );
  assert(matcher.match(["", 1, 1, ""]));
  assertFalse(matcher.match(["", 1, null, ""]));
});

Deno.test("anyList with a variable-width leading slice", () => {
  const list = m.anyList(m.slice({ min: 0, max: 1 }), m.anyString());
  assert(list.match([""]));
  assert(list.match([{}, ""]));
  assertFalse(list.match([{}, {}, ""]));
});

Deno.test("anyList with a zero-width leading slice", () => {
  const list = m.anyList(m.slice(0), m.anyString());
  assert(list.match([""]));
  assertFalse(list.match([{}, ""]));
  assertFalse(list.match([{}, {}, ""]));
});

Deno.test("anyList with a fixed-width trailing slice", () => {
  const list = m.anyList(m.anyString(), m.slice(1));
  assertFalse(list.match([""]));
  assert(list.match(["", ""]));
  assertFalse(list.match(["", "", ""]));
});

Deno.test("anyList with multiple fixed slices", () => {
  const list = m.anyList<number | string>(
    m.slice(1),
    m.anyString(),
    m.slice(1),
    m.anyNumber(),
    m.slice(1),
  );
  assertFalse(list.match([]));
  assert(list.match([1, "", 2, 3, ""]));
  assertFalse(list.match([1, {}, 2, 3, ""]));
});

Deno.test("anyList with multiple dynamic slices", () => {
  const list = m.anyList<t.Statement>(
    m.zeroOrMore(),
    m.returnStatement(),
    m.oneOrMore(),
  );
  assertFalse(list.match(js("return;").program.body));
  assert(list.match(js("return; foo();").program.body));
});

Deno.test("or matches one of the values", () => {
  const mString = m.or(m.anyString());
  const mStringOrNumber = m.or(m.anyString(), m.anyNumber());
  const mStringOrNumberOrNull = m.or(m.anyString(), m.anyNumber(), null);
  assertType<m.Matcher<string>>(mString);
  assertType<m.Matcher<string | number>>(mStringOrNumber);
  assertType<m.Matcher<string | number | null>>(mStringOrNumberOrNull);

  assertFalse(m.or().match(undefined));
  assert(mString.match(""));
  assert(mStringOrNumber.match(1));
  assert(mStringOrNumber.match(""));
  assert(mStringOrNumberOrNull.match(null));
  assertFalse(mStringOrNumber.match({}));
});

Deno.test("or matches literal values", () => {
  const m1 = m.or(1);
  const m1or2 = m.or(1, 2);
  assertType<m.Matcher<number>>(m1);
  assertType<m.Matcher<number>>(m1or2);

  assert(m1.match(1));
  assert(m1or2.match(1));
  assert(m1or2.match(2));
  assertFalse(m1or2.match(3));
  assertFalse(m1or2.match({}));
});

Deno.test("or matches mixed literal values and matchers", () => {
  assert(m.or(1, m.anyString()).match(1));
  assert(m.or(1, m.anyString()).match(""));
  assertFalse(m.or(1, m.anyString()).match({}));
});

Deno.test("containerOf recurses to find a node matching the pattern", () => {
  assert(
    m
      .containerOf(m.binaryExpression("+", m.identifier(), m.numericLiteral()))
      .match(js("return a + 1")),
  );
  assert(
    m.containerOf(m.numericLiteral()).match(js("return a + 1")),
  );
  assertFalse(
    m.containerOf(m.numericLiteral()).match(js("return a + b")),
  );
});

Deno.test("containerOf captures the first matching value", () => {
  const plusMatcher = m.containerOf(m.binaryExpression("+"));

  assert(plusMatcher.match(js("console.log(a + b + c);")));
  assertEquals({
    currentKeys: plusMatcher.currentKeys,
    // structuredClone required to strip class info
    current: structuredClone(plusMatcher.current),
  }, {
    currentKeys: ["program", "body", 0, "expression", "arguments", 0],
    current: t.binaryExpression(
      "+",
      t.binaryExpression("+", t.identifier("a"), t.identifier("b")),
      t.identifier("c"),
    ),
  });
});

Deno.test("containerOf can be used in a nested matcher", () => {
  assert(
    m
      .containerOf(
        m.functionDeclaration(
          m.anything(),
          m.anything(),
          m.containerOf(m.thisExpression()),
        ),
      )
      .match(js("function returnThis() { return this; }")),
  );
});

Deno.test("matcher builds a matcher based on a predicate", () => {
  const matcher = m.matcher(
    (value) => typeof value === "string" && value.startsWith("no"),
  );

  assert(matcher.match("no"));
  assert(matcher.match("nope"));
  assert(matcher.match("no way"));
  assert(matcher.match("notice"));

  assertFalse(matcher.match(""));
  assertFalse(matcher.match("another"));
  assertFalse(matcher.match({}));
  assertFalse(matcher.match(42));
});

Deno.test("fromCapture builds a matcher based on a capturing matcher", () => {
  const capture = m.capture(m.identifier());
  const matcher = m.fromCapture(capture);
  const id = t.identifier("a");
  const idEquivalent = t.identifier("a");
  const idUnequivalent = t.identifier("b");

  // matching the capture matcher should capture the value
  assertEquals(capture.current, undefined);
  assert(capture.match(id));
  assertEquals(capture.current, id);

  // `fromCapture` uses the captured value to build a matcher
  assert(matcher.match(id));
  assert(matcher.match(idEquivalent));
  assertFalse(matcher.match(idUnequivalent));
  assertFalse(matcher.match(9));
});

Deno.test("regression: #921", () => {
  assert(
    m
      .functionExpression(m.anything())
      .match(t.functionExpression(null, [], t.blockStatement([]))),
  );
});
