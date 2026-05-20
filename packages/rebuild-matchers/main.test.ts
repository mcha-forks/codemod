import { assertEquals } from "@std/assert";
import { format, url } from "./main.ts";
import tmpl from "./tmpl.ts";
import * as mod from "./mod.ts";

Deno.test("generated file is up to date", {
  permissions: {
    read: [url],
    run: [Deno.execPath()],
  },
}, async () => {
  const bytes = new TextEncoder().encode(tmpl(mod));

  const child = format.spawn();
  const decoder = new TextDecoderStream();

  const feedTextPipe = (async () => {
    const writer = child.stdin.getWriter();
    await writer.ready;
    await writer.write(bytes);
    await writer.close();
  })();

  const readTextPipe = child.stdout.pipeTo(decoder.writable);
  const decodeText = (async () => {
    let text = "";
    for await (const chunk of decoder.readable) {
      text += chunk;
    }
    return text;
  })();
  const [, , text] = await Promise.all([
    feedTextPipe,
    readTextPipe,
    decodeText,
  ]);

  assertEquals(text, await Deno.readTextFile(url));
});
