const helpers = require('scripts/helpers.js')

const Params = class{
  constructor ($parent) {
    this.$parent = $parent

    // url中参数
    if (helpers.getParams('email')) {
      this.$email = window.atob(helpers.getParams('email'))
    }

    this.$token = helpers.getParams('token')
    this.$multipass = helpers.getParams('multipass')
    this.$source = helpers.getParams('source')
    this.$callback = helpers.getParams('callback')
    this.$returnTo = helpers.getParams('return_to')
    this.$store = helpers.getParams('store')

    this.$uid = helpers.getParams('uid')

    // 需要存储数据的dom节点
    this.$renderEmail = this.$parent.querySelectorAll('.as-render-email')

    // 跳转的页面路径
    this.$emailParam = this.$parent.querySelectorAll('.as-email-param')
    this.$tokenParam = this.$parent.querySelectorAll('.as-token-param')

    this.$sourceParam = this.$parent.querySelectorAll('.as-source-param')
    this.$callbackParam = this.$parent.querySelectorAll('.as-callback-param')
    this.$returnToParam = this.$parent.querySelectorAll('.as-return-to-param')

    this.$storeParam = this.$parent.querySelectorAll('.as-store-param')

    this.$uidParam = this.$parent.querySelectorAll('.as-uid-param')

    this.init()
  }
  init () {
    this.renderElements()
    this.renderParams() 
  }
  renderElements() {
    this.$email && this.$renderEmail && Array.prototype.map.call(this.$renderEmail, (ele) => {
      ele.textContent = this.$email
    })
  }
  renderParams() {
    this.$email && this.$emailParam && Array.prototype.map.call(this.$emailParam, (param) => {
      param.value = this.$email
    })
    this.$token && this.$tokenParam && Array.prototype.map.call(this.$tokenParam, (param) => {
      param.value = this.$token
    })
    this.$source && this.$sourceParam && Array.prototype.map.call(this.$sourceParam, (param) => {
      param.value = this.$source
    })
    this.$callback && this.$callbackParam && Array.prototype.map.call(this.$callbackParam, (param) => {
      param.value = this.$callback
    })
    this.$returnTo && this.$returnToParam && Array.prototype.map.call(this.$returnToParam, (param) => {
      param.value = this.$returnTo
    })
    this.$store && this.$storeParam && Array.prototype.map.call(this.$storeParam, (param) => {
      param.value = this.$store
    })
    this.$uid && this.$uid && Array.prototype.map.call(this.$uidParam, (param) => {
      param.value = this.$uid
    })
  }
}

module.exports = Params