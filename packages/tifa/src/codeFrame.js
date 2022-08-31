const findXPathElement = (path) => {
  if (!path) {
    throw new Error('No XPath')
  }
  return [document.querySelector(path)]
}

const findSelectElement = (el = null, label = '') => {
  const eleLayer = el || document
  const select = Array.from(eleLayer.querySelectorAll('select'))
  const input = Array.from(eleLayer.querySelectorAll('input'))
    .filter((it) => it.type !== 'hidden')
    .filter((it) => it.type !== 'submit')
    .filter((it) => it.type !== 'radio')
    .filter((it) => it.value.indexOf(label.trim()) >= 0)
  const other = Array.from(eleLayer.getElementsByTagName('*'))
    .filter((it) => it.children.length === 0 && it.innerText)
    .filter((it) => it.textContent.trim() === label.trim())

  return select.concat(input).concat(other)
}

const findButtonElement = (el = null, label = '') => {
  const eleLayer = el || document
  const btn = Array.from(eleLayer.querySelectorAll('button')).filter((it) =>
    it.innerText.includes(label)
  )
  const input = Array.from(eleLayer.querySelectorAll('input'))
    .filter((it) => it.type !== 'hidden')
    .filter((it) => it.type === 'submit')
    .filter((it) => it.value.includes(label))
  return btn.concat(input)
}

const findInputElement = (el = null, value = '') => {
  const eleLayer = el || document
  return Array.from(eleLayer.querySelectorAll('input'))
    .filter((it) => !['radio', 'hidden', 'submit'].includes(it.type))
    .filter((it) => it.value === value || it.placeholder === value)
}

const findTextElement = (el = null, label = null) => {
  const eleLayer = el || document
  if (!label) {
    throw new Error("Function findtextElement has' t no args.")
  }
  return Array.from(eleLayer.getElementsByTagName('*'))
    .filter((it) => it.type !== 'hidden')
    .filter((it) => it.style.display !== 'none')
    .filter((it) => it.children.length === 0 && it.innerText)
    .filter((it) => it.innerText.trim() === label.trim())
}

const findImgElement = (el = null) => {
  const eleLayer = el || document
  const svg = Array.from(eleLayer.getElementsByTagName('svg'))
  const img = Array.from(eleLayer.getElementsByTagName('img'))
  const iconpark = Array.from(eleLayer.getElementsByTagName('iconpark-icon'))
  // console.log(svg.concat(img))
  return svg.concat(img).concat(iconpark)
}

const highlightElement = (el, { color } = {}) => {
  const { left, width, height, top } = el.getBoundingClientRect()
  const div = document.createElement('div')
  div.class = 'ark-tifa-height-light'
  div.style.position = 'fixed'
  div.style.left = left + 'px'
  div.style.top = top - 3 + 'px'
  div.style.height = height + 'px'
  div.style.width = width + 'px'
  div.style.border = `3px solid ${color || '#96514d'}`
  div.style.zIndex = 99999
  div.style.pointerEvents = 'none'
  document.body.appendChild(div)
  setTimeout(() => {
    document.body.removeChild(div)
  }, 300)
}

const getElementCoor = (el, type) => {
  if (!el) {
    throw new Error('element is undefined or null.')
  }
  const { left, right, top, bottom } = el.getBoundingClientRect()
  const typeObject = {
    left,
    right,
    top,
    bottom,
    center: left + (right - left),
    middle: top + (bottom - top)
  }
  return typeObject[type]
}

const distanceX = (a, b) => {
  return b.getBoundingClientRect().left - a.getBoundingClientRect().right
}

const distanceY = (a, b) => {
  return Math.abs(getElementCoor(a, 'middle') - getElementCoor(b, 'middle'))
}

const filterYaxis = (el, line) => {
  // * line is number
  // if (el.tagName === 'LABEL') {
  //   console.log(el)
  //   const { top, width, height } = el.getBoundingClientRect()
  //   console.log(top, width, height, line)
  // }
  const { top, width, height } = el.getBoundingClientRect()
  if (width === 0 || height === 0) {
    return false
  }
  return top > line
}

