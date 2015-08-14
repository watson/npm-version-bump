'use strict'

var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var osTmpdir = require('os-tmpdir')
var cuid = require('cuid')
var mkdirp = require('mkdirp')
var git = require('git-state')
var pkgio = require('package-json-io')
var test = require('tape')
var bump = require('../')
var pkg = require('../package')

var TMP = fs.existsSync('/tmp') ? '/tmp' : osTmpdir()

test('no git repo', function (t) {
  tmpdir(function (dir) {
    var file = path.join(dir, 'package.json')
    fs.writeFile(file, '{"version":"1.1.1"}', function (err) {
      t.error(err)
      suite(dir, file, t)
    })
  })
})

test('with git repo', function (t) {
  tmpdir(function (dir) {
    var file = path.join(dir, 'package.json')
    fs.writeFile(file, '{"version":"1.1.1"}', function (err) {
      t.error(err)
      exec('git init && git add -A && git commit -m "test"', { cwd: dir }, function (err) {
        t.error(err)
        suite(dir, file, t)
      })
    })
  })
})

function suite (dir, file, t) {
  var isGit = git.isGitSync(dir)

  t.test('bump(dir, version)', function (t) {
    bump(dir, 'patch')

    setTimeout(function () {
      pkgio.read(file, function (err, data) {
        t.error(err)
        t.equal(data.version, '1.1.2')
        testgit(dir, data.version, t)
      })
    }, 50)
  })

  t.test('bump(dir, version, callback)', function (t) {
    bump(dir, 'minor', function (err) {
      t.error(err)
      pkgio.read(file, function (err, data) {
        t.error(err)
        t.equal(data.version, '1.2.0')
        testgit(dir, data.version, t)
      })
    })
  })

  t.test('bump(dir, version, preversion, callback)', function (t) {
    var preversion = function (cb) {
      pkgio.read(file, function (err, data) {
        t.error(err)
        data.foo = 'bar'
        pkgio.update(file, data, cb)
      })
    }

    bump(dir, 'major', preversion, function (err) {
      t.error(err)
      pkgio.read(file, function (err, data) {
        t.error(err)
        t.equal(data.version, '2.0.0')
        t.equal(data.foo, 'bar')
        testgit(dir, data.version, t)
      })
    })
  })

  function testgit (dir, version, t) {
    if (isGit) {
      exec('git log --pretty=oneline | head -n 1', { cwd: dir }, function (err, stdout) {
        t.error(err)

        var latestRef = stdout.substr(0, stdout.indexOf(' '))
        var msg = stdout.substr(stdout.indexOf(' ')).trim()

        t.equal(msg, version)

        exec('git rev-parse v' + version, { cwd: dir }, function (err, stdout) {
          t.error(err)

          var tagRef = stdout.trim()
          t.equal(tagRef, latestRef)

          t.end()
        })
      })
    } else {
      t.end()
    }
  }
}

function tmpdir (cb) {
  var dir = path.join(TMP, pkg.name, cuid())
  mkdirp(dir, function (err) {
    if (err) throw err
    cb(dir)
  })
}
