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

#### 指令

指令用于描述用户的动作，通常是点击、输入、选择、上传一类的操作。

语法是：动作在前，变量在后

```
// 点击
click -> Nick

// 输入
'13788909989' -> inputNick

// 鼠标悬浮
hover -> Nick

// 滚动
scroll up 100px
scroll down 100px

//声明变量
var $username = Jacky

found:
指定开始标记元素

{text:5-10}
{}用于表示随机生成字符串或数字，支持 text（文本）、number (数字)、date、time、date-time、sentence（句子）
```

根据元素的不同，指令的具体动作会有所不同。

#### 特殊指令

###### goto

用于跳转

###### desc

```
>> [S]/[A]描述...
```

用于添加描述

###### wait

用于指定等待时间或网络状态

###### shot

用于指定高亮元素：shot Nick

###### gif

gif start
gif end
录制 gif 动画

###### video

video start
video end
录制视频

###### capture

截图

#### 内置变量

$url

#### 配置文件

windowSize: [1280, 960]
指定浏览器尺寸

use: Array
用于指定浏览器，默认 chromeminu

headless: Boolean
用于指定是否无 UI，默认为 false

captureUrl
用于指定截图保存的位置

videoUrl
用于指定视频输出的位置

gifUrl
用于指定 Gif 输出的位置

successDoc: Boolean = false
failDoc: Boolean = false
用于指定是否生成失败的操作文档，会包括描述和截图

#### 断言

is
等于

has
包含