const countYline = (list) => {
  const len = list.length
  return (
    list
      .map((it) => {
        const { top, bottom } = it.getBoundingClientRect()
        return top + (bottom - top)
      })
      .reduce((a, b) => a + b) / len
  )
}

const diffAround = (el, label) => {
  const list = Array.from(document.getElementsByTagName('*'))
    .filter((it) => it.type !== 'hidden')
    .filter((it) => it.style.display !== 'none')
    .filter((it) => it.children.length === 0 && it.innerText)
    .filter((it) => it.innerText.trim() === label.trim())
  if (list.length === 1) {
    return list[0]
  }
  const score = Array(list.length).fill(0)
  let xCache = 0,
    yCache = 0
  const targetX = getElementCoor(el, 'center')
  const targetY = getElementCoor(el, 'middle')
  list.forEach((it, i) => {
    const x = Math.abs(targetX - getElementCoor(it, 'center'))
    const y = Math.abs(targetY - getElementCoor(it, 'middle'))
    if (xCache === 0) {
      xCache = x
      score[i] += i + 1
    }
    if (x < xCache) {
      xCache = x
      score[i] += i + 1
    }
    if (yCache === 0) {
      yCache = y
      score[i] += i + 1
    }
    if (y < yCache) {
      yCache = y
      score[i] += i + 1
    }
  })
  const findTarget = (list2) => list2.indexOf(Math.max(...list2))
  return list[findTarget(score)]
}

const getElbyZIndex = () => {
  return [
    ...Array.from(document.getElementsByTagName('*'))
      .filter((it) => getZindex(it) !== 'auto')
      .filter((it) => !it.className.includes('ark-tifa-height-light'))
      .filter((it) => it.children.length > 0 || it.innerText.trim())
      .sort((a, b) => Number(getZindex(b)) - Number(getZindex(a))),
    document.body
  ]
}

/**
 *
 * 竖线
 * 返回B粒度结构的数据
 * [target] || 最边缘的元素不需要进行剔除
 *
 */
const filterByX = (matrixList) =>
  matrixList
    .map((it) =>
      it.map((item) =>
        item.sort(
          (a, b) => getElementCoor(a, 'right') - getElementCoor(b, 'right')
        )
      )
    )
    .map((it) => {
      let rX = 0
      return it
        .reverse()
        .map((item, index) => {
          const result =
            item.length === 1 || index === 0
              ? item
              : item.filter((el) => getElementCoor(el, 'right') < rX)
          rX = getElementCoor(result.at(-1), 'right')
          return result
        })
        .reverse()
    })
    .map((it) =>
      it.map((item) =>
        item.sort(
          (a, b) => getElementCoor(a, 'left') - getElementCoor(b, 'left')
        )
      )
    )
    .map((it) => {
      let lX = 0
      return it.map((item, index) => {
        const result =
          item.length === 1 || index === 0
            ? item
            : item.filter((el) => getElementCoor(el, 'left') > lX)
        lX = getElementCoor(result[0], 'left')
        return result
      })
    })

const filterByY = (matrixList) => {
  /**
   * 本函数主要做两件事：
   * 1. 初始化基线，逐行获取整行元素的最高点，从上至下剔除
   * 2. 重新初始化基线，逐行获取整行元素的最低点，从下至上剔除
   */
  if (matrixList.length == 1) {
    // * 仅有一行元素，不需要做纵向清洗
    return matrixList
  }

  const flatMapSortAt = (list, type, sortFunc) =>
    list
      .flat(Infinity)
      .map((item) => getElementCoor(item, type))
      .sort(sortFunc)
      .at()

  let tY = 0
  const cache = matrixList
    .map((it, index) => {
      const result =
        index === 0
          ? it
          : it.map((item) =>
              item.filter((el) => getElementCoor(el, 'top') > tY)
            )
      tY = flatMapSortAt(it, 'top', (a, b) => a - b)
      return result
    })
    .reverse()

  ty = flatMapSortAt(cache.at(), 'bottom', (a, b) => b - a)

  return cache
    .map((it, index) => {
      const result =
        index === 0
          ? it
          : it.map((item) =>
              item.filter((el) => getElementCoor(el, 'bottom') < tY)
            )
      tY = flatMapSortAt(it, 'bottom', (a, b) => b - a)
      return result
    })
    .reverse()
}

