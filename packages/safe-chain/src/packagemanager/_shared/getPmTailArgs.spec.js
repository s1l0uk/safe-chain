import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPmTailArgs, indexOfFirstPmSubcommand } from "./getPmTailArgs.js";

describe("getPmTailArgs", () => {
  it("returns args unchanged when the subcommand is first", () => {
    assert.deepEqual(getPmTailArgs(["test"]), ["test"]);
    assert.deepEqual(getPmTailArgs(["install", "lodash"]), ["install", "lodash"]);
  });

  it("skips common npm workspace and cwd flags", () => {
    assert.deepEqual(getPmTailArgs(["-w", "pkg", "test"]), ["test"]);
    assert.deepEqual(getPmTailArgs(["--workspace=pkg", "install"]), ["install"]);
    assert.deepEqual(getPmTailArgs(["-C", "/tmp", "ci"]), ["ci"]);
  });

  it("honours -- as end of global options", () => {
    assert.deepEqual(getPmTailArgs(["--", "install"]), ["install"]);
  });

  it("indexOfFirstPmSubcommand returns length when only flags", () => {
    assert.equal(indexOfFirstPmSubcommand(["--version"]), 1);
  });
});
