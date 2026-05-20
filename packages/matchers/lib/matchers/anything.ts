import { Matcher } from "./Matcher.ts";

export class AnythingMatcher<T> extends Matcher<T> {
  override matchValue(_value: unknown): _value is T {
    return true;
  }
}

export function anything<T>(): Matcher<T> {
  return new AnythingMatcher();
}
