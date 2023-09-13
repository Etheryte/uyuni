const { exec } = require("child_process");

const ignore = require("../.auditignore.js");

const groupBy = (array, keyGetter) => {
  return array.reduce((result, item) => {
    const keyValue = keyGetter(item);
    if (!keyValue) {
      throw new TypeError(`Expected keyvalue to be a non-empty string, got ${keyValue}`);
    }
    result[keyValue] ??= [];
    result[keyValue].push(item);
    return result;
  }, {});
};

// Yarn 1.x doesn't currently support muting known issues, see https://github.com/yarnpkg/yarn/issues/6669
exec(`yarn audit --json --groups "dependencies"`, (_, stdout) => {
  try {
    const collapse = (title, text) => `<details>\n<summary>${title}</summary>\n${text}\n</details>`;

    const lines = (stdout || "").split(/\r?\n/).filter((line) => line.trim() !== "");
    const results = lines.map((line) => JSON.parse(line));

    if (!results.some((item) => item.type === "auditSummary")) {
      throw new TypeError("No audit result found");
    }

    const advisories = results.filter((item) => item.type === "auditAdvisory");
    if (!advisories.length) {
      console.log("No security advisories found, nice.");
      return;
    }

    const validAdvisories = advisories.filter((item) => {
      const { module_name: moduleName } = item.data.advisory;
      if (ignore[moduleName]) {
        return false;
      }
      return true;
    });

    if (!validAdvisories.length) {
      console.log(
        "No applicable security advisories found, but some advisories were ignored. Please check `auditignore.js`."
      );
      return;
    }

    console.log("Only advisories for production dependencies are listed.  \n");
    const grouped = groupBy(validAdvisories, (item) => item.data.advisory.module_name);
    for (const [name, items] of Object.entries(grouped)) {
      const itemList = items
        .map((item) => {
          // console.log(item);
          const advisory = item.data.advisory;
          const refs = [].concat(advisory.cves).concat(advisory.github_advisory_id);
          return [
            ``,
            ` - <b>Advisory ${advisory.id}:</b> ${advisory.title}${refs.length ? ` (${refs.join(", ")})` : ""}`,
            `   <b>Recommendation:</b> ${advisory.recommendation}`,
          ].join("  \n");
        })
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort();
      const count = itemList.length;
      console.log(
        collapse(`<code>${name}</code>: ${count} ${count > 1 ? "advisories" : "advisory"}`, itemList.join("\n"))
      );
    }
    return;
  } catch (error) {
    process.exitCode = error.code || 1;
    console.error(error);
    return;
  }
});
