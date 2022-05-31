const helpers = require('scripts/helpers.js')

const Update = class{
  constructor ($parent) {
    this.$parent = $parent
    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    this.$source = helpers.getParams('source')
    // 是否是修改用户名
    this.$changeUser = helpers.getParams('change')

    this.init()
  }
  init () {
    this.updatePage() 
  }
  updatePage() {
    var that = this
    if(that.$changeUser) {
      // 如果是修改用户名,则跳转回callback链接
      if (that.$source && that.$source === 'store') {
        helpers.redirectTo(that.$source, helpers.getMultipass())
      } else {
        helpers.redirectTo(that.$source, helpers.getToken())
      }
    } else {
      if (this.$path && typeof this.$path !== 'undefined') {
        helpers.goToPage(this.$path, )
      } else {
        // 不需要设置用户信息，则返回callback页面
        if (that.$source && that.$source === 'store') {
          helpers.redirectTo(that.$source, helpers.getMultipass())
        } else {
          helpers.redirectTo(that.$source, helpers.getToken())
        }
      }
    }
  }
}
module.exports = Update