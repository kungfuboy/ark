#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const commander = require('commander')
const prettier = require('prettier')
const _ = require('lodash')
const { parseAlice } = require('./dist/alice.js')
const Tifa = require('./dist/tifa.js')
const parseMikasa = require('./dist/mikasa.js')
const packageJson = require('./package.json')
const {
  errlog,
  warnlog,
  successlog,
  outputLogo,
  findAllFile,
  readStream,
  text2Stream
} = require('./tools.js')

const formatOption = { semi: false, singleQuote: true, trailingComma: 'none' }

const fomatJs = Object.assign(formatOption, { parser: 'babel' })

commander.version(packageJson.version)

commander
  .command('doc [file] [mdFile]')
  .description('生成文档')
  .option('-a, --ark', '获取 ark 文档手册')
  .action(async (jsFile, mdFile = 'README', { ark }) => {
    await outputLogo('Alice')
    if (ark) {
      const mdc = fs.readFileSync(path.join(__dirname, './README.md'), {
        encoding: 'utf8'
      })
      fs.writeFileSync(process.cwd() + `/Ark\ Cookbook.md`, mdc)
      successlog(`《Ark Cookbook》is generated, hope you like it.`)
      return
    }
    const _path = path.join(process.cwd(), jsFile)
    const rl = readStream(_path)
    const mdc = await parseAlice(rl, _path)
    const _filePath = _path.replace(/[^/]+$/m, mdFile.replace(/\.md$/m, ''))
    fs.writeFileSync(`${_filePath}.md`, mdc)
    successlog(`Compile ${_filePath}.md file is success.`)
  })

commander
  .command('mikasa <dir>')
  .option('-s, --suffix <suffix>', '需要编译的格式后缀')
  .option('-f, --file <file>', '指定需要编译的文件')
  .option('-e, --execute <execute>', '执行的文件名，默认为 main')
  .option('-t, --tifa <tifaConf>', '直接调用tifa进行测试')
  .option('-d, --debug', '输出辅助调试的 ast 文件')
  .description('数据收集和处理工具')
  .action(async (dir, { debug = false, ...args }) => {
    await outputLogo('Mikasa')
    const { suffix, file, execute, tifaConf } = args
    const dirPath = path.join(process.cwd(), dir)
    const fileList = file
      ? [path.join(dirPath, `./${file}`)]
      : findAllFile(dirPath, `.${suffix || 't'}`)
    // console.log(fileList)
    if (!fileList.length) {
      errlog(`Not found .${suffix || 't'} file in the directory.`)
      return
    }
    const tifaConfig = tifaConf
      ? require(path.join(process.cwd(), tifaConf))
      : {}
    fileList.forEach(async (_path) => {
      const rl = readStream(_path)
      const result = await parseMikasa(rl)
      if (tifaConfig) {
        // 调用 tifa 进行测试
        const testFiles = await Promise.all(
          result.flatMap(({ block, cases }) =>
            cases.map(async ({ title, content }) => {
              const rl = text2Stream(content)
              const ast = await Tifa.parser(rl)
              const code = Tifa.generator(ast, {
                config: tifaConfig,
                isDebug: debug
              })
              return {
                title: block.title,
                name: title,
                ast,
                code,
                content
              }
            })
          )
        )
        // * 写入文件
        testFiles.forEach(({ title, name, ast, content, code }) => {
          fs.writeFileSync(
            `${dirPath}/${_.kebabCase(title + '-' + name)}.test.js`,
            prettier.format(code, fomatJs)
          )
          if (debug) {
            fs.writeFileSync(
              `${dirPath}/${_.kebabCase(title + '-' + name)}.ast.js`,
              prettier.format(JSON.stringify(ast, null, 2), fomatJs)
            )
            // fs.writeFileSync(
            //   `${dirPath}/${_.kebabCase(title + '-' + name)}.case.t`,
            //   content
            // )
            // TODO config
            // fs.writeFileSync(
            //   _path.replace(/\.t/g, '测试用例.md'),
            //   Tifa.astdoc(
            //     `${path.basename(_path.replace(/\.t/g, '测试用例'))}`,
            //     ast,
            //     config
            //   )
            // )
          }
        })
        return
      }
      const mainFunc = require(path.join(dirPath, `/${execute || 'main'}.js`))
      if (!mainFunc) {
        errlog(`Not found ${execute || 'main'}.js file in the directory.`)
      }
      const [, err] = await mainFunc(result)
      if (err) {
        errlog(err)
      }
    })
    successlog(`Compile .${suffix || 't'} file is success.`)
  })

commander
  .command('tifa [target]')
  .description('生成测试脚本')
  .option('-c, --config <config path>', '选择配置文件')
  .option('-d, --debug', '输出可供调试的文件')
  .action(async (target = './', { debug = false, ...args }) => {
    await outputLogo('Tifa')
    const tifaList = /\.t/.test(target)
      ? [target]
      : findAllFile(path.join(process.cwd(), target), '.t')
    if (!tifaList.length) {
      warnlog('No compilable file found !')
      return
    }
    tifaList.forEach(async (_path) => {
      const { config } = args
      const conf = config ? require(path.join(process.cwd(), config)) : {}
      const rl = readStream(_path)
      const ast = await Tifa.parser(rl)
      const content = Tifa.generator(ast, { config: conf, isDebug: debug })
      const code = prettier.format(content, fomatJs)
      // fs.writeFileSync(_path.replace(/\.t/g, '.ast.js'))
      // fs.writeFileSync(
      //   _path.replace(/\.t/g, '测试用例.md'),
      //   Tifa.astdoc(
      //     `${path.basename(_path.replace(/\.t/g, '测试用例'))}`,
      //     ast,
      //     config
      //   )
      // )
      fs.writeFileSync(_path.replace(/\.t/g, '.test.js'), code)
      successlog(
        `📐 Compile success. ${path.basename(
          _path.replace(/\.t/g, '.test.js')
        )} is generated.`
      )
    })
  })

// 用于解析命令行参数
commander.parse(process.argv)
