import type { ParserOptions } from "@babel/parser";
import type { File } from "@babel/types";
import { parse as babelParse } from "@babel/parser";
import { buildOptions } from "./lib/options.ts";

export {
  buildOptions,
  isParserPluginName,
  type ParserPluginName,
} from "./lib/options.ts";

/**
 * Wraps `parse` from `@babel/parser`, but sets default options such that as few
 * restrictions as possible are placed on the `input` code.
 */
export function parse(input: string, options?: ParserOptions): File {
  return babelParse(input, buildOptions(options));
}
