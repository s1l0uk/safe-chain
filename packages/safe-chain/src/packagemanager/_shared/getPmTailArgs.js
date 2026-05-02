/**
 * Index of the first token that is the package-manager subcommand (after leading
 * global flags such as `-w` / `--cwd`). Used so `npm -w pkg test` and
 * `pnpm -C dir install` are interpreted correctly.
 *
 * Only flags with known value arity are skipped in "option + value" pairs;
 * everything else is treated as a unary flag.
 *
 * @param {string[]} args
 * @returns {number}
 */
export function indexOfFirstPmSubcommand(args) {
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === "--") {
      return i + 1 < args.length ? i + 1 : args.length;
    }
    if (!a.startsWith("-")) {
      return i;
    }
    if (a.startsWith("--") && a.includes("=")) {
      i += 1;
      continue;
    }

    /** @type {Set<string>} */
    const takesFollowingValue = new Set([
      "-w",
      "--workspace",
      "--workspace-id",
      "-C",
      "--prefix",
      "--global-prefix",
      "--userconfig",
      "--globalconfig",
      "--cache",
      "--otp",
      "--registry",
      "--cwd",
      "--dir",
      "-F",
      "--filter",
      "--filter-prod",
      "--filter-dev",
    ]);

    if (takesFollowingValue.has(a)) {
      if (i + 1 >= args.length) {
        return args.length;
      }
      i += 2;
      continue;
    }

    i += 1;
  }
  return args.length;
}

/**
 * @param {string[]} args
 * @returns {string[]}
 */
export function getPmTailArgs(args) {
  return args.slice(indexOfFirstPmSubcommand(args));
}
