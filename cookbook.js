/*!!

# Ark Cookbook

---

[toc]

+++

## Ark 介绍

Ark 是一套帮助开发者快速生成代码的工具集，目前主要面向UI自动化测试，内置以下几种工具：

- 数据收集框架 —— mikasa
- 文档生成工具 —— alice
- UI 集成测试语言 —— tifa

每一个工具都是编译型工具，都可以分别在工程中使用，但目前主打的是UI测试领域。

### 安装 Ark

```bash
$ pnpm install ark-pkg --global 
# or
$ yarn global add ark-pkg
# or
$ npm install -g ark-pkg
```

安装成功后即可在全局使用`ark`命令，如：

```bash
$ ark --help
```

### 使用须知

> Ark中的各个工具或小语言，在设计时，首先考虑的是常见的业务需求，在此基础上尽可能覆盖更多场景，但并不能保证无所不包，因而随着业务复杂度增加，遇到小语言无法满足的场景是在所难免的。在这种情形下，可以借助小语言解决大部分场景需求，对于力不能及的部分，只能由人类手动填补，然而请务必将小语言的文件删除，以免因某次误用而覆盖了人类写的代码。

### 文档生成工具 —— Alice

@link ./packages/alice/src/index.ts

### UI 测试小语言

该小语言基于视觉逻辑进行元素定位，描述UI布局和用户行为，使用 playwright 进行测试用例的构建和测试。

待增强的特性：

- [ ] 可以生成用户操作手册
- [ ] 生成操作视频

#### 如何使用

@link ./packages/tifa/src/index.ts

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

@link ./packages/mikasa/src/index.ts

!!*/
