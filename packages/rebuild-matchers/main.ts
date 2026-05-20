import * as mod from "./mod.ts";
import tmpl from "./tmpl.ts";

export const filepath = import.meta.resolve(
  "@codemod/matchers/__internal/matchers/generated",
);
export const url = new URL(filepath);

export const format = new Deno.Command(Deno.execPath(), {
  args: ["fmt", "--ext=ts", "-"],
  stdin: "piped",
  stdout: "piped",
  stderr: "inherit",
});

if (import.meta.main) {
  const text = tmpl(mod);
  const bytes = new TextEncoder().encode(text);

  const file = await Deno.open(url, {
    write: true,
    create: true,
    truncate: true,
  });

  const child = format.spawn();

  const writeFilePipe = child.stdout.pipeTo(file.writable);

  const feedTextPipe = (async () => {
    const writer = child.stdin.getWriter();
    await writer.ready;
    await writer.write(bytes);
    await writer.close();
  })();

  await Promise.all([writeFilePipe, feedTextPipe]);

  Deno.exit((await child.status).code);
}
