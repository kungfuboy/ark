import parser from './parser'
import generator from './generator'
import astdoc from './astdoc'

export default { parser, generator, astdoc }
/*!!
#### 关于注释

注释使用`//`开头，且必须独占一行

#### 元素

每一个需要被查找的元素使用`[]`包裹，如果需要为这个元素起一个名字，可以在中括号后，紧跟`=`符号赋值。
如：

```
[Type label]=Nick
```

每一个`[]`内部分为两个部分，第一部分是描述组件的类型，第二部分是描述组件的值。根据元素类型的不同会进行不同的查找。

如果在同一个测试用例中，需要使用先前定义过的元素，不需要重新定义，只需要这样表示即可，其后也不允许跟随新的昵称：

```
[=Nick]
```

type 除了支持元素类型外，还支持 xpath

```
[xpath '//*[@id="yDmH0d"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[2]/button/div']
```

@=./config.md

#### 断言

is
等于

has
包含

!!*/
