# npm-version-bump

A programmatic version of the `npm version` command which allows you to
inject custom modifications into the version commit.

[![Build status](https://travis-ci.org/watson/npm-version-bump.svg?branch=master)](https://travis-ci.org/watson/npm-version-bump)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Installation

```
npm install --save npm-version-bump
```

## Examples

Update the package.json version property, commit it to git and tag the
commit:

```js
var bump = require('npm-version-bump')

var dir = '/path/to/module'
var version = 'patch'

bump(dir, version, function (err) {
  if (err) throw err
})
```

Update the package.json version property, perform custom modifications to files
tracked by the git repository and finally commit everything in a single
commit and tag it as a version commit:

```js
var exec = require('child_process').exec
var bump = require('npm-version-bump')

var dir = '/path/to/module'
var version = '2.0.0'

bump(dir, version, precommit, function (err) {
  if (err) throw err
})

function precommit (callback) {
  exec('./build.sh', callback)
}
```

## API

When you require the `npm-version-bump` module, the `bump` function is
returned:

```
bump(dir, version, [precommit], [callback])
```

The `bump` function accepts the following arguments:

- `dir` - The base directory of the npm module whos version you'd like
  to modify. It's expected that this directory contains a `package.json`
  file with a `version` property.

  If the directory is not a git repository, this module will still work
  as normal, except it will not commit anything.

- `version` - A string representing the `<newversion>` part of the the
  `npm version <newversion>` command. It can be either a legal
  [semver](http://semver.org) version or one of the following
  convenience bump commands:

  ```
  major | minor | patch | premajor | preminor | prepatch | prerelease
  ```

- `precommit` - An optional function that will be called before the
  actual git commit is performed. This allows you to modify any file in
  the git repository so they in turn will be included in the final
  version commit.

  The function will be called with a callback as the first argument
  which you must call when you are done. Calling this callback will
  trigger the commit.

  If this function is provided, the `callback` argument _must_ also be
  provided.

- `callback` - An optional function that will be called after the git
  commit has been performed.

  The callback will be parsed an Error object as the first argument in
  case either the commit could not be performed or the commit could not
  be tagged.

## License

MIT
