### TypeScript compatibility

Pino provides basic support for transports written in TypeScript.

Ideally, they should be transpiled to ensure maximum compatibility, but sometimes
you might want to use tools such as TS-Node, to execute your TypeScript
code without having to go through an explicit transpilation step.

You can use your TypeScript code without explicit transpilation, but there are
some known caveats:

- For "pure" TypeScript code, ES imports are still not supported (ES imports are
  supported once the code is transpiled).
- Only TS-Node is supported for now, there's no TSM support.
- Running transports TypeScript code on TS-Node seems to be problematic on
  Windows systems, there's no official support for that yet.
