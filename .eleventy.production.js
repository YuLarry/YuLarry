const fs = require('fs')
const path = require('path')
const marked = require('marked')
const renderer = new marked.Renderer()

const timestamp = Date.now()

module.exports = function(config) {
  // setUseGitIgnore 和 addWatchTarget 这两个要配合使用
  // https://www.11ty.dev/docs/ignores/
  config.setUseGitIgnore(false)
  // 额外监视 _compiled 下的 js 和 css文件，触发构建及浏览器重载
  // config.addWatchTarget('./_compiled/**/*.js')
  // config.addWatchTarget('./_compiled/**/*.css')
  config.addWatchTarget('./_compiled')

  // index.css index.js → built/
  config.addPassthroughCopy({
    '_compiled/**/*.js': '/assets/scripts',
    '_compiled/**/*.css': '/assets/styles',
    'src/scripts/vendor': 'assets/scripts/vendor',
    'src/assets': 'assets'
  })
  // src/scripts/vendor/*.js → built/assets/*.js
  // config.addPassthroughCopy({'src/scripts/vendor': 'assets'})

  // 设置 layout 的别名
  config.addLayoutAlias('default', 'default/theme.hbs')

  config.addHandlebarsHelper("inline", function(filepath) { 
    return fs.readFileSync(path.join(__dirname, 'src/assets', filepath), 'utf8')
  })

  config.addHandlebarsHelper("json", function(obj) { 
    return JSON.stringify(obj)
  })

  config.addHandlebarsHelper("ifEquals", function(arg1, arg2, options) { 
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this)
  })

  config.addHandlebarsHelper("assign", function(varName, varValue, options) { 
    if (!options.data.root) {
      options.data.root = {}
    }
    options.data.root[varName] = varValue
  })

  config.addFilter('asset_url', function (url) {

    if (url.startsWith('/scripts/vendor')) {
      return '/assets' + url + '?' + timestamp
    } else if (url.startsWith('scripts/vendor')) {
      return '/assets/' + url + '?' + timestamp
    } else if (url.endsWith('.js')) {
      return '/assets/scripts/' + ((url.indexOf('/') === 0) ? url.substring(1).split('/').join('-') : url.split('/').join('-')) + '?' + timestamp
    } else if (url.endsWith('.css')) {
      return '/assets/styles/' + ((url.indexOf('/') === 0) ? url.substring(1).split('/').join('-') : url.split('/').join('-')) + '?' + timestamp
    }

    return url + '?' + timestamp
  })

  config.addFilter('asset_img_url', function (url) {
    return url.startsWith('/') ? '/assets/media' + url : '/assets/media/' + url
  })

  config.addFilter('t', function (path) {
    return path
  })

  renderer.link = function( href, title, text ) {
    return '<a target="_blank" rel="noopener noreferrer" href="'+ href +'">' + text + '</a>';
  }

  config.addFilter('marked', function (str) {
    return marked(str, { renderer:renderer })
  })

  // You can return your Config object (optional).
  return {
    templateFormats: ['html', 'liquid', 'md', 'hbs'],
    jsDataFileSuffix: '.data',
    dir: {
      input: "src/views",
      data: '../_data',
      includes: '../_includes',
      layouts: '../_layouts',
      output: 'built'
    }
  }
}
