
# Ark Cookbook

---

[toc]

<div style="page-break-after: always;"></div>

## Ark 介绍

Ark 是一套帮助开发者快速生成代码的工具集，目前主要面向UI自动化测试，内置以下几种工具：

- 数据收集框架 —— mikasa
- 文档生成工具 —— alice
- UI 集成测试语言 —— tifa

每一个工具都是编译型工具，都可以分别在工程中使用，但目前主打的是UI测试领域。

### 安装 Ark

```bash
$ pnpm install arks --global 
# or
$ yarn global add arks
# or
$ npm install -g arks
```

安装成功后即可在全局使用`ark`命令，如：

```bash
$ ark --help
```

### 使用须知

> Ark中的各个工具或小语言，在设计时，首先考虑的是常见的业务需求，在此基础上尽可能覆盖更多场景，但并不能保证无所不包，因而随着业务复杂度增加，遇到小语言无法满足的场景是在所难免的。在这种情形下，可以借助小语言解决大部分场景需求，对于力不能及的部分，只能由人类手动填补，然而请务必将小语言的文件删除，以免因某次误用而覆盖了人类写的代码。

### 文档生成工具 —— Alice

#### 如何使用

```bash
$ ark doc ./xxx.js README
# xxx.js会作为解析的入口文件，README是生成后的文档名称，不需要加后缀。

$ ark doc -a
# 直接输出本文档——《Ark Cookbook》
```
#### 语法规则

##### 解析语法

解析器的解析范围标识如下：

```
/*!! 开头
  ...
  @get ./xx.md
  @link ./xxx.js
!!*/ 结束
```

在解析范围中间，主要支持两种语法，分别是抓取和引用，以下分别介绍：

##### 抓取语法

$$
@get \quad (url)
$$

`url`目前仅支持相对路径，该语法会将路径下的整个文件抓取过来，填充到文档中，适合用于抓取某测试用例作为文档中的 demo 展示。

##### 引用语法

$$
@link \quad (url)
$$

`url`目前仅支持相对路径，该语法会解析某个文件，如果文件中有解析范围，其中又包含引用或抓取语法，则自然会递归解析。这份Ark文档本身就是用该工具不断递归解析各个小文档和文件而生成的。

当在解析过程中遇到`Latex`语法包裹的语句 `$$ ... $$`，则会自动将其中的部分符号转换为Latex语法符号。

### UI 测试小语言

该小语言基于视觉逻辑进行元素定位，描述UI布局和用户行为，使用 playwright 进行测试用例的构建和测试。

待增强的特性：

- [ ] 可以生成用户操作手册
- [ ] 生成操作视频

#### 如何使用

tifa工具贯彻的是，看到什么写什么，一切依据视觉逻辑。由于元素定位依赖的并不是xpath、id等实际元素标识，因而解决了传统UI测试的以下痛点：

- 理想情况下，只需对着UI图甚至仅凭想象写出测试用例。
- 能做到测开并行，不需要等前端做出页面后才能编写测试用例，让测试能够提前介入。
- 即便后续页面有改动，只要视觉上变化不大，用例代码都不需要改动。

另外的优点就是代码简单，且方便复用。

#### 关于注释

注释使用`#`开头，且必须独占一行

#### 元素

描述一个元素的基本语法是：`[Type label]=Nick`
其中Type是元素的类型；label是元素的值，如果为空，可以不写；Nick是给这个元素起的别名，方便在后续引用。

元素有以下几种类型：

- button 按钮
- input 输入框
- select 选择框
- label 文本
- img 图片、图标

每一个需要被查找的元素使用`[]`包裹，如果需要为这个元素起一个名字，可以在中括号后，紧跟`=`符号赋值。
如下面的组合用于描述一个常见的登录界面：
```
[input] = username
[input] = password
[button 'Login'] = login
```

除了支持元素类型外，还支持 xpath，为了应对万一元素定位不准时，也能够写出元素定位。

```
[button 'xpath://*[@id="yDmH0d"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[2]/button/div']
```

#### 操作

选中了元素后，就应该开始执行操作，操作只有一个操作符 `->`, 我们要描述点击的动作，语法如下：
```
username -> 'John'      # 在别名为 username 元素中输入 John
password -> '123456'    # 在别名为 password 元素中输入 123456
login -> click          # 点击别名为 login 的元素
```

不用的元素类型会对应不同的动作，它基本符合人类的交互习惯，例如我们不会在button类型的元素上进行输入的操作，而应该是 click、hover 这样的操作。

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

#### 如何编译

```bash
$ ark tifa ./e2e.t
```

#### 如何运行

编译后即可批量运行，首次运行前需要你在工程中事先安装好 playwright 以及 @playwright/test，并在`package.json`的 `scripts` 字段中配置好命令。如：

```json
{
  "scripts": {
    "test": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "1.25.0",
    "playwright": "1.25.0"
  }
}
```

运行：
```bash
$ pnpm test
# or
$ yarn test
# or
$ npm run test
```

### 数据收集工具
该工具按照一定的书写规则，将一个文件内容拆分成多个文件。

大致规则如下:
=== 模块名

--- 文件名

#### 复用片段

::: name {

}

--- name

