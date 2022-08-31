const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const packageJson = require('./package.json')

const formatJs = (code) =>
  prettier.format(code, {
    semi: false,
    singleQuote: true,
    trailingComma: 'none',
    parser: 'babel'
  })

const rollupList = [
  { name: 'mikasa', format: 'cjs' },
  { name: 'tifa', format: 'cjs' }
]
const ignorePackage = [
  'lodash/fp',
  'fs',
  'readline',
  'js-md5',
  'colors/safe',
  'uid'
]

const rollupImport = `
import { terser } from 'rollup-plugin-terser'
import esbuild from 'rollup-plugin-esbuild'
`

const rollupConfig = ({ name, format }) => `
{
  input: 'packages/${name}/src/index.ts',
  output: {
    format: '${format}',
    file: 'dist/${name}.js',
    sourcemap: true,
    exports: 'default'
  },
  // plugins: [esbuild({ target: 'esnext' }), terser()],
  plugins: [esbuild({ target: 'esnext' })],
  external: ${JSON.stringify(ignorePackage)}
}
`

const rollupTemplate = (data) => `
${rollupImport}

export default [
  ${rollupConfig(data)}
]
`

rollupList.forEach(({ name, format }) => {
  const code = formatJs(rollupTemplate({ name, format }))
  fs.writeFileSync(`./config/rollup.${name}.config.js`, code)
})

const rollupConfigJs = () => `
${rollupImport}

export default [
  ${rollupList.map((it) => rollupConfig(it)).join(',')}
]
`
fs.writeFileSync('./config/rollup.config.js', formatJs(rollupConfigJs()))

//* 生成 nodemon.json 文件
const nodemonConfig = {
  watch: ['*/src/*', './t/*', '/index.js'],
  ext: 'js,taw,mid,fee,lop,tea,mikasa,levi,ts,t',
  exec: 'ark test ./packages/tifa/t/opcode.t'
}
fs.writeFileSync(
  './config/nodemon.json',
  JSON.stringify(nodemonConfig, null, 2)
)

//* 生成package.json 文件
rollupList.forEach(({ name }) => {
  packageJson.scripts[
    `dev:${name}`
  ] = `rollup --config config/rollup.${name}.config.js -w`
})
packageJson.scripts['build'] = 'rollup --config config/rollup.config.js'
packageJson.scripts['debug'] = 'nodemon --config config/nodemon.json'

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2))
