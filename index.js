'use strict'

var util = require('util')
var path = require('path')
var exec = require('child_process').exec
var git = require('git-state')
var pkgio = require('package-json-io')
var bump = require('./lib/bump')

module.exports = function (dir, version, preversion, cb) {
  if (!cb && preversion) return module.exports(dir, version, defaultPrecommit, preversion)
  if (!cb) return module.exports(dir, version, defaultPrecommit, defaultCallback)

  git.isGit(dir, function (isGit) {
    var newVersion

    if (isGit) {
      git.dirty(dir, function (err, dirty) {
        if (err) return cb(err)
        if (dirty > 0) return cb(new Error('Git working directory not clean'))
        updatePkg()
      })
    } else {
      updatePkg()
    }

    function updatePkg () {
      var pkgFile = path.join(dir, 'package.json')

      pkgio.read(pkgFile, function (err, pkg) {
        if (err) return cb(err)

        newVersion = bump(pkg, version)

        if (!newVersion) return cb(new Error('Could not parse version command: ' + version))
        if (pkg.version === newVersion) return cb(new Error('Version not changed'))

        pkg.version = newVersion

        pkgio.update(pkgFile, pkg, function (err) {
          if (err) cb(err)
          preversion(commit)
        })
      })
    }

    function commit () {
      if (!isGit) return process.nextTick(cb)
      var cmd = util.format('git commit -a -m "%s" && git tag v%s', newVersion, newVersion)
      exec(cmd, { cwd: dir }, cb)
    }
  })
}

function defaultPrecommit (cb) {
  process.nextTick(cb)
}

function defaultCallback (err) {
  if (err) throw err
}
