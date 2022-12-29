import * as _ from 'lodash'
import qconfig from './config.js'
import {
  headerCode,
  beforeTestCode,
  afterTestCode,
  funcCode
} from './codeFrame'
import { random } from '../../utils'

type StackItemType = {
  type: string
  value: string
  opcode?: string
}

let idHash = new Map()
const setId = (nick, random) => {
  idHash.set(nick, random)
}

const generateFind = ({ value }, config: any) => {
  const findCode = ({ element, value = '', condition = [] }) => {
    if (value?.trim().indexOf('xpath:') === 1) {
      // * 'xpath:xxx' indexOf时需要将前面的引号算在内
      return `findXPathElement(${value.replace('xpath:', '')})`
    }
    if (element === 'input') {
      return `findInputElement(layer, ${value}).filter(it => filterByCondition(it, ${JSON.stringify(
        condition
      )})).filter(it => filterYaxis(it, yBaseLine))`
    }
    if (element === 'button') {
      return `findButtonElement(layer, ${value}).filter(it => filterByCondition(it, ${JSON.stringify(
        condition
      )})).filter(it => filterYaxis(it, yBaseLine))`
    }
    if (element === 'label') {
      return `findTextElement(layer, ${value}).filter(it => filterByCondition(it, ${JSON.stringify(
        condition
      )})).filter(it => filterYaxis(it, yBaseLine))`
    }
    if (element === 'select') {
      return `findSelectElement(layer, ${value}).filter(it => filterByCondition(it, ${JSON.stringify(
        condition
      )})).filter(it => filterYaxis(it, yBaseLine))`
    }
    if (element === 'img') {
      return `findImgElement(layer, ${JSON.stringify(
        config?.elements?.img
      )}).filter(it => filterByCondition(it, ${JSON.stringify(
        condition
      )})).filter(it => filterYaxis(it, yBaseLine))`
    }
    return `findTextElement(layer, ${value}).filter(it => filterByCondition(it, ${JSON.stringify(
      condition
    )}))`
  }
  const defindCode = ({ nick }, index, i) => {
    if (!nick) {
      return ''
    }
    const _random = random()
    setId(nick, _random)
    return `const ${nick} = finalElementMatrix[${index}][${i}]
      if(!${nick}) {
        throw new Error("Can't find the element: ${nick}")
      }
      ${nick}.setAttribute('data-e2e-id', '${_random}')
      highlightElement(${nick})
      `
  }
  /**
   * 矩阵求解
   * [
   *    [ [], [] ],
   *    [ [], [3], [] ],
   *    [ [4], [5, 6]]
   * ]
   * => 2
   */
  return `
  // * 筛选元素开始
    const eleLayerList = getElbyZIndex()
    let yBaseLine = yline
    // * 定义
    const bigMatrix = eleLayerList.map(layer => [${value.map(
      (it: any) => '[' + it.map(findCode) + ']'
    )}])

    console.log('before filter bigMatrix', bigMatrix)
    
    // * 预处理 - map 清洗 & find 验证是否有解
    const elementMatrix = 
    bigMatrix.filter(it => it.flat(1).every(item => item.length > 0))
    .map(filterByX)
    .map(filterByY)
    .map(filterBySmartY)
    .find(it => it.flat(1).every(item => item.length > 0))

    if (elementMatrix == null) {
      throw new Error('元素定位无解')
    }
    console.log('filter elementMatrix', elementMatrix)

    // * 初始化权重矩阵，并根据元素矩阵进行计算，返回计算后的一个权重矩阵
    const scoreMatrix = findElementLocation(elementMatrix)

    console.log('filter scoreMatrix', JSON.stringify(scoreMatrix))

    const scoreMaxMatrix = scoreMatrix.map((it) => it.map(item => {
        const max = Math.max(...item)
        return item.findIndex((x) => x === max)
      }))

    console.log('scoreMaxMatrix', JSON.stringify(scoreMaxMatrix))
    
    // * 根据权重矩阵的解，得到目标元素的矩阵
    const finalElementMatrix = elementMatrix.map((it, index) => it.map((item, i) => {
      const scoreIndex = scoreMaxMatrix[index][i]
      return item[scoreIndex]
    }))

    console.log('finalElementMatrix', finalElementMatrix)

    // * 基于权重矩阵，在元素矩阵中找到目标元素并做标记
    ${value
      .map((it: any, index: number) =>
        it.map((item: any, i: number) => defindCode(item, index, i)).join('\n')
      )
      .join('\n')}

    // * 筛选完毕
  `
}

