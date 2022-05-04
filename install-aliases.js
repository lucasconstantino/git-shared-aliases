#!/usr/bin/env node
const path = require("path");
const shell = require("shelljs");
const pkgDir = require("pkg-dir");
const glob = require("glob");

if (!process.env.INIT_CWD) {
  throw new Error(
    "INIT_CWD not available, please upgrade your package manager"
  );
}

const rootDir = pkgDir.sync(process.env.INIT_CWD).replace(/^\/private/, "");
const globOptions = { realpath: true, cwd: rootDir };

const aliases = []
  .concat(
    glob.sync("**/node_modules/*/git-aliases/*", globOptions),
    glob.sync("./git-aliases/*", globOptions)
  )
  .map(cleanPath)
  .map(toAlias)
  .filter(uniqueAlias);

if (!aliases.length) {
  console.info(`git-shared-aliases is installed, but no aliases were found.`);
  process.exit();
}

const gitRoot = cleanPath(
  // remove line breaks
  shell.exec("git rev-parse --show-toplevel", { cwd: rootDir }).stdout
);

for (const alias of aliases) {
  const pathToAliasFile = path.relative(gitRoot, alias.path);

  shell.exec(`git config alias.${alias.name} '!${pathToAliasFile}'`, {
    cwd: rootDir
  });
}

// save root as custom config
shell.exec(
  `git config git-shared-alias.root "${path.relative(gitRoot, rootDir)}"`,
  {
    cwd: rootDir
  }
);

function cleanPath(pathStr) {
  return (
    pathStr
      // replace any line-breaks
      .replace(/\r?\n|\r/g, "")
      // remove weird `/private` prefix during tests
      .replace(/^\/private/, "")
  );
}

function toAlias(fullPath) {
  return {
    path: fullPath,
    name: path.basename(fullPath)
  };
}

function uniqueAlias(alias, i, aliases) {
  for (const j in aliases) {
    if (j > i && aliases[j].name === alias.name) {
      return false;
    }
  }

  return true;
}
