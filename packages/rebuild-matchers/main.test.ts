import { assertEquals } from "@std/assert";
import { url } from "./main.ts";
import tmpl from "./tmpl.ts";
import { DenoFmtStream } from "./fmt.ts";
import * as mod from "./mod.ts";

Deno.test("generated file is up to date", {
  permissions: {
    read: [url],
    run: [Deno.execPath()],
  },
}, async () => {
  const text = await new Response(
    new Response(tmpl(mod)).body!.pipeThrough(new DenoFmtStream()),
  ).text();

  assertEquals(text, await Deno.readTextFile(url));
});