const generateOpcode = ({ opcode = null, value }, config) => {
  if (opcode === 'shot') {
    // * 高亮元素
    return `
      highlightElement(${value})
    `
  }
  if (opcode === 'goto') {
    // if (!['http://', 'https://'].includes(value)) {
    //   throw new Error(`Cannot navigate to invalid URL: ${value}`)
    // }
    return `
        // * 跳转至该地址: ${value}
        await page.goto('${value}', { waitUntil: 'networkidle0' })
        `
  }
  if (opcode === 'capture') {
    return `
        // * 截图并保存至 ${config.captureUrl}
        await page.screenshot({ path: '${config.captureUrl}/${
      value || '截图' + Date.now()
    }.png' })`
  }
  if (opcode === 'wait') {
    return `
        // * 等待 ${value || 600} 毫秒
        await wait(${value || 600})`
  }
  throw new Error(`你传入了一个不可识别的指令 [${opcode}]`)
}

const generateDefine = ({ define = null, value }) => {
  if (define === 'var') {
    return `const ${value}`
  }
  if (define === 'say') {
    return `console.log('${value}')`
  }
}

const generateExpect = ({ targetType, target, expect }: any) => {
  const elRandom = random()
  if (targetType === 'button') {
    return `
    var e${elRandom}Text = await page.evaluate(
      () => {
        const el = document.querySelector("[data-e2e-id='${idHash.get(
          target
        )}']")
        if (el.tagName === 'INPUT') {
          return el.value
        }
        return el.innerText
    })
    expect(e${elRandom}Text).toBe(${expect})`
  }
}

const generateAction = ({ targetType, target, action }: any) => {
  if (targetType === 'select') {
    const optionRandom = random()
    if (action === 'hover') {
      return `
      {
        const box = await ${target}.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await wait(200)
      }
      `
    }
    // action select
    // ! 重写 寻找 A元素周围的B元素
    return `
    // * click select area show the options
    {
      const box = await ${target}.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await wait(100)
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await wait(200)
    }
    const s${optionRandom} = await page.evaluateHandle(async () => {
      ${funcCode}
      const select = document.querySelector("[data-e2e-id='${idHash.get(
        target
      )}']")
      const option = diffAround(select, ${action})
      console.log('option', option)
      highlightElement(option)
      return option
    })
    await s${optionRandom}.hover();
    await s${optionRandom}.click();
    await wait(200)
    `
  }
  if (targetType === 'input') {
    return `
    await ${target}.hover()
    await ${target}.focus()
    await ${target}.fill(${action})`
  }
  if (targetType === 'button') {
    return `await ${target}.click()
    await wait(200)`
  }
  if (targetType === 'img') {
    if (action === 'click') {
      return `await ${target}.click()
      await wait(200)`
    }
  }
  if (targetType === 'label') {
    if (action === 'click') {
      return `await ${target}.click()
      await wait(200)`
    }
    if (action === 'hover') {
      return `{
        const box = await ${target}.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await wait(200)
      }`
    }
  }
  return ''
}

const getElement = (data: any) =>
  data.value
    .flat(Infinity)
    .filter((it: any) => it.nick)
    .map(
      (it: any) =>
        `var ${
          it.nick
        } = await page.evaluateHandle(() => document.querySelector("[data-e2e-id='${idHash.get(
          it.nick
        )}']"))`
    )
    .join('\n')

const getElements = () =>
  Array.from(idHash)
    .map(
      ([nick, id]: any[]) =>
        `var ${nick} = await page.evaluateHandle(() => document.querySelector("[data-e2e-id='${id}']"))`
    )
    .join('\n')

const generator = (
  stack: StackItemType[],
  { config = {}, isDebug = false }
) => {
  const _config = Object.assign(qconfig, config)
  const code = stack
    .map(({ type, ...it }: any) => {
      if (type === 'opcode') {
        return generateOpcode(it, _config)
      }
      if (type === 'define') {
        return generateDefine(it)
      }
      if (type === 'action') {
        return generateAction(it)
      }
      if (type === 'expect') {
        return generateExpect(it)
      }
      if (type === 'find') {
        return `
        await page.evaluateHandle(async () => {
          const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))
          await wait(500)
          ${funcCode}
          ${generateFind(it, _config)}
          return null
        })
        ${getElements()}
        `
      }
      return ''
    })
    .join('\n')
  if (isDebug) {
    return `
/*
 * DO NOT EDIT!
 * This file was automatically generated by ark.
 */
const { chromium } = require('playwright')
;(async () => {
  ${beforeTestCode(_config)}
  ${code}
  // * 测试完成，关闭浏览器
  console.log('Done');
  ${afterTestCode}
})()
    `
  }

  return `
/*
 * DO NOT EDIT!
 * This file was automatically generated by ark.
 */
    ${headerCode}
    test('test', async () => {
      ${beforeTestCode(_config)}
        ${code}
        // * 测试完成，关闭浏览器
        ${afterTestCode}
    })
      `
}

export default generator
