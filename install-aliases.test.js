const { readFileSync, writeFileSync } = require("fs");
const { dirSync, setGracefulCleanup } = require("tmp");
const { exec } = require("shelljs");
const directPackage = require("./examples/direct/package.json");

setGracefulCleanup();

const options = { cwd: __dirname, fatal: true, silent: true };
const directPackageStr = JSON.stringify(directPackage, null, 2);

describe("install-aliases", () => {
  describe("direct", () => {
    let result;
    let tmp;
    let dir;

    beforeEach(() => {
      result = undefined;
      tmp = dirSync();
      dir = `${tmp.name}/direct/`;

      exec(`rm -Rf ./examples/direct/node_modules`, options);
      exec(`cp -Rf ./examples/direct/ ${dir}`, options);
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

    describe("integration", () => {
      it("[Yarn] should install git aliases", () => {
        result = exec(
          `cd ${dir}; INIT_CWD=${dir} yarn add --dev ${__dirname}`,
          options
        );

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

      it("[npm] should install git aliases", () => {
        result = exec(`cd ${dir}; npm install --dev ${__dirname}`, options);

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
  });

  describe("indirect", () => {
    let result;
    let tmp;
    let dir;

    beforeEach(() => {
      result = undefined;
      tmp = dirSync();

      direct = `${tmp.name}/direct/`;
      dir = `${tmp.name}/indirect/`;

      // cleanup
      exec(`rm -Rf ./examples/direct/node_modules`, options);
      exec(`rm -Rf ./examples/indirect/node_modules`, options);

      exec(`cp -Rf ./examples/direct/ ${direct}`, options);
      exec(`cp -Rf ./examples/indirect/ ${dir}`, options);

      writeFileSync(
        direct + "package.json",
        directPackageStr.replace("../", __dirname)
      );

      exec(`cd ${dir}; git init`, options);
    });

    // safe use of afterEach because of graceful cleanup set above.
    afterEach(() => tmp.removeCallback());

    describe("integration", () => {
      it("[Yarn] should install git aliases", () => {
        result = exec(
          `cd ${dir}; INIT_CWD=${dir} yarn add --dev ${direct}`,
          options
        );

        expect(result.code).toBe(0);

        // check config setup
        const config = readFileSync(`${dir}/.git/config`).toString();
        expect(config).toContain("[alias]");
        expect(config).toContain(
          "bash-alias = !node_modules/git-shared-aliases--direct/git-aliases/bash-alias"
        );
        expect(config).toContain(
          "node-alias = !node_modules/git-shared-aliases--direct/git-aliases/node-alias"
        );

        result = exec(`git bash-alias`, { ...options, cwd: dir });
        expect(result.code).toBe(0);
        expect(result.stdout).toContain("bash-alias ok");

        result = exec(`git node-alias`, { ...options, cwd: dir });
        expect(result.code).toBe(0);
        expect(result.stdout).toContain("node-alias ok");
      });

      it.skip("[npm] should install git aliases", () => {
        result = exec(`cd ${dir}; npm install --dev ${direct}`, options);

        // check config setup
        const config = readFileSync(`${dir}/.git/config`).toString();
        expect(config).toContain("[alias]");
        expect(config).toContain(
          "bash-alias = !node_modules/git-shared-aliases--direct/git-aliases/bash-alias"
        );
        expect(config).toContain(
          "node-alias = !node_modules/git-shared-aliases--direct/git-aliases/node-alias"
        );

        result = exec(`git bash-alias`, { ...options, cwd: dir });
        expect(result.code).toBe(0);
        expect(result.stdout).toContain("bash-alias ok");

        result = exec(`git node-alias`, { ...options, cwd: dir });
        expect(result.code).toBe(0);
        expect(result.stdout).toContain("node-alias ok");
      });
    });
  });
});
