import * as _ from 'lodash'
import { isEmptyline, isCommentline, matchplus, matchCouple } from '../../utils'

const whatType = (line: string) => {
  const opcodeList = [
    'shot',
    'goto',
    'wait',
    'gif',
    'video',
    'capture',
    'scroll'
  ]
  const defineList = ['say', 'var']
  const hash = new Map().set('opcode', opcodeList).set('define', defineList)
  const [data]: string[] = line.trim().split(' ')
  return (type: string): boolean => {
    const list = hash.get(type) || []
    return list.includes(data)
  }
}

const NickHash = () => {
  const hash = new Map()
  return {
    get(el: string) {
      return hash.get(el)
    },
    set(el: string, type: string) {
      return hash.set(el, type)
    }
  }
}
const nickHash = NickHash()

const whatAction = (el: string) => {
  const hash = new Map()
    .set('button', ['click', 'hover'])
    .set('input', ['click', 'hover', 'input'])
    .set('select', ['hover', 'select'])
    .set('label', ['click', 'hover'])
    .set('img', ['click', 'hover'])
    .set('upload', ['click', 'upload'])
  return hash.get(el)
}

const parserOpcode = (line: string) => {
  const [opcode, ...value] = line.trim().split(' ')
  return [opcode, value.join(' ')]
}

const parserDefine = (line: string) => {
  const [define, ...value] = line.trim().split(' ')
  return [define, value.join(' ')]
}

class Next {
  data
  constructor(line: string) {
    this.data = line
  }
  next() {
    let token = ''
    let bit = ''
    let data = _.trimStart(this.data)
    do {
      bit = data.slice(0, 1)
      token += bit
      data = data.slice(1)
    } while (/[a-zA-Z0-9]/.test(bit))
    this.data = data
    return token.trim()
  }
  remain() {
    return this.data
  }
}

const parser = async (rl: string) => {
  const stack = []
  let elementCache = []
  let isParseElement = false
  let lineNo = 0
  let findMode = ''
  for await (const line of rl) {
    lineNo++
    if (isCommentline(line)) {
      // * 处理注释
      continue
    }
    if (line.trim().indexOf('#') === 0) {
      // * 处理注释
      continue
    }
    if (isEmptyline(line)) {
      isParseElement = false
      if (elementCache.length) {
        stack.push({ type: 'find', value: elementCache })
        elementCache = []
      }
      continue
    }
    if (isParseElement) {
      // * 解析元素
      const cache = []
      let _line = line
      do {
        const [, el, other] = matchCouple(_line)('[', ']')
        if (other == null) {
          throw new Error(`元素书写不合法, 请检查第${lineNo}行: ${_line}`)
        }
        const [element, ...value] = el.split(' ')
        const next = new Next(other)
        const token = next.next()
        const nick = token == '=' ? next.next() : ''
        _line = token == '=' ? next.remain() : other
        nickHash.set(nick, element)
        cache.push({
          element,
          value: value ? value.join(' ') : '',
          // TODO attr: attr || null,
          nick
        })
      } while (_line)
      elementCache.push(cache)
      continue
    }
    const isOpcode: boolean = whatType(line)('opcode')
    if (isOpcode) {
      const [opcode, value] = parserOpcode(line)
      stack.push({
        type: 'opcode',
        value: value.replace(/["']/g, '').trim(),
        opcode
      })
      continue
    }
    const isDefine: boolean = whatType(line)('define')
    if (isDefine) {
      const [define, value] = parserDefine(line)
      stack.push({
        type: 'define',
        value,
        define
      })
      continue
    }
    const isFind: null | string[] = matchplus(
      line,
      /^ {0,}find(\([<>!?]\)){0,1}: {0,}$/gm
    )
    if (isFind) {
      // console.log(isFind)
      isParseElement = true
      const find = isFind.slice(0, 1)[0]
      const feature = {
        '(!)': 'unfind',
        '(<)': 'right',
        '(>)': 'left',
        '(?)': ''
      }
      // console.log('find', Object.keys(feature))
      if (Object.keys(feature).includes(find)) {
        const mode = find.match(/(\(.\))/gm).at(0)
        console.log('findMode', findMode)
        findMode = feature[mode]
      }
      continue
    }
    const isExpect: null | string[] = matchplus(line, /^ {0,}.+\?[=].+/)
    if (isExpect) {
      // * 断言
      // * ?= 包含
      const [data] = isExpect
      const [el, expect] = data.split('?=').map(_.trim)
      // const {targetType, el, expect} = whatExpect(data)
      const targetType = nickHash.get(el)
      if (!targetType) {
        throw new Error(
          `You are using undefined element [${el}], may be you forget define it. This error from Expect.`
        )
      }
      stack.push({
        type: 'expect',
        target: el,
        targetType: nickHash.get(el),
        expect: expect
      })
    }
    const isAction: null | string[] = matchplus(line, /^ {0,}.+\-\>.+/)
    if (isAction) {
      const [data] = isAction
      const [el, action] = data.split('->').map(_.trim)
      //   const isOK = whatAction(nickHash.get(el)).includes(action)
      const targetType = nickHash.get(el)
      if (!targetType) {
        throw new Error(
          `You are using undefined element [${el}], may be you forget define it. This error from Action.`
        )
      }
      stack.push({
        type: 'action',
        target: el,
        targetType: nickHash.get(el),
        action: action
      })
    }
  }
  return stack
}

export default parser
