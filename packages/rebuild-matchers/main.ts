import * as mod from "./mod.ts";
import tmpl from "./tmpl.ts";
import { DenoFmtStream } from "./fmt.ts";

export const filepath = import.meta.resolve(
  "@codemod/matchers/__internal/matchers/generated",
);
export const url = new URL(filepath);

if (import.meta.main) {
  const text = tmpl(mod);

  const file = await Deno.open(url, {
    write: true,
    create: true,
    truncate: true,
  });

  new Response(text).body!.pipeThrough(new DenoFmtStream()).pipeTo(
    file.writable,
  );
}
