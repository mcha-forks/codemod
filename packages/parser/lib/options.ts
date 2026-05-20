import type {
  FlowPluginOptions,
  ParserOptions,
  ParserPlugin,
  PipelineOperatorPluginOptions,
  TypeScriptPluginOptions,
} from "@babel/parser";

export type ParserPluginName =
  | Extract<ParserPlugin, string>
  | Extract<ParserPlugin, [string, object]>[0];

type ParserPluginOptions = Extract<ParserPlugin, [string, object]>[1];

const DefaultParserPlugins = new Set<ParserPlugin>([
  "asyncDoExpressions",
  "decorators",
  "decorators-legacy",
  "decoratorAutoAccessors",
  "deferredImportEvaluation",
  "destructuringPrivate",
  "doExpressions",
  "exportDefaultFrom",
  "functionBind",
  "functionSent",
  "importMeta",
  "jsx",
  "moduleBlocks",
  "sourcePhaseImports",
  "throwExpressions",
  "v8intrinsic",
  ["discardBinding", { syntaxType: "void" }],
  ["optionalChainingAssign", { version: "2023-07" }],
  ["partialApplication", { version: "2018-07" }],
  ["pipelineOperator", { proposal: "fsharp" }],
]);

export function isParserPluginName(name: string): name is ParserPluginName {
  for (const plugin of DefaultParserPlugins) {
    if (name === getPluginName(plugin)) {
      return true;
    }
  }
  return false;
}

/**
 * Builds options for `@babel/parser` by enabling as many features as possible,
 * while also preserving the options given as an argument.
 */
export function buildOptions({
  sourceType = "unambiguous",
  allowAwaitOutsideFunction = true,
  allowImportExportEverywhere = true,
  allowReturnOutsideFunction = true,
  allowSuperOutsideMethod = true,
  allowUndeclaredExports = true,
  plugins = [],
  sourceFilename,
  ...rest
}: ParserOptions = {}): ParserOptions {
  for (const plugin of DefaultParserPlugins) {
    if (shouldAddPlugin(plugins, plugin)) {
      plugins = [...plugins, plugin];
    }
  }

  const typePlugin = typePluginForSourceFileName(sourceFilename);

  if (shouldAddPlugin(plugins, typePlugin)) {
    plugins = [...plugins, typePlugin];
  }

  return {
    sourceType,
    allowAwaitOutsideFunction,
    allowImportExportEverywhere,
    allowReturnOutsideFunction,
    allowSuperOutsideMethod,
    allowUndeclaredExports,
    plugins,
    sourceFilename,
    ...rest,
  };
}

/**
 * Gets the type plugin to use for a given file name.
 *
 * @example
 *
 *   typePluginForSourceFileName('index.ts');  // 'typescript'
 *   typePluginForSourceFileName('index.jsx'); // 'flow'
 */
function typePluginForSourceFileName(
  sourceFileName?: string,
): "flow" | "typescript" {
  if (typeof sourceFileName === "string" && !/\.tsx?$/i.test(sourceFileName)) {
    return "flow";
  } else {
    return "typescript";
  }
}

function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "discardBinding",
): { syntaxType: "void" } | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "estree",
): { classFeatures?: boolean } | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "optionalChainingAssign",
): { version: "2023-07" } | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "partialApplication",
): { version: "2018-07" } | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "pipelineOperator",
): PipelineOperatorPluginOptions | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "flow",
): FlowPluginOptions | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: "typescript",
): TypeScriptPluginOptions | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): ParserPluginOptions | undefined;
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): ParserPluginOptions | undefined {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      if (plugin[0] === name) {
        return plugin[1];
      }
    } else if (plugin === name) {
      return {};
    }
  }
}

/**
 * Determines whether a plugin list can accept a new plugin by name.
 *
 * @example
 *
 *   shouldAddPlugin([], 'jsx');                // true; existing list does not have "jsx"
 *   shouldAddPlugin(['jsx', 'bigInt'], 'jsx'); // false; existing list already has "jsx"
 *   shouldAddPlugin(['flow'], 'typescript');   // false; "typescript" is incompatible with "flow"
 */
function shouldAddPlugin(
  plugins: Array<ParserPlugin>,
  plugin: ParserPlugin,
): boolean {
  const name = getPluginName(plugin);

  if (pluginListIncludesPlugin(plugins, name)) {
    return false;
  }

  switch (name) {
    case "flow":
    case "flowComments":
      return !getPluginOptions(plugins, "typescript");

    case "typescript":
      return !(
        getPluginOptions(plugins, "flow") ||
        getPluginOptions(plugins, "flowComments")
      );

    case "decorators":
      return !getPluginOptions(plugins, "decorators-legacy");

    case "decorators-legacy":
      return !getPluginOptions(plugins, "decorators");

    case "v8intrinsic":
      return !getPluginOptions(plugins, "placeholders");

    case "placeholders":
      return !getPluginOptions(plugins, "v8intrinsic");

    default:
      return true;
  }
}

/**
 * Checks `plugins` for an entry named `name`.
 *
 * @example
 *
 *   pluginListIncludesPlugin(['jsx', 'bigInt'], 'bigInt');              // true; list includes "bigInt" without options
 *   pluginListIncludesPlugin(['jsx', 'bigInt'], 'flow');                // false; list does not include "flow"
 *   pluginListIncludesPlugin(['jsx', ['flow', { all: true }]], 'flow'); // true; list includes "flow" with options
 */
function pluginListIncludesPlugin(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): boolean {
  return plugins.some((entry) => getPluginName(entry) === name);
}

/**
 * Gets the name of `plugin`.
 *
 * @example
 *
 *   getPluginName('decorators');            // 'decorators'
 *   getPluginName(['flow', { all: true }]); // 'flow'
 */
export function getPluginName(plugin: ParserPlugin): ParserPluginName {
  return typeof plugin === "string" ? plugin : plugin[0];
}
