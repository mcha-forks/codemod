import * as Babel from "@babel/core";
import gensync from "gensync";
import { buildPlugin } from "./AllSyntaxPlugin.ts";
import RecastPlugin from "./RecastPlugin.ts";

type FileResultCallback = {
  (err: Error, file: null): void;
  (err: null, file: Babel.FileResult | null): void;
};

const babelTransform = gensync({
  sync: Babel.transformSync,
  errback: (
    code: string,
    opts: Babel.InputOptions | null | undefined,
    callback: (err: Error | null, result: Babel.FileResult | null) => void,
  ) => Babel.transform(code, opts, callback),
});

const transformRunner = gensync(function* transform(
  code: string,
  options: Babel.InputOptions = {},
): gensync.Handler<Babel.FileResult | null> {
  const result = yield* babelTransform(code, {
    ...options,
    plugins: [
      ...(options.plugins || []),
      buildPlugin(options.sourceType || "unambiguous"),
      RecastPlugin,
    ],
  });
  return result;
});

export const transform: typeof Babel.transform = function transform(
  code,
  optsOrCallback?: Babel.InputOptions | null | undefined | FileResultCallback,
  maybeCallback?: FileResultCallback,
) {
  let opts: Babel.InputOptions | undefined;
  let callback: FileResultCallback | undefined;
  if (typeof optsOrCallback === "function") {
    callback = optsOrCallback;
    opts = undefined;
  } else if (optsOrCallback === null) {
    opts = undefined;
    callback = maybeCallback;
  } else {
    opts = optsOrCallback;
    callback = maybeCallback;
  }

  if (callback === undefined) {
    throw new Error(
      "Starting from Babel 8.0.0, the 'transform' function expects a callback. If you need to call it synchronously, please use 'transformSync'.",
    );
  }

  transformRunner.errback(code, opts, callback);
  return null;
};

export const transformSync: typeof Babel.transformSync = function transformSync(
  code,
  opts?,
) {
  if (opts === null) opts = undefined;
  return transformRunner.sync(code, opts);
};
export const transformAsync: typeof Babel.transformAsync =
  function transformAsync(code, opts?) {
    if (opts === null) opts = undefined;
    return transformRunner.async(code, opts);
  };