/**
 * 如果同一行中，某个元素有唯一解，则以此为基准，剔除高于或低于它的其他元素
 */
const filterBySmartY = (matrixList) =>
  matrixList.map((it) => {
    const { minH, maxH } = it
      .filter((item) => item.length === 1)
      .reduce(
        ({ minH, maxH }, item) => {
          const _minH = getElementCoor(item.at(), 'top')
          const _maxH = getElementCoor(item.at(), 'bottom')
          return {
            minH: minH == null || _minH < minH ? _minH : minH,
            maxH: maxH == null || _maxH > maxH ? _maxH : maxH
          }
        },
        { minH: null, maxH: null }
      )
    if (minH === null || maxH == null) {
      // * 同一行的元素中没有唯一解的元素
      return it
    }
    return it.map((item) =>
      item.length === 1
        ? item
        : item
            .filter((el) => getElementCoor(el, 'top') >= minH - 5)
            .filter((el) => getElementCoor(el, 'bottom') <= maxH + 5)
    )
  })

// * 核心查询函数
const diffXY = (list, yline, data) => {
  console.log('diffXY init =>', list)
  if (list.length === 0) {
    throw new Error("Has't any element in args")
  }
  // console.log(list)
  const score = list.map((it) => Array(it.length).fill(0))
  if (list.length === 1) {
    if (list[0].length === 0) {
      // console.log(list)
      console.log('diffXY', data)
      throw new Error('DiffXY get empty array.')
    }
    if (list[0].length === 1) {
      return [0]
    }
  }

  // * 权重从低到高排序
  const scoreList = ['DOM', 'Yline', 'Y', 'X']
  scoreList.forEach((itm, itIndex) => {
    let scoreUnit = itIndex + 1
    let index = 0
    if (itm === 'Yline') {
      // * 贴近上一条 yline 线的分数高
      let scoreCache = 1
      let distanceCache = 0
      list.forEach((item, index) => {
        item.forEach((it, i) => {
          // ! 此处用 getElementCoor 函数获取top会得到 NaN
          const distance = it.getBoundingClientRect().top - yline
          if (distance > 0) {
            if (distanceCache === 0) {
              // * 如果 distanceCache 还没有值，则初始化
              distanceCache = distance
            }
            if (distance <= distanceCache) {
              distanceCache = distance
              score[index][i] += scoreCache
              scoreCache++
            }
          }
        })
      })
    }
    if (itm === 'Y') {
      while (index < list.length - 1) {
        // * Y轴比较
        const [aList, bList] = list.slice(index, index + 2)
        let distanceCache = 0
        aList.forEach((left, i) => {
          let scoreCache = 1
          bList.forEach((right, j) => {
            const distance = distanceY(left, right)
            if (distance > 0) {
              if (distanceCache === 0) {
                // * 如果 distanceCache 还没有值，则初始化
                distanceCache = distance
              }
              // * 此处必须要小于等于
              if (distance <= distanceCache) {
                distanceCache = distance
                score[index][i] += scoreCache
                score[index + 1][j] += scoreCache
                scoreCache += 1
              }
            }
          })
        })
        index++
      }
    }
    if (itm === 'X') {
      while (index < list.length - 1) {
        // * X轴比较
        const [aList, bList] = list.slice(index, index + 2)
        let distanceCache = 0
        let scoreCache = 1
        aList.forEach((left, i) => {
          bList.forEach((right, j) => {
            const distance = distanceX(left, right)
            if (distance > 0) {
              if (distanceCache === 0) {
                // * 如果 distanceCache 还没有值，则初始化
                distanceCache = distance
              }
              // * 此处必须要小于等于
              if (distance <= distanceCache) {
                distanceCache = distance
                score[index][i] += scoreCache * scoreUnit
                score[index + 1][j] += scoreCache * scoreUnit
                scoreCache += 1
              }
            }
          })
        })
        index++
      }
    }
  })
  console.log(JSON.stringify(score))
  // * 找出权重最高的索引
  const findTarget = (list) => list.indexOf(Math.max(...list))
  return score.map(findTarget)
}

