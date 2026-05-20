import type * as t from "@babel/types";
import * as babel from "@babel/parser";
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
export function parse(input: string, options?: babel.ParserOptions): t.File {
  return babel.parse(input, buildOptions(options));
}

/**
 * Wraps `parseExpression` from `@babel/parser`, but sets default options such that as few
 * restrictions as possible are placed on the `input` code.
 */
export function parseExpression(
  input: string,
  options?: babel.ParserOptions,
): babel.ParseResult<t.Expression> {
  return babel.parseExpression(input, buildOptions(options));
}
