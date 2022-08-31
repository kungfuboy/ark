const astdoc = (title = '', stack = []) => {
  const createOpcode = ({ value, opcode }) => {
    if (opcode == 'goto') {
      return `输入网址 ${value} 进入目标页面，等待页面加载完成`
    }
    return ''
  }
  const createAction = ({ targetType, target, action }) => {
    if (targetType === 'input') {
      return `在输入框中输入值：${action}`
    }
    if (targetType === 'select') {
      return `在选择框中选择值为 【${action}】 的选项`
    }
    if (targetType === 'button' && action === 'click') {
      return `点击按钮`
    }
    return ''
  }
  return `
    ## ${title}
  
    ${stack
      .map((it) => {
        if (it.type === 'opcode') {
          return createOpcode(it)
        }
        if (it.type === 'find') {
          return '视觉确定相关元素'
        }
        if (it.type === 'action') {
          return `执行以下操作：
          ${createAction(it)}
          `
        }
        console.log(it)
      })
      .join('\n')}
    `
}

export default astdoc
