import * as t from "@babel/types";
import type { CapturedMatcher } from "./capture.ts";
import { nodesEquivalent } from "@codemod/utils";
import { Matcher } from "./Matcher.ts";

export class FromCaptureMatcher<T> extends Matcher<T> {
  constructor(private readonly capturedMatcher: CapturedMatcher<T>) {
    super();
  }

  override matchValue(value: unknown): value is T {
    if (t.isNode(this.capturedMatcher.current) && t.isNode(value)) {
      return nodesEquivalent(this.capturedMatcher.current, value);
    }
    return this.capturedMatcher.current === value;
  }
}

export function fromCapture<T>(
  capturedMatcher: CapturedMatcher<T>,
): Matcher<T> {
  return new FromCaptureMatcher(capturedMatcher);
}
