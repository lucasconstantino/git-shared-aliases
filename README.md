# Git Shared Aliases

> Git aliases made available across your team

This package will allow your team to share the same Git aliases with ease. Very useful for aliases such as semantic commits (i.e.: `git chore 'message'`).

## Install

Create a directory named `./git-aliases` in your project root. Any executable files within this directory will be mapped to a local git alias with the same name.

Example `./git-aliases/hello` file:

```sh
#!/usr/bin/env bash

echo "Hello, $1"
```

Then, install `git-shared-aliases` dependency to get aliases installed:

```sh
npm install git-shared-aliases --save-dev
```

Use the new alias:

```sh
git hello 'world'
```

## See also

- [husky](https://github.com/typicode/husky) - Git hooks made easy 🐶 woof!

## License

MIT
