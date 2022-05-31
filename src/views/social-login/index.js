require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')

const Social = class {
  constructor () { 
    this.$source = helpers.getParams('source')
    this.$token = helpers.getParams('token')

    this.$returnToParam = helpers.getParams('return_to')
    this.$storeParam = helpers.getParams('store')
    this.init()
  }
  
  init() {
    this.updateLogin()
    this.ifLogin()
  }
  updateLogin() {
    var that = this
    this.$token && helpers.setToken(this.$token)
  }
  ifLogin() {
    let token = helpers.getToken()
    if (!token) {
      // 没有登录则重定向至login
      this.redirectLogin()
    } else {
      this.ifStore()
    }
  }
  ifStore() {
    var that = this
    if (this.$source === 'store') {
      // 请求接口，获取multipass
      this.verifyLogin()
    } else {
      this.updatePage()
    }
  }
  updateParams($form) {
    let source = $form.querySelector('.as-source-param')
    let returnTo = $form.querySelector('.as-return-to-param')
    let store = $form.querySelector('.as-store-param')

    if (this.$source === 'store') {
      if(source) source.value = this.$source
      if (returnTo && this.$returnToParam) returnTo.value = this.$returnToParam
      if (store && this.$storeParam) store.value = this.$storeParam
    }
  }
  verifyLogin() {
    var that = this
    this.$verifyForm = document.querySelector('.as-verify-form')
    this.updateParams(this.$verifyForm)
    var form = this.$verifyForm && new Form(this.$verifyForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          let $multipass = response.data.multipass
          $multipass && helpers.setMultipass($multipass)
          that.updatePage()
        }
      },
      fail: function () {
        // 清除cookie
        helpers.removeToken()
        helpers.removeMultipass()
        // 重定向至登录页面
        this.redirectLogin()
      }
    })
    that.$verifyForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }
  redirectLogin() {
    helpers.goToPage('login/')
  }
  updatePage() {
    var that = this
    if (that.$source && that.$source === 'store') {
      helpers.redirectTo(that.$source, helpers.getMultipass())
    } else {
      helpers.redirectTo(that.$source, helpers.getToken())
    }
  }

}

new Social()
