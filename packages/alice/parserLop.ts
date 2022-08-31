import { matchplus } from '../../utils/index.ts'
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const readStream = (url) =>
  readline.createInterface({
    input: fs.createReadStream(url),
    crlfDelay: Infinity
  })

const toLatex = (data) => {
  return data
    .trim()
    .replace(/\${2} /g, '$$$\n')
    .replace(/ \${2}/g, '\n$$$\n')
    .replace(/\[/g, ' \\left[ ')
    .replace(/\]/g, ' \\right] ')
    .replace(/\{/g, ' \\left\\{ ')
    .replace(/\}/g, ' \\right\\} ')
    .replace(/\|/g, ' \\mid ')
    .replace(/\.{3}/g, ' \\cdot\\cdot\\cdot ')
    .replace(/->/g, ' \\rightarrow ')
    .replace(/#/g, ' \\# ')
    .replace(/=/g, ' = ')
    .replace(/:/g, ' \\colon ')
    .replace(/%/g, '\\%')
    .replace(/~/g, ' \\sim ')
    .replace(/ +/g, ' ')
    .replace(/ /g, ' \\quad ')
}
class Stack {
  constructor() {
    this.stack = []
    this.cache = ''
  }
  pushCache() {
    if (this.cache) {
      this.stack.push(this.cache)
      this.cache = ''
    }
  }
  addCache(data) {
    const isLatex = data.match(/^\${2}.+\${2}$/gm)
    this.cache += isLatex ? this.filerData(data) : data
  }
  filerData(data) {
    return toLatex(data)
  }
  getData() {
    return JSON.parse(JSON.stringify(this.stack))
  }
}

const pathCache = []

async function parseAlice(rl, ph) {
  // let isParseLine = false
  let isParseBlock = false
  // let isCurrLine = false
  let lineIndex = 0
  const stack = new Stack()
  for await (const line of rl) {
    lineIndex++
    const startBlockReg = matchplus(line, /\/\*\!{2}/)
    if (startBlockReg) {
      stack.pushCache()
      isParseBlock = true
      continue
    }
    const endBlockReg = matchplus(line, /\!{2}\*\//)
    if (endBlockReg) {
      stack.pushCache()
      isParseBlock = false
      continue
    }
    const page = matchplus(line, /^\+{3}$/m)
    if (page) {
      stack.addCache(`<div style="page-break-after: always;"></div>` + '\n')
      continue
    }
    const importReg = matchplus(line, /^\@\=\S+$/m, /^@=/m)
    if (importReg) {
      const filePath = path.join(ph, `../${importReg[0]}`)
      const file = fs.readFileSync(filePath, 'utf8')
      stack.addCache(file + '\n')
      continue
    }
    const requireReg = matchplus(line, /^\@\~\S+$/m, /^\@\~/m)
    if (requireReg) {
      const filePath = path.join(ph, `../${requireReg[0]}`)
      if (pathCache.includes(filePath)) {
        throw new Error(
          `行号 ${lineIndex}：引用${filePath}文件会造成无限引用，请管理好引用关系！`
        )
      }
      pathCache.push(filePath)
      const _rl = readStream(filePath)
      const res = await parseAlice(_rl, filePath)
      stack.addCache(res + '\n')
      continue
    }
    if (isParseBlock) {
      stack.addCache(line + '\n')
      continue
    }
    // const startReg = matchplus(line, /\/{2} ={2}/m)
    // if (startReg) {
    //   stack.pushCache()
    //   isParseLine = true
    //   isCurrLine = true
    //   continue
    // }
    // if (!isParseLine) {
    //   continue
    // }
    // const endReg = matchplus(line, /\/{2} ~{2}/m)
    // if (endReg) {
    //   // 解析暂时结束
    //   stack.pushCache()
    //   isParseLine = false
    //   continue
    // }

    // const commentReg = matchplus(line, /\/{2}- .+$/m, /\/{2}-\s/m)
    // if (commentReg) {
    //   cache += commentReg[0] + '\n'
    // }
    // const methodReg = matchplus(line, /\S+\(.+\)(?=\s\{)/g)
    // if (methodReg && isCurrLine) {
    //   isCurrLine = false
    //   const funcName = methodReg[0].replace(/\(.+\)$/gm, '')
    //   console.log(funcName)
    //   cache += `#### ${funcName} 方法\n\n`
    //   const [args] = matchplus(methodReg[0], /(?<=.+\().+(?=\))/g)
    //   cache += `| 参数 | 默认值 |\n`
    //   cache += `| --- | --- |\n`
    //   // 参数可能是一个结构对象
    //   const argObjReg = matchplus(args, /{.+?}/)
    //   if (argObjReg) {
    //     cache += `| 对象参数 | 无 |`
    //     return
    //   }
    //   cache +=
    //     args
    //       .split(',')
    //       .map((it) => {
    //         const arg = it.trim()
    //         if (!arg.indexOf('...')) {
    //           return `| 其他参数 | 无 |`
    //         }
    //         if (~arg.indexOf('=')) {
    //           const [key, value] = arg.split('=')
    //           return `| ${key.trim()} | ${value.trim()} |`
    //         }
    //         return `| ${arg.trim()} | 无 |`
    //       })
    //       .join('\n') + '\n\n'
    // }
  }
  stack.pushCache()
  return stack
    .getData()
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

export default parseAlice
