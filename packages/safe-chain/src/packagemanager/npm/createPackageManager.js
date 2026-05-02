import { getPmTailArgs } from "../_shared/getPmTailArgs.js";
import { commandArgumentScanner } from "./dependencyScanner/commandArgumentScanner.js";
import { nullScanner } from "./dependencyScanner/nullScanner.js";
import { runNpm, runNpmWithoutProxy } from "./runNpmCommand.js";
import {
  getNpmCommandForArgs,
  npmCiCommand,
  npmExecCommand,
  npmInstallCiTestCommand,
  npmInstallCommand,
  npmInstallTestCommand,
  npmUpdateCommand,
} from "./utils/npmCommands.js";

/** Commands that use the registry proxy for installs but are not covered by pre-scan. */
const npmCommandsThatAlwaysUseRegistryProxy = new Set([
  npmCiCommand,
  npmInstallTestCommand,
  npmInstallCiTestCommand,
  "link",
]);

/**
 * @returns {import("../currentPackageManager.js").PackageManager}
 */
export function createNpmPackageManager() {
  /**
   * @param {string[]} args
   *
   * @returns {boolean}
   */
  function isSupportedCommand(args) {
    const tail = getPmTailArgs(args);
    const scanner = findDependencyScannerForCommand(
      commandScannerMapping,
      tail
    );
    return scanner.shouldScan(tail, args);
  }

  /**
   * @param {string[]} args
   *
   * @returns {ReturnType<import("../currentPackageManager.js").PackageManager["getDependencyUpdatesForCommand"]>}
   */
  function getDependencyUpdatesForCommand(args) {
    const tail = getPmTailArgs(args);
    const scanner = findDependencyScannerForCommand(
      commandScannerMapping,
      tail
    );
    return scanner.scan(tail);
  }

  /**
   * @param {string[]} args
   * @returns {boolean}
   */
  function shouldPassThroughWithoutProxy(args) {
    if (isSupportedCommand(args)) {
      return false;
    }
    const cmd = getNpmCommandForArgs(args);
    if (!cmd) {
      return true;
    }
    if (npmCommandsThatAlwaysUseRegistryProxy.has(cmd)) {
      return false;
    }
    return true;
  }

  return {
    runCommand: runNpm,
    isSupportedCommand,
    getDependencyUpdatesForCommand,
    shouldPassThroughWithoutProxy,
    runPassThrough: runNpmWithoutProxy,
  };
}

/**
 * @type {Record<string, import("./dependencyScanner/commandArgumentScanner.js").CommandArgumentScanner>}
 */
const commandScannerMapping = {
  [npmInstallCommand]: commandArgumentScanner(),
  [npmUpdateCommand]: commandArgumentScanner(),
  [npmExecCommand]: commandArgumentScanner({ ignoreDryRun: true }), // exec command doesn't support dry-run
};

/**
 *
 * @param {Record<string, import("./dependencyScanner/commandArgumentScanner.js").CommandArgumentScanner>} scanners
 * @param {string[]} tailArgs
 *
 * @returns {import("./dependencyScanner/commandArgumentScanner.js").CommandArgumentScanner}
 */
function findDependencyScannerForCommand(scanners, tailArgs) {
  const command = getNpmCommandForArgs(tailArgs);
  if (!command) {
    return nullScanner();
  }

  const scanner = scanners[command];
  return scanner ? scanner : nullScanner();
}
