export class DenoFmtStream extends TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    const done = Promise.withResolvers<void>();

    const child = new Deno.Command(
      Deno.execPath(),
      {
        args: ["fmt", "--ext=ts", "-"],
        stdin: "piped",
        stdout: "piped",
      },
    ).spawn();

    const stdin = child.stdin.getWriter();

    super({
      start(controller) {
        void (async () => {
          for await (const chunk of child.stdout) {
            controller.enqueue(chunk);
          }
          done.resolve();
        })();
      },
      transform(chunk) {
        stdin.write(chunk);
      },
      async flush(controller) {
        const [result] = await Promise.all([
          child.status,
          done.promise,
          stdin.close(),
        ]);
        if (!result.success) {
          controller.error(result.code);
        }
        await child.stdout.cancel();
      },
    });
  }
}
