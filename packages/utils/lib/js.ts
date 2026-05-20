import * as t from "@babel/types";
import { parse } from "@codemod/parser";
import { NODE_FIELDS } from "./NodeTypes.ts";

function fieldsForNodeType(nodeType: string): Set<string> {
  return new Set(["type", ...Object.keys(NODE_FIELDS[nodeType])]);
}

export function js(code: string): t.File {
  return stripExtras(parse(code));
}

function stripExtras<N extends t.Node>(node: N): N {
  const fieldsToKeep = fieldsForNodeType(node.type) as Set<keyof typeof node>;
  const allFields = Object.keys(node) as (keyof typeof node)[];

  for (const field of allFields) {
    const nodeObj = node;

    if (!fieldsToKeep.has(field)) {
      delete nodeObj[field];
    } else {
      const children = Array.isArray(nodeObj[field])
        ? nodeObj[field]
        : [nodeObj[field]];

      for (const child of children) {
        if (t.isNode(child)) {
          stripExtras(child);
        }
      }
    }
  }

  return node;
}
