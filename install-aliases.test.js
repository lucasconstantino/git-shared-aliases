const { readFileSync } = require("fs");
const { dirSync, setGracefulCleanup } = require("tmp");
const { exec, cat } = require("shelljs");

setGracefulCleanup();

const options = { cwd: __dirname, fatal: true, silent: true };

describe("install-aliases", () => {
  let result;
  let tmp;
  let dir;

  beforeEach(() => {
    result = undefined;
    tmp = dirSync();
    dir = `${tmp.name}/example`;

    exec(`cp -Rf ./example ${dir}`, options);
    exec(`cd ${dir}; git init`, options);
  });

  // safe use of afterEach because of graceful cleanup set above.
  afterEach(() => tmp.removeCallback());

  it("should install git aliases", () => {
    result = exec(`INIT_CWD=${dir} node ./install-aliases.js`, options);
    expect(result.code).toBe(0);

    // check config setup
    const config = readFileSync(`${dir}/.git/config`).toString();
    expect(config).toContain("[alias]");
    expect(config).toContain("bash-alias = !git-aliases/bash-alias");
    expect(config).toContain("node-alias = !git-aliases/node-alias");

    result = exec(`git bash-alias`, { ...options, cwd: dir });
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("bash-alias ok");

    result = exec(`git node-alias`, { ...options, cwd: dir });
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("node-alias ok");
  });
});
