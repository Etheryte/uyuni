const fs = require("fs");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const detectJsx = require('@khanacademy/flow-to-ts/src/detect-jsx');

const args = require("./args");

(async () => {
  try {
    const { inputs: rawInputs, isVerbose } = args.parse(process.argv);

    /** Execute shell command and log the output if verbose, always log errors */
    async function execAndLog(...args) {
      const result = await exec(...args);
      const { stdout, stderr } = result;
      if (isVerbose) {
        if ((stdout || "").trim()) {
          console.log(stdout);
        } else {
          console.log("(no output)");
        }
      }
      if (stderr) {
        console.error("step had errors:");
        console.error(stderr);
        console.log("trying to proceed anyway");
      }
      return result;
    }

    const cwd = process.cwd();
    // Make all paths absolute to avoid any issues
    let inputPaths = rawInputs.map(item => path.resolve(cwd, item));
    if (isVerbose) {
      console.log(`got inputs:\n${inputPaths.join("\n")}`);
    }

    // Try and move files to correct paths with `git mv` to keep history in tact
    console.log("moving files to preserve git history")
    const tsPaths = [];
    const needsReview = [];
    for (const item of inputPaths) {
      const contents = await fs.promises.readFile(item, "utf-8");
      // Try and guess what we want to output
      let isJsx = true;
      let needsReview = false;
      try {
        isJsx = detectJsx(contents)
      } catch {
        needsReview = true;
      }

      const newName = item.replace(/.jsx?$/, isJsx ? ".tsx" : ".ts");
      if (needsReview) {
        needsReview.push(newName);
      }
      tsPaths.push(newName);

      // If this fails, we can't really reasonably recover
      const { stderr } = await execAndLog(`git mv ${item} ${newName}`);
      if (stderr) {
        throw new Error(stderr);
      }
      if (isVerbose) {
        console.log(`moved ${item} -> ${newName}`);
      }
    }
    if (needsReview.length) {
      console.log(`the following files need manual review:\n\t${needsReview.join("\n\t")}`);
    }
    const tsInputs = tsPaths.join(" ");
    if (isVerbose) {
      console.log(`got ts inputs:\n${tsPaths.join("\n")}`);
      console.log(tsPaths.length === inputPaths.length ? "lengths match" : "lengths do not match");
    }
    // This is no longer relevant beyond this point
    inputPaths = null;

    // Run an automatic tool that performs basic syntax transforms
    console.log("migrate flow");
    await execAndLog(`yarn flow-to-ts ${tsInputs}`);

    /**
     * A collection of automatic fixes for some of the most prevalent issues across the whole codebase.
     * Most of these are semantic differences between Flow and TS, others are issues because TS is stricter with types than Flow is.
     */

    const tempExtension = ".bak";

    // In Flow, the widest possible type is `Object`, in TS the equivalent type is `any`
    // const foo: Object -> const foo: any
    console.log("migrate object to any");
    await execAndLog(`sed -i'${tempExtension}' -e 's/: Object\\([^\\.]\\)/: any\\1/g' ${tsInputs}`);

    // React.useState(undefined) -> React.useState<any>(undefined)
    console.log("migrate untyped use state");
    await execAndLog(`sed -i'${tempExtension}' -e 's/React.useState(undefined)/React.useState<any>(undefined)/' ${tsInputs}`);

    // React.ReactNode -> JSX.Element
    console.log("migrate React.ReactNode to JSX.Element");
    await execAndLog(`sed -i'${tempExtension}' -e 's/=> React.ReactNode/=> JSX.Element/' ${tsInputs}`);
    await execAndLog(`sed -i'${tempExtension}' -e 's/: React.ReactNode {/: JSX.Element {/' ${tsInputs}`);

    // Array<Object> -> Array<any>
    console.log("migrate object array to any array");
    await execAndLog(`sed -i'${tempExtension}' -e 's/Array<Object>/Array<any>/' ${tsInputs}`);

    // In strict TS, an empty untyped object is of type `{}` and can't have keys added to it
    // let foo = {}; -> let foo: any = {};
    console.log("migrate untyped object initializations");
    await execAndLog(`sed -i'${tempExtension}' -e 's/let \\([a-zA-Z0-9]*\\) = {\\s*};/let \\1: any = {};/' ${tsInputs}`);
    await execAndLog(`sed -i'${tempExtension}' -e 's/const \\([a-zA-Z0-9]*\\) = {\\s*};/const \\1: any = {};/' ${tsInputs}`);
    await execAndLog(`sed -i'${tempExtension}' -e 's/var \\([a-zA-Z0-9]*\\) = {\\s*};/var \\1: any = {};/' ${tsInputs}`);

    // In strict TS, an empty untyped array is of type `never[]` and you can't push to it without adding a type
    // let foo = []; -> let foo: any[] = [];
    console.log("migrate untyped array initializations");
    await execAndLog(`sed -i'${tempExtension}' -e 's/let \\([a-zA-Z0-9]*\\) = [\\s*];/let \\1: any[] = [];/' ${tsInputs}`);
    await execAndLog(`sed -i'${tempExtension}' -e 's/const \\([a-zA-Z0-9]*\\) = [\\s*];/const \\1: any[] = [];/' ${tsInputs}`);
    await execAndLog(`sed -i'${tempExtension}' -e 's/var \\([a-zA-Z0-9]*\\) = [\\s*];/var \\1: any[] = [];/' ${tsInputs}`);

    // Find which imported files have type annotations but were not included in the migration
    console.log("finding untyped annotated imports");
    {
      const { stdout } = await execAndLog(
        `(yarn --silent tsc 2>&1 || true) | tee | grep "can only be used in TypeScript files" | sed -e 's/\\.js.*/.js/' | uniq`
      );
      const paths = stdout.split("\n").filter(item => !!item.trim());
      if (paths.length) {
        console.log(
          `the following imported files have annotations but are not marked as typed:\n\t${paths.join("\n\t")}`
        );
        console.log(`to try and migrate them, run\n\tyarn migrate ${paths.join(" ")}`);
      }
    }

    // Remove any temporary files
    console.log("cleaning up");
    for (const item of tsPaths) {
      const tempPath = item + tempExtension;
      try {
        // This path might not exist at all
        await fs.promises.access(tempPath);
        await fs.promises.unlink(tempPath);
        if (isVerbose) {
          console.log(`deleted backup file ${tempPath}`);
        }
      } catch {
        // Do nothing
      }
    }

    console.log("\ndone with automations, try running `yarn tsc` to find any remaining issues\n");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
