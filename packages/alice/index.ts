import parseAlice from './parseAlice'

export default { parseAlice }

/*!!

#### 如何使用

```bash
$ ark doc ./xxx.js README
# xxx.js会作为解析的入口文件，README是生成后的文档名称，不需要加后缀。

$ ark doc -a
# 直接输出本文档——《Ark Cookbook》
```
#### 语法规则

@=./doc.md

##### 抓取语法

$$ @=(url) $$

`url`目前仅支持相对路径，该语法会将路径下的整个文件抓取过来，填充到文档中，适合用于抓取某测试用例作为文档中的demo展示。

##### 引用语法

$$ @~(url) $$

`url`目前仅支持相对路径，该语法会解析某个文件，如果文件中有解析范围，其中又包含引用或抓取语法，则自然会递归解析。这份Ark文档本身就是用该工具不断递归解析各个小文档和文件而生成的。

当在解析过程中遇到`Latex`语法包裹的语句 `$$ ... $$`，则会自动将其中的部分符号转换为Latex语法符号。

!!*/
