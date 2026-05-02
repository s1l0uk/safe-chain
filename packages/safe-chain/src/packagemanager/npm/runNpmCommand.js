import { safeSpawn } from "../../utils/safeSpawn.js";
import { mergeSafeChainProxyEnvironmentVariables } from "../../registryProxy/registryProxy.js";
import { reportCommandExecutionFailure } from "../_shared/commandErrors.js";

/**
 * @param {string[]} args
 *
 * @returns {Promise<{status: number}>}
 */
export async function runNpm(args) {
  try {
    const result = await safeSpawn("npm", args, {
      stdio: "inherit",
      env: mergeSafeChainProxyEnvironmentVariables(process.env),
    });
    return { status: result.status };
  } catch (/** @type any */ error) {
    return reportCommandExecutionFailure(error, "npm");
  }
}

/**
 * Runs npm without the registry proxy (e.g. `npm test`). Uses the parent process environment.
 *
 * @param {string[]} args
 * @returns {Promise<{status: number}>}
 */
export async function runNpmWithoutProxy(args) {
  try {
    const result = await safeSpawn("npm", args, {
      stdio: "inherit",
      env: { ...process.env },
    });
    return { status: result.status };
  } catch (/** @type any */ error) {
    return reportCommandExecutionFailure(error, "npm");
  }
}
