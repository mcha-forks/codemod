import { buildOptions } from "@codemod/parser";
import type * as Babel from "@babel/core";
import type { ParserOptions } from "@babel/parser";

export function buildPlugin(
  sourceType: ParserOptions["sourceType"],
): Babel.PluginItem {
  return function () {
    return {
      manipulateOptions(_opts, parserOpts): void {
        const options = buildOptions({
          ...parserOpts,
          sourceType,
          plugins: parserOpts.plugins,
        });

        Object.assign(parserOpts, options);
      },
    } satisfies Babel.PluginObject;
  };
}
