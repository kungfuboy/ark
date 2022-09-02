import parser from './parser'
import generator from './generator'
import astdoc from './astdoc'

export default { parser, generator, astdoc }

/*!!
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

@get ./config.md

!!*/
