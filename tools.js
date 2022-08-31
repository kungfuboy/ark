const fs = require('fs')
const child_process = require('child_process')
const readline = require('readline')
const { Readable } = require('stream')
const path = require('path')
const figlet = require('figlet')
const _ = require('lodash')
const colors = require('colors/safe')

const warnlog = (string) => {
  console.log(colors.yellow(string))
}

const errlog = (string) => {
  console.log(colors.red(string))
}

const successlog = (string) => {
  console.log(colors.cyan(string))
}

const logoLog = (string) => {
  console.log(colors.blue(string))
}

const getStat = (path) =>
  new Promise((resolve) => {
    fs.stat(path, (err) => {
      resolve(!err)
    })
  })

const tryToExcu = (func, arg) =>
  new Promise((resolve) => {
    func(arg)
      .then((res) => {
        resolve([res, null])
      })
      .catch((err) => {
        resolve([null, err])
      })
  })

const copyDir = (src, dist) => {
  child_process.spawn('cp', ['-r', src, dist])
}

const outputLogo = (text) =>
  new Promise((resolve) => {
    figlet.text(text, { font: 'Stick Letters' }, function (err, data) {
      if (err) {
        logoLog(null)
        resolve(false)
      }
      logoLog(data)
      resolve(true)
    })
  })

const writeFileRecursive = (_path, buffer) => {
  let dirPath = path.dirname(_path)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  fs.writeFileSync(_path, buffer)
}

const findAllFile = (startPath, filterSuffix, ignoreDir = ['node_modules']) => {
  if (!fs.existsSync(startPath)) {
    return []
  }
  if (_.every(ignoreDir, (ignore) => startPath.includes(ignore))) {
    return []
  }
  return fs
    .readdirSync(startPath)
    .map((dirInner) => {
      dirInner = path.resolve(startPath, dirInner)
      const stat = fs.statSync(dirInner)
      return stat.isDirectory()
        ? findAllFile(dirInner, filterSuffix, ignoreDir)
        : dirInner.endsWith(filterSuffix)
        ? dirInner
        : []
    })
    .flat(Infinity)
}

const readStream = (url) =>
  readline.createInterface({
    input: fs.createReadStream(url),
    crlfDelay: Infinity
  })

const text2Stream = (text) =>
  readline.createInterface({
    input: Readable.from(text),
    crlfDelay: Infinity
  })

module.exports = {
  getStat,
  tryToExcu,
  copyDir,
  outputLogo,
  writeFileRecursive,
  findAllFile,
  readStream,
  text2Stream,
  warnlog,
  errlog,
  successlog,
  logoLog
}
