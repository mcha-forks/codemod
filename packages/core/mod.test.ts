import type * as Babel from "@babel/core";
import { transformAsync } from "@codemod/core";
import { assertEquals } from "@std/assert";

const incrementNumbersPlugin = (
  _api: Babel.PluginAPI,
  _options: object,
  _dirname: string,
) => ({
  visitor: {
    NumericLiteral(path) {
      path.node.value += 1;
    },
  },
} satisfies Babel.PluginObject);

Deno.test("preserves formatting", async () => {
  const { code } = (await transformAsync("var a=1;"))!;
  assertEquals(code, "var a=1;");
});

Deno.test("transforms using a custom babel plugin", async () => {
  const { code } = (await transformAsync("var a=1", {
    plugins: [incrementNumbersPlugin],
  }))!;
  assertEquals(code, "var a=2");
});

Deno.test("parses with as many parser plugins as possible", async () => {
  await transformAsync("a ?? b");
});
