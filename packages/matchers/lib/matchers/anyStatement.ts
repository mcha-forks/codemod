import * as t from "@babel/types";
import { Matcher } from "./Matcher.ts";

export class AnyStatementMatcher extends Matcher<t.Statement> {
  override matchValue(value: unknown): value is t.Statement {
    return t.isNode(value) && t.isStatement(value);
  }
}

export function anyStatement(): Matcher<t.Statement> {
  return new AnyStatementMatcher();
}
