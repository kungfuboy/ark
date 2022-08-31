const marked = require('marked')
const fs = require('fs')
const renderer = new marked.Renderer()

renderer.image = function (href, title, text) {
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href)
  }
  var out = '<img class="md-image" src="' + href + '" alt="' + text + '"'
  if (title) {
    out += ' title="' + title + '"'
  }
  out += this.options.xhtml ? '/>' : '>'
  return out
}

const mdFile = process.argv[2]

if (!mdFile) {
  console.error(
    'Error: No markdown file is specified. ' +
      "Specify it using 'node gen-html.js sample.md'"
  )
  process.exit(1)
}
if (!/.md$/.test(mdFile)) {
  console.error(`Error: The input file ${mdFile} is not a markdown file.`)
  process.exit(1)
}
if (!fs.existsSync(mdFile)) {
  console.error(`Error: The input file ${mdFile} does not exist.`)
  process.exit(1)
}

const htmlFile = mdFile.replace(/.md$/, '.html')
const template = './static/md-template.html'

fs.copyFileSync(template, htmlFile)

fs.readFile(mdFile, 'utf8', function (err, data) {
  if (err) {
    return console.log(err)
  }
  const mdHtml = marked(data, { renderer: renderer })

  fs.readFile(htmlFile, 'utf-8', function (err, html) {
    if (err) {
      return console.log(err)
    }

    const result = html.replace(/<!-- markdown-body -->/, mdHtml)

    fs.writeFile(htmlFile, result, 'utf8', function (err) {
      if (err) return console.log(err)
      console.log(`${htmlFile} is ready.`)
    })
  })
})