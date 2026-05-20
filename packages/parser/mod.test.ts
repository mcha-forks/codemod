import * as t from "@babel/types";
import { buildOptions, parse } from "@codemod/parser";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertInstanceOf,
  assertThrows,
} from "@std/assert";
import { expect } from "@std/expect";
import type { ParserPlugin } from "@babel/parser";

Deno.test('defaults `sourceType` to "unambiguous"', () => {
  assertEquals(buildOptions().sourceType, "unambiguous");
});

Deno.test("defaults `allowAwaitOutsideFunction` to true", () => {
  assert(buildOptions().allowAwaitOutsideFunction);
});

Deno.test("defaults `allowImportExportEverywhere` to true", () => {
  assert(buildOptions().allowImportExportEverywhere);
});

Deno.test("defaults `allowReturnOutsideFunction` to true", () => {
  assert(buildOptions().allowReturnOutsideFunction);
});

Deno.test("defaults `allowSuperOutsideMethod` to true", () => {
  assert(buildOptions().allowSuperOutsideMethod);
});

Deno.test("defaults `allowUndeclaredExports` to true", () => {
  assert(buildOptions().allowUndeclaredExports);
});

Deno.test("includes various plugins by default", () => {
  assertInstanceOf(buildOptions().plugins, Array);
});

Deno.test('includes "typescript" plugin when `sourceFilename` is not present', () => {
  const { plugins } = buildOptions();
  assertExists(plugins);
  assertArrayIncludes(plugins, ["typescript"]);
});

Deno.test('includes "flow" plugin when `sourceFilename` is not TypeScript', () => {
  {
    const { plugins } = buildOptions({ sourceFilename: "index.js" });
    assertExists(plugins);
    assertArrayIncludes(plugins, ["flow"]);
  }
  {
    const { plugins } = buildOptions({ sourceFilename: "index.jsx" });
    assertExists(plugins);
    assertArrayIncludes(plugins, ["flow"]);
  }
});

Deno.test('includes "typescript" plugin when `sourceFilename` is TypeScript', () => {
  {
    const { plugins } = buildOptions({ sourceFilename: "index.ts" });
    assertExists(plugins);
    assertArrayIncludes(plugins, ["typescript"]);
  }
  {
    const { plugins } = buildOptions({ sourceFilename: "index.tsx" });
    assertExists(plugins);
    assertArrayIncludes(plugins, ["typescript"]);
  }
});

Deno.test('does not include "typescript" plugin when "flow" is already enabled', () => {
  const { plugins } = buildOptions({ plugins: [["flow", { all: true }]] });
  assertExists(plugins);
  expect(plugins).not.toContainEqual("typescript" satisfies ParserPlugin);
});

Deno.test('does not mix conflicting "v8intrinsic" and "placeholders" plugins', () => {
  {
    const { plugins } = buildOptions({ plugins: ["v8intrinsic"] });
    assertExists(plugins);
    expect(plugins).not.toContainEqual("placeholders" satisfies ParserPlugin);
  }
  {
    const { plugins } = buildOptions({ plugins: ["placeholders"] });
    assertExists(plugins);
    expect(plugins).not.toContainEqual("v8intrinsic" satisfies ParserPlugin);
  }
});

Deno.test("does not mutate `plugins` array", () => {
  const plugins: Array<ParserPlugin> = [];
  buildOptions({ plugins });
  expect(plugins).toHaveLength(0);
});

Deno.test("does not mutate options", () => {
  const options = {};
  buildOptions(options);
  assertEquals(options, {});
});

Deno.test('includes "decorators" plugin with options by default', () => {
  const { plugins } = buildOptions();
  assertExists(plugins);
  assertArrayIncludes(plugins, ["decorators"]);
});

Deno.test('does not include "decorators" plugin if "decorators-legacy" is already enabled', () => {
  const { plugins } = buildOptions({ plugins: ["decorators-legacy"] });
  assertExists(plugins);
  expect(plugins).not.toContain("decorators" satisfies ParserPlugin);
});

Deno.test("parses with a very broad set of options", () => {
  assertEquals(
    parse(`
      // demonstrate 'allowReturnOutsideFunction' option and 'throwExpressions' plugin
      return true || throw new Error(a ?? b);
      // demonstrate 'allowUndeclaredExports' option
      export { a };
      // demonstrate 'typescript' plugin
      type Foo = Extract<PropertyKey, string>;
      // demonstrate 'logicalAssignment' plugin
      a ||= b
      // demonstrate 'partialApplication' plugin
      a(?, b)
      // demonstrate 'pipelineOperator' plugin with proposal=minimal
      x |> y
  `).program.body.map((node) =>
      t.isExpressionStatement(node) ? node.expression.type : node.type
    ),
    [
      "ReturnStatement",
      "ExportNamedDeclaration",
      "TSTypeAliasDeclaration",
      "AssignmentExpression",
      "CallExpression",
      "BinaryExpression",
    ],
  );
});

Deno.test("does not parse placeholders by default as they conflict with TypeScript", () => {
  const code = `
    // demonstrate 'placeholders' plugin
    %%statement%%
  `;

  assertThrows(() => parse(code));
  const node = parse(code, { plugins: ["placeholders"] }).program.body[0];
  assertEquals(node.type, "Placeholder");
});

Deno.test("allows parsing of abstract classes with abstract methods", () => {
  const code = `
    abstract class Foo {
      abstract bar(): void;
    }
  `;
  const node = parse(code).program.body[0];
  assertEquals(node.type, "ClassDeclaration");
});