const findElementLocation = (matrix) => {
  /**
   * 初始化权重矩阵
   */
  // * 初始化权重矩阵
  const scoreMatrix = matrix.map((it) =>
    it.map((item) => Array(item.length).fill(0))
  )

  // * 权重从低到高排序
  // console.log('权重矩阵', JSON.stringify(scoreMatrix, null, 2))
  matrix.forEach((it, index) => {
    // console.log('it => ', it)
    if (it.length === 1) {
      scoreMatrix[index][0] = [100]
    }
    it.forEach((_, rowIndex) => {
      // * New row
      const [leftElList, rightElList] = it.slice(rowIndex, rowIndex + 2)
      let distanceCache = 0
      let scoreCache = 1
      const scoreUnit = rowIndex + 1
      leftElList.forEach((leftEl, i) => {
        rightElList?.forEach((rightEl, j) => {
          // console.log('leftEl rightEl', leftEl, rightEl)
          // * 求得左右两元素之间的距离
          const distance = distanceX(leftEl, rightEl)
          if (distance > 0) {
            if (distanceCache === 0) {
              distanceCache = distance
            }
            // * 这个判断不等式必须是<，而不能是<=, 否则在处理如下布局时会有问题
            // * [[a, b], [a, b], [b, c]]
            // * 最终得解应该是 abc，如果用<=，则可能得解 bbc
            if (distance < distanceCache) {
              scoreMatrix[index][rowIndex][i] += scoreCache * scoreUnit
              scoreMatrix[index][rowIndex + 1][j] += scoreCache * scoreUnit
              scoreCache += 1
            }
          }
        })
      })
    })
  })
  return scoreMatrix
}

export const headerCode = `
  const { chromium } = require('playwright')
  const { test, expect } = require('@playwright/test');
  `

// * 一些初始化的属性
export const beforeTestCode = (config) => `
  const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  
  const browser = await ${config.use[0]}.launch({
    headless: ${config.headless},
    devtools: ${config.devtools}
  })
  const context = await browser.newContext({
    viewport: {
      width: ${config.windowSize[0]}, 
      height: ${config.windowSize[1]}, 
    },${
      config.video
        ? 'recordVideo:{ dir: "' +
          config.videoUrl +
          '", size: { width: ' +
          config.windowSize[0] +
          ', height: ' +
          config.windowSize[1] +
          '} }'
        : ''
    }})
  // * 打开新标签页
  const page = await context.newPage()
  `

export const afterTestCode = `
   await context.close()
   await browser.close()
  `

export const funcCode = `
  let yline = 0
  
  const getZindex = (el) => window.getComputedStyle(el).getPropertyValue('z-index')
  const getElbyZIndex = ${getElbyZIndex.toString()}
  const findXPathElement = ${findXPathElement.toString()}
  const findSelectElement = ${findSelectElement.toString()}
  const findButtonElement = ${findButtonElement.toString()}
  const findInputElement = ${findInputElement.toString()}
  const findTextElement = ${findTextElement.toString()}
  const findImgElement = ${findImgElement.toString()}
  
  const highlightElement = ${highlightElement.toString()}
  
  const getElementCoor = ${getElementCoor.toString()}
  const distanceX = ${distanceX.toString()}
  const distanceY = ${distanceY.toString()}
  const filterYaxis = ${filterYaxis.toString()}
  const countYline = ${countYline.toString()}
  const filterByX = ${filterByX.toString()}
  const filterByY = ${filterByY.toString()}
  const filterBySmartY = ${filterBySmartY.toString()}
  
  const findElementLocation = ${findElementLocation.toString()}
  const diffAround = ${diffAround.toString()}
  `
