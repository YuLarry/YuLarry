require('@layouts/default/theme.js')
require('./index.scss')
const Hogan = require('hogan.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')

const Login = class {
  constructor () {
    this.$loginTempWrap = document.querySelector('.as-login-template-wrap')
    this.$loginTemp = document.querySelector('.as-login-template')

    this.$source = helpers.getParams('source')
    this.init()
  }
  
  init() {
    this.ifLogin()
  }

  ifLogin() {
    let token = helpers.getToken()
    if (!token) {
      this.renderLogin()
    } else {
      this.verifyLogin()
    }
  }
  renderLogin() {
    document.body.classList.remove('invisible')
    if (this.$loginTemp && this.$loginTempWrap) {
      let html = Hogan.compile(this.$loginTemp.innerHTML)
      this.$loginTempWrap.innerHTML = html && html.render()
    }
    this.submitLogin()
  }
  submitLogin() {
    this.$loginForm = document.querySelector('.as-login-form')
    this.updateParams(this.$loginForm, false)
    var form = this.$loginForm && new Form(this.$loginForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          if (response.data.token) {
            helpers.setToken(response.data.token)
            if (this.$source === 'store') {
              helpers.redirectTo(this.$source, response.data.token)
            } else {
              helpers.redirectTo(this.$source, response.data.multipass)
            }
          }
        }
      },
      fail: function () {
        if (!form) return
        if (response.status_code == 404) {
          this.showFormError(this.$resetForm.querySelector('.as-invalid-error'))
        } else {
          this.showFormError(this.$resetForm.querySelector('.as-other-error'))
        }
      }
    })
  }
  updateParams($form, $needMultipass) {
    let source = $form.querySelector('.as-source-param')
    let returnTo = $form.querySelector('.as-return-to-param')
    let store = $form.querySelector('.as-store-param')
    let multipass = $form.querySelector('.as-need-multipass-param')

    if (this.$source !== 'store') {
      if(source) source.value = this.$source
      if ($needMultipass && multipass) {
        multipass.value = 0
      }
    } else if (this.$source === 'store') {
      if ($needMultipass && multipass) {
        multipass.value = 1
      }
      let returnToParam = helpers.getParams('return_to')
      let storeParam = helpers.getParams('store')
      if (returnTo && returnToParam) returnTo.value = returnToParam
      if (store && storeParam) store.value = storeParam
    }
  }
  verifyLogin() {
    this.$verifyForm = document.querySelector('.as-verify-form')
    this.updateParams(this.$verifyForm, true)
    var form = this.$verifyForm && new Form(this.$verifyForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          if (this.$source === 'store') {
            helpers.redirectTo(this.$source, helpers.getToken())
          } else {
            helpers.redirectTo(this.$source, response.data.multipass)
          }  
        }
      },
      fail: function () {
        console.log('failed')
        // 清除cookie，渲染登录页面
        helpers.removeToken()
        helpers.removeMultipass()
        this.renderLogin()
      }
    })
    this.$verifyForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }
}

new Login()
