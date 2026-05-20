import type { NodeField } from "@codemod/utils";
import * as t from "@babel/types";
import {
  isValidatorOfType,
  stringifyType,
  stringifyValidator,
  typeForValidator,
} from "./utils/ast.ts";

export { isValidatorOfType, t };
export { toFunctionName } from "./utils/ast.ts";
export { BUILDER_KEYS, NODE_FIELDS } from "@codemod/utils";

export const ALIASES = new Map([
  ["Import", "import"],
  ["Super", "super"],
]);

export function stringifyMatcherForField(field: NodeField): string {
  const types = [
    `Matcher<${stringifyValidator(field.validate, "t.", "")}>`,
    ...possiblePrimitiveTypesForField(field),
  ];

  if (
    isValidatorOfType("array", field.validate) &&
    "chainOf" in field.validate
  ) {
    const elementType = typeForValidator(field.validate.chainOf[1]);

    types.push(
      stringifyType(elementType, (type, value) => {
        if (t.isTSTypeReference(type)) {
          return `Matcher<t.${value}>`;
        } else if (
          t.isTSLiteralType(type) ||
          t.isTSBooleanKeyword(type) ||
          t.isTSNumberKeyword(type) ||
          t.isTSStringKeyword(type) ||
          t.isTSUndefinedKeyword(type) ||
          t.isTSNullKeyword(type)
        ) {
          return `Matcher<${value}>`;
        }
      }),
    );
  }

  if (field.optional) {
    types.push("null");
  }

  return types.join(" | ");
}

export function possiblePrimitiveTypesForField(
  field: NodeField,
): Array<string> {
  return ["string", "number", "boolean", "bigint"].filter((type) =>
    isValidatorOfType(type, field.validate)
  );
}
