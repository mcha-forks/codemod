import * as t from "@babel/types";
import { nodesEquivalent } from "@codemod/utils";
import { assert, assertFalse } from "@std/assert";

Deno.test("a node is equivalent to itself", () => {
  const node = t.identifier("a");
  assert(nodesEquivalent(node, node));
});

Deno.test("two nodes with different types are not equivalent", () => {
  const a = t.identifier("a");
  const two = t.numericLiteral(2);
  assertFalse(nodesEquivalent(a, two));
});

Deno.test("two nodes with the same type and the same properties are equivalent", () => {
  const a = t.identifier("a");
  const b = t.identifier("a");
  assert(nodesEquivalent(a, b));
});

Deno.test("two nodes with the same type and different properties are not equivalent", () => {
  const a = t.identifier("a");
  const b = t.identifier("b");
  assertFalse(nodesEquivalent(a, b));
});

Deno.test("two nodes with differing optional properties are not equivalent", () => {
  const a = t.identifier("a");
  const b = t.identifier("a");
  a.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
  assertFalse(nodesEquivalent(a, b));
});

Deno.test("two nodes with different children are not equivalent", () => {
  const a = t.arrayExpression([t.identifier("a")]);
  const b = t.arrayExpression([t.identifier("b")]);
  assertFalse(nodesEquivalent(a, b));
});

Deno.test("two nodes with differing number of children are not equivalent", () => {
  const a = t.arrayExpression([t.identifier("a")]);
  const b = t.arrayExpression([t.identifier("a"), t.identifier("b")]);
  assertFalse(nodesEquivalent(a, b));
});

Deno.test("two nodes with the same children are equivalent", () => {
  const a = t.arrayExpression([t.identifier("a")]);
  const b = t.arrayExpression([t.identifier("a")]);
  assert(nodesEquivalent(a, b));
});

Deno.test("two nodes with equivalent fixed children are equivalent", () => {
  const a = t.identifier("a");
  const b = t.identifier("a");
  a.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
  b.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
  assert(nodesEquivalent(a, b));
});

Deno.test("two nodes with non-equivalent fixed children are not equivalent", () => {
  const a = t.identifier("a");
  const b = t.identifier("a");
  a.typeAnnotation = t.tsTypeAnnotation(t.tsUnknownKeyword());
  b.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
  assertFalse(nodesEquivalent(a, b));
});
