import { mergeSafeChainProxyEnvironmentVariables } from "../../registryProxy/registryProxy.js";
import { safeSpawn } from "../../utils/safeSpawn.js";
import { reportCommandExecutionFailure } from "../_shared/commandErrors.js";

/**
 * @param {string[]} args
 * @param {string} [toolName]
 * @returns {Promise<{status: number}>}
 */
export async function runPnpmCommand(args, toolName = "pnpm") {
  try {
    let result;
    if (toolName === "pnpm") {
      result = await safeSpawn("pnpm", args, {
        stdio: "inherit",
        env: mergeSafeChainProxyEnvironmentVariables(process.env),
      });
    } else if (toolName === "pnpx") {
      result = await safeSpawn("pnpx", args, {
        stdio: "inherit",
        env: mergeSafeChainProxyEnvironmentVariables(process.env),
      });
    } else {
      throw new Error(`Unsupported tool name for aikido-pnpm: ${toolName}`);
    }

    return { status: result.status };
  } catch (/** @type any */ error) {
    const target = toolName === "pnpm" ? "pnpm" : "pnpx";
    return reportCommandExecutionFailure(error, target);
  }
}

/**
 * @param {string[]} args
 * @param {"pnpm" | "pnpx"} toolName
 * @returns {Promise<{status: number}>}
 */
export async function runPnpmCommandWithoutProxy(args, toolName = "pnpm") {
  try {
    const env = { ...process.env };
    let result;
    if (toolName === "pnpm") {
      result = await safeSpawn("pnpm", args, {
        stdio: "inherit",
        env,
      });
    } else if (toolName === "pnpx") {
      result = await safeSpawn("pnpx", args, {
        stdio: "inherit",
        env,
      });
    } else {
      throw new Error(`Unsupported tool name for aikido-pnpm: ${toolName}`);
    }

    return { status: result.status };
  } catch (/** @type any */ error) {
    const target = toolName === "pnpm" ? "pnpm" : "pnpx";
    return reportCommandExecutionFailure(error, target);
  }
}
