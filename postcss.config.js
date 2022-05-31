'use strict'
const assets = require('postcss-assets')
// var url = require('postcss-url')

// plugins 需要严格保持顺序

const plugins = [
  require('autoprefixer'),
  // https://github.com/postcss/postcss-color-function
  require('postcss-color-function')(),
  // 使用 assets 后可以获取 image 的宽度和高度, 然而并不能用于计算
  assets({
    loadPaths: ['src/']
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(require('cssnano'))
  // cssnano 要在 url 之前,否则可怕的事情会发生
  // var noneShopify = false
  // // 在 yarn run dist 命令下, 不进行 shopify 路径的替换
  // for (var i = 0; i < process.argv.length; i++) {
  //   if (process.argv.indexOf('--output-path=./dist') > 0) {
  //     noneShopify = true
  //   }
  // }

  // !noneShopify && plugins.push(
  //   url({
  //     url: function (asset) {
  //       // 替换成 shopify liquid 的格式
  //       // 此处有坑:如果 url 对应的目标文件进行了处理, 产生了文件名,地址变化, 或者试图替换为 inline 代码, 都将失败
  //       // 因为构建工具首先读取了对应文件路径, 对目标文件进行处理后, 试图更新路径时, 原路径已经被修改导致不可追踪
  //       if (/^~assets/.test(asset.originUrl)) {
  //         return asset.originUrl
  //           .replace(/^~assets\/images\/(.*)\?.*size=(\d+x\d*)/, "{{ '$1' | asset_img_url: '$2' }}")
  //           .replace(/^~assets\/images\/(.*)/, "{{ '$1' | asset_url }}")
  //           .replace(/^~assets\/fonts\/(.*)/, "{{ '$1' | asset_url }}")
  //           .replace(/\//g, '-')
  //       } else {
  //         return asset.url
  //       }
  //     }
  //   }))
} else {
  plugins.push(require('postcss-discard-duplicates'))
}

module.exports = {
  plugins: plugins
}
