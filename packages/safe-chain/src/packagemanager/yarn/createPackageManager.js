import { getPmTailArgs } from "../_shared/getPmTailArgs.js";
import { commandArgumentScanner } from "./dependencyScanner/commandArgumentScanner.js";
import { runYarnCommand, runYarnCommandWithoutProxy } from "./runYarnCommand.js";

const scanner = commandArgumentScanner();

/**
 * @returns {import("../currentPackageManager.js").PackageManager}
 */
export function createYarnPackageManager() {
  return {
    runCommand: runYarnCommand,
    isSupportedCommand: (args) =>
      yarnNeedsScan(getPmTailArgs(args)),
    getDependencyUpdatesForCommand: (args) => scanner.scan(getPmTailArgs(args)),
    shouldPassThroughWithoutProxy: (args) =>
      !yarnNeedsScan(getPmTailArgs(args)),
    runPassThrough: runYarnCommandWithoutProxy,
  };
}

/**
 * @param {string[]} tailArgs
 * @returns {boolean}
 */
function yarnNeedsScan(tailArgs) {
  return (
    matchesCommand(tailArgs, "add") ||
    matchesCommand(tailArgs, "global", "add") ||
    matchesCommand(tailArgs, "install") ||
    matchesCommand(tailArgs, "up") ||
    matchesCommand(tailArgs, "upgrade") ||
    matchesCommand(tailArgs, "global", "upgrade") ||
    matchesCommand(tailArgs, "dlx")
  );
}

/**
 * @param {string[]} args
 * @param {...string} commandArgs
 * @returns {boolean}
 */
function matchesCommand(args, ...commandArgs) {
  if (args.length < commandArgs.length) {
    return false;
  }

  for (var i = 0; i < commandArgs.length; i++) {
    if (args[i].toLowerCase() !== commandArgs[i].toLowerCase()) {
      return false;
    }
  }

  return true;
}
