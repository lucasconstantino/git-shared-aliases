const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

const dir = process.env.INIT_CWD;

if (!dir) {
  throw new Error(
    "INIT_CWD not available, please upgrade your package manager"
  );
}

const package = require(`${dir}/package.json`);
const targetDir = path.resolve(dir, package.gitAliasesDir || `./git-aliases`);

if (!fs.existsSync(targetDir)) {
  console.info(
    `git-local-aliases is installed, but no aliases were found at ${targetDir}`
  );
  process.exit();
}

const gitRoot = shell
  .exec("git rev-parse --show-toplevel", { cwd: dir })
  // remove line breaks
  .stdout.replace(/\r?\n|\r/g, "")
  // remove weird `/private` prefix during tests
  .replace(/^\/private/, "");

const aliases = fs.readdirSync(targetDir);

for (const alias of aliases) {
  const pathToAliasFile = path.relative(
    gitRoot,
    path.resolve(targetDir, alias)
  );

  shell.exec(`git config alias.${alias} '!${pathToAliasFile}'`, { cwd: dir });
}
