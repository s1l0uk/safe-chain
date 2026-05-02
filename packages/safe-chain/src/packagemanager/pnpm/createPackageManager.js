import { getPmTailArgs } from "../_shared/getPmTailArgs.js";
import { matchesCommand } from "../_shared/matchesCommand.js";
import { commandArgumentScanner } from "./dependencyScanner/commandArgumentScanner.js";
import { runPnpmCommand, runPnpmCommandWithoutProxy } from "./runPnpmCommand.js";

const scanner = commandArgumentScanner();

/**
 * @returns {import("../currentPackageManager.js").PackageManager}
 */
export function createPnpmPackageManager() {
  return {
    runCommand: (args) => runPnpmCommand(args, "pnpm"),
    isSupportedCommand: (args) => pnpmNeedsScan(args),
    getDependencyUpdatesForCommand: (args) =>
      getDependencyUpdatesForCommand(args, false),
    shouldPassThroughWithoutProxy: (args) => !pnpmNeedsScan(args),
    runPassThrough: (args) => runPnpmCommandWithoutProxy(args, "pnpm"),
  };
}

/**
 * @returns {import("../currentPackageManager.js").PackageManager}
 */
export function createPnpxPackageManager() {
  return {
    runCommand: (args) => runPnpmCommand(args, "pnpx"),
    isSupportedCommand: () => true,
    getDependencyUpdatesForCommand: (args) =>
      getDependencyUpdatesForCommand(args, true),
  };
}

/**
 * @param {string[]} args
 * @returns {boolean}
 */
function pnpmNeedsScan(args) {
  const tail = getPmTailArgs(args);
  return (
    matchesCommand(tail, "add") ||
    matchesCommand(tail, "update") ||
    matchesCommand(tail, "upgrade") ||
    matchesCommand(tail, "up") ||
    matchesCommand(tail, "install") ||
    matchesCommand(tail, "i") ||
    // dlx does not always come in the first position
    // eg: pnpm --package=yo --package=generator-webapp dlx yo webapp
    // documentation: https://pnpm.io/cli/dlx#--package-name
    args.includes("dlx")
  );
}

/**
 * @param {string[]} args
 * @param {boolean} isPnpx
 * @returns {ReturnType<import("../currentPackageManager.js").PackageManager["getDependencyUpdatesForCommand"]>}
 */
function getDependencyUpdatesForCommand(args, isPnpx) {
  const tail = getPmTailArgs(args);
  if (isPnpx) {
    return scanner.scan(tail);
  }
  if (args.includes("dlx")) {
    // dlx is not always the first argument (eg: `pnpm --package=yo --package=generator-webapp dlx yo webapp`)
    // so we need to filter it out instead of slicing the array
    // documentation: https://pnpm.io/cli/dlx#--package-name
    return scanner.scan(args.filter((arg) => arg !== "dlx"));
  }
  return scanner.scan(tail.slice(1));
}
