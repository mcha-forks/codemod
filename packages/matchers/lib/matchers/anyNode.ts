import * as t from "@babel/types";
import { Matcher } from "./Matcher.ts";

export class AnyNodeMatcher extends Matcher<t.Node> {
  override matchValue(value: unknown): value is t.Node {
    return t.isNode(value);
  }
}

export function anyNode(): Matcher<t.Node> {
  return new AnyNodeMatcher();
}
