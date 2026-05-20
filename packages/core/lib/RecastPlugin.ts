import type { File } from "@babel/types";
import recast from "recast";
import type * as Babel from "@babel/core";
import type { ParseResult, ParserOptions } from "@babel/parser";
import type { GeneratorResult } from "@babel/generator";

export function parse(
  code: string,
  options: ParserOptions | undefined,
  parse: (code: string, options: ParserOptions) => File,
): ParseResult<File> {
  options = options ?? {};

  return recast.parse(code, {
    parser: {
      parse(code: string) {
        return parse(code, { ...options, tokens: true });
      },
    },
  }) as ParseResult<File>;
  // Type guarded by parser.parse
}

export function generate(ast: File): GeneratorResult {
  const result = recast.print(ast, { sourceMapName: "map.json" });
  return {
    code: result.code,
    map: result.map,
    decodedMap: undefined,
    rawMappings: undefined,
  };
}

export default function (): Babel.PluginObject {
  return {
    parserOverride: parse,
    generatorOverride: generate,
  };
}
