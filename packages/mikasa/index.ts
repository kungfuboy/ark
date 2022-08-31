const _ = require('lodash')
import { matchplus, getBeforeSpace } from '../utils'

const handleCase = (data) =>
  data.map(({ block, cases }) => ({
    block,
    cases: cases.reduce(
      (total, { title, content }) => [
        ...total,
        ...title.split('&').map((it) => ({ title: it.trim(), content }))
      ],
      []
    )
  }))

const parseMikasa = async (rl) => {
  //   let lineIndex = 0
  let cache: any = {}
  let funcCache: any = {}
  const funcHash = new Map()
  const stack: any[] = []
  for await (let line of rl) {
    // lineIndex++
    // console.log('=>', line)
    // if (_.isEmpty(line.trim())) {
    //   continue
    // }
    // ?? 作为注释标识
    const isCommentLine = matchplus(line, /^ {0,}\?\?.+/m)
    if (isCommentLine) {
      continue
    }
    if (!_.isEmpty(funcCache)) {
      if (line.trim() == '}') {
        const { name, template } = funcCache
        funcHash.set(name, { template })
        funcCache = {}
        continue
      }
      funcCache.template += line + '\n'
      continue
    }
    const func = matchplus(line, /^\:{3}.+\{/m, /[\:\{]/g)
    if (func) {
      const name = func[0].trim()
      funcCache = {
        name,
        template: ''
      }
      continue
    }
    const block = matchplus(line, /^ {0,}\={3}.+$/m, /^ {0,}\={3}/m)
    if (block) {
      const title = block[0].trim()
      !_.isEmpty(cache) && stack.push(cache)
      cache = { block: { title }, cases: [] }
      continue
    }
    const caseFunc = matchplus(line, /^ {0,}\-{3}.+$/m, /\-{3}/m)
    if (caseFunc) {
      const title = caseFunc[0].trim()
      if (
        title.includes('&') ||
        !funcHash.has(title.replace(/\:.+/g, '').trim())
      ) {
        // 不是方法块，因而作为代码块使用
        cache.cases.push({
          title,
          content: ''
        })
        continue
      }
      //* 方法块引用
      const beforeSpaceLen = getBeforeSpace(caseFunc[0])
      const [name, ...args] = caseFunc[0].split(':')
      let { template } = funcHash.get(name.trim())
      args.forEach((item, index) => {
        template =
          _.repeat(' ', beforeSpaceLen) +
          _.replace(template, `{$${index + 1}}`, item.trim()).replace(
            /\n/g,
            '\n' + _.repeat(' ', beforeSpaceLen)
          )
      })
      line = template
    }
    if (_.isEmpty(cache.cases)) {
      // 没有实现声明区块，所以忽略
      continue
    }

    // 剩下的作为内容补充进去
    const [data] = cache.cases.splice(-1)
    // 这里最好不要用 trim()， 以免破坏小语言的格式
    data.content += line.slice(-1) === '\n' ? line : line + '\n'
    cache.cases.push(data)
  }
  !_.isEmpty(cache) && stack.push(cache)
  return handleCase(stack)
}

export default parseMikasa
