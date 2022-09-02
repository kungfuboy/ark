##### 交互指令

| 指令   | 描述     | 适用元素类型       | Demo |
| ------ | -------- | ------------------ | ---- |
| click  | 点击     | 文本、按钮、输入框 |      |
| 'text' | 输入     | 输入框             |      |
| hover  | 鼠标悬浮 | 任何元素           |      |

##### 特殊指令

| 指令    | 功能描述     | Demo                   |
| ------- | ------------ | ---------------------- |
| goto    | 用于跳转     | goto http://google.com |
| wait    | 等待时间     | wait / wait 1s         |
| shot    | 高亮元素     | shot Nick              |
| capture | 截图         | capture                |
| var     | 声明常量     | var Jacky = $username  |
| find    | 准备查找元素 |                        |

##### 配置文件

| 字段       | 类型    | 功能                               | 默认值         |
| ---------- | ------- | ---------------------------------- | -------------- |
| windowSize | Array   | 指定浏览器尺寸                     | [1280, 960]    |
| use        | Array   | 指定浏览器                         | ['chromeminu'] |
| headless   | Boolean | 用于指定运行时是否以无 UI 模式运行 | false          |
| captureUrl | String  | 用于指定截图保存的位置             | ./img          |
| videoUrl   | String  | 用于指定视频输出的位置             | ./video        |
| gifUrl     | String  | 用于指定视频输出的位置             | ./gif          |
| docUrl     | String  | 用于指定是否生成操作文档           | ./doc          |
