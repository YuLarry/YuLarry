const path = require('path')
const Fiber = require('fibers')
const glob = require('glob')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const __ = require('lodash')
require('dotenv').config({ path: '.env.production' })

// 将所有入口文件自动整理成 [路径名：文件路径] 键值对
function getEntry () {
  const files = glob.sync(path.join(__dirname, 'src/views/**/index.js'))
  const entries = {}
  let entry, chunkname

  for (let i = 0; i < files.length; i++) {
    entry = path.normalize(files[i])
    chunkname = path.relative(path.resolve(__dirname, 'src/views'), entry)
    // chunkname的形式为'demo/entry'，其中包含了入口文件的路径信息和文件后缀信息，这样打包后的文件会按照指定路径直接写入到output指定文件夹下
    // 去掉了后缀
    // 将 chunkname 中的路径符号都替换为 -
    // chunkname = chunkname.replace(/\.js$/, '').replace(new RegExp(path.sep, 'g'), '-')
    chunkname = chunkname.replace(/\.js$/, '').split(path.sep).join('-')
    //  此配置中只有允许有一个入口文件
    entries[chunkname] = entry
  }
  return entries
}

module.exports = function (env, argv) {
  const _ = {
    // 公共js文件的chunk name
    vendor: 'assets/scripts/vendor',
    assetsPublicPath: '',
    htmlPath: __.get(argv, 'outputPath') || '_compiled',
    dist: __.get(argv, 'outputPath') || '_compiled'
  }

  let entries = {}
  // 是否传入了入口文件
  const entryArgv = __.get(argv, 'entry')

  // 如果没有传入入口文件, 那么获取所有入口文件
  if (entryArgv) {
    // 截取未 cook 的参数
    for (let i = 0, entry, chunkname; i < entryArgv.length; i++) {
      entry = entryArgv[i]
      if (entry.indexOf('/index.js') !== -1) {
        // 将处理过的参数干掉, 否则 webpack 会重复 cook 参数
        // entryArgv.splice(i, 1)
        // i--
        entry = path.normalize(path.join(__dirname, entry))
        chunkname = path.relative(path.resolve(__dirname, 'src/views'), entry)
        // chunkname的形式为'demo/entry'，其中包含了入口文件的路径信息和文件后缀信息，这样打包后的文件会按照指定路径直接写入到output指定文件夹下
        // 去掉了后缀
        // 将 chunkname 中的路径符号都替换为 -
        chunkname = chunkname.replace(/\.js$/, '').split(path.sep).join('-')
        //  此配置中只有允许有一个入口文件
        entries[chunkname] = entry
      }
    }
    // 将处理过的参数干掉, 否则 webpack 会重复 cook 参数
    argv.entry = undefined
  } else {
    entries = getEntry()
  }

  const webpackConfig = {
    mode: 'production',
    entry: entries,
    context: path.resolve(__dirname, 'src'),
    output: {
      // 打包后的文件存放的根目录
      path: path.join(__dirname, _.dist, 'assets'),
      // filename: _.production ? '[name].[chunkhash:8].js' : '[name].js',
      filename: '[name].js',
      // chunkFilename: _.production ? '[name].[chunkhash:8].js' : '[name].js',
      // chunkFilename: '[name].js',
      // webpack output serve 地址，当设定后，访问地址为 [例]localhost:8000/demo/index.html
      publicPath: _.assetsPublicPath
    },

    // 设置js文件中require和import的解析规则
    resolve: {
      // 设置优先于node模块的查找路径
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@widgets': path.resolve(__dirname, 'src/widgets'),
        '@snippets': path.resolve(__dirname, 'src/_includes/snippets'),
        '@layouts': path.resolve(__dirname, 'src/_layouts'),
        '@sections': path.resolve(__dirname, 'src/_includes/sections')
      }
    },

    module: {
      rules: [
        // 图片处理：可以处理CSS中的图片，但是记得在sass url中要么使用相对sass文件的相对路径，要么可以使用 ~ 号
        // 例如: background-image: url(~/assets/)
        // [参考链接](https://github.com/bholloway/resolve-url-loader/issues/5)
        {
          test: /\.(jpeg|jpg|png|gif|svg|ico)$/i,
          // 指定仅处理images文件夹下的指定文件类型
          include: path.resolve(__dirname, 'src/assets/media'),
          use: {
            loader: 'file-loader',
            // 另外还有一个 url-loader 可以设定，当图片小于某个情况时，可以以base64的形式嵌入到样式文件中
            options: {
              context: path.resolve(__dirname, 'src'), // 指定图片路径所相对的根路径，如果未设定此值，那么 name 中path所保存的路径将会从项目根目录开始
              // name: _.production ? '[path][name].[sha512:hash:base64:8].[ext]' : '[path][name].[ext]'
              // name: '[path][name].[ext]'
              emitFile: true,
              name:
                function (pathname) {
                  // 调整输出路径 src/assets/media/dir/dir/image.jpg → assets/media/dir-dir-image.jpg
                  // 此处的调整会影响引用的调整
                  // 图片路径 /src/assets/media/events/some-image.png → /events/some-image.png → events-some-image.png
                  return path.relative(path.resolve(__dirname, 'src/assets/media'), pathname).split(path.sep).join('-')
                }
            }
          }
        },
        // 字体文件
        {
          test: /\.(eot|svg|ttf|otf|woff|woff2)$/i,
          // 指定仅处理fonts文件夹下
          include: path.resolve(__dirname, 'src/assets/fonts'),
          exclude: path.resolve(__dirname, 'src/assets/fonts/svgs'),
          use: {
            loader: 'url-loader',
            options: {
              context: path.resolve(__dirname, 'src'),
              name:
                function (pathname) {
                  // 将路径分隔符替换为 - 分隔符
                  // 字体路径 /src/assets/fonts/events/some-fonts.ttf → /events/some-fonts.ttf → events-some-fonts.ttf
                  return path.relative(path.resolve(__dirname, 'src/assets/fonts'), pathname).split(path.sep).join('-')
                }
            }
          }
        },
        {
          test: /\.scss$/,
          use:
          [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-loader',
              // 不对 CSS 中的资源引用路径进行解析
              // https://webpack.js.org/loaders/css-loader/#url
              options: { url: false }
            },
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'src/_includes')],
                  fiber: Fiber
                }
              }
            }
            // 'sass-loader?' + JSON.stringify({includePaths: [path.resolve(__dirname, 'src')]})
          ]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.json$/,
          // 用于匹配loaders所处理文件拓展名的正则表达式
          use: 'json-loader',
          // 具体loader的名称
          exclude: /node_modules/
        }
      ]
    },

    plugins: [
      // webpack 3.0的scope优化
      new webpack.optimize.ModuleConcatenationPlugin(),
      new MiniCssExtractPlugin({
        // Name of the result file. May contain [name], [id] and [contenthash]
        filename: '[name].css'
      })

    ],

    // stats: 'errors-only'
    stats: 'errors-warnings'
  }

  return webpackConfig
}
