require('@layouts/default/theme.js')
const Hogan = require('hogan.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')
const Links = require('scripts/renderLinks.js')
const Visible = require('scripts/visibleControl.js')

const Login = class {
  constructor () {
    this.$loginTempWrap = document.querySelector('.as-login-template-wrap')
    this.$loginTemp = document.querySelector('.as-login-template')

    // 参数
    this.$source = helpers.getParams('source')

    this.$returnToParam = helpers.getParams('return_to')
    this.$storeParam = helpers.getParams('store')

    this.init()
  }

  init () {
    this.ifLogin()
  }

  ifLogin () {
    const token = helpers.getToken()
    if (!token) {
      // 没有登录则渲染登录表单
      this.renderLogin()
    } else {
      // 验证token
      this.verifyLogin()
    }
  }

  renderLogin () {
    document.body.classList.remove('invisible')
    if (this.$loginTemp && this.$loginTempWrap) {
      const html = Hogan.compile(this.$loginTemp.innerHTML)
      this.$loginTempWrap.innerHTML = html && html.render()
    }
    new Links()
    new Visible()
    this.submitLogin()
  }

  submitLogin () {
    let that = this
    this.$loginForm = this.$loginTempWrap.querySelector('.as-login-form')
    // 更新表单参数（是否需要multipass)
    this.updateParams(this.$loginForm, false)

    const form = this.$loginForm && new Form(that.$loginForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          let $token = response.data.token
          let $multipass = response.data.multipass
          $token && helpers.setToken(response.data.token)
          $multipass && helpers.setMultipass($multipass)

          that.updatePage()
        }
      },
      fail: function (response) {
        if (!form) return

        if (response.status_code === 401 || response.status_code === 404) {
          this.showFormError(that.$loginForm.querySelector('.as-invalid-error'))
        } else if (response.status_code === 426) {
          this.showFormError(that.$loginForm.querySelector('.as-reset-password-error'))
        } else {
          this.showFormError(that.$loginForm.querySelector('.as-other-error'))
        }
      }
    })
  }

  updateParams ($form, $needMultipass) {
    const source = $form.querySelector('.as-source-param')
    const returnTo = $form.querySelector('.as-return-to-param')
    const store = $form.querySelector('.as-store-param')
    const multipass = $form.querySelector('.as-need-multipass-param')

    if (this.$source !== 'store') {
      // 来源不是商城则multipass参数为0
      if (source) source.value = this.$source
      if ($needMultipass && multipass) {
        multipass.value = 0
      }
    } else if (this.$source === 'store') {
      // 来源为商城则渲染相关参数
      if ($needMultipass && multipass) {
        multipass.value = 1
      }
      if (source) source.value = this.$source
      if (returnTo && this.$returnToParam) returnTo.value = this.$returnToParam
      if (store && this.$storeParam) store.value = this.$storeParam
    }
  }

  handleData ($form, $needMultipass) {
    const source = $form.querySelector('.as-source-param')
    const returnTo = $form.querySelector('.as-return-to-param')
    const store = $form.querySelector('.as-store-param')
    const multipass = $form.querySelector('.as-need-multipass-param')
    const action = $form.action

    if (this.$source !== 'store') {
      // 来源不是商城则multipass参数为0
      if (source) source.value = this.$source
      if ($needMultipass && multipass) {
        multipass.value = 0
        $form.action = action + '?need_multipass=0'
      }
    } else if (this.$source === 'store') {
      // 来源为商城则渲染相关参数
      if ($needMultipass && multipass && this.$returnToParam && this.$storeParam) {
        multipass.value = 1
        $form.action = action + '?need_multipass=1' + '&return_to=' + this.$returnToParam + '&store=' + this.$storeParam
      }
    }
  }

  verifyLogin () {
    let that = this
    this.$verifyForm = document.querySelector('.as-verify-form')
    this.handleData(this.$verifyForm, true)
    // this.updateParams(this.$verifyForm, true)
    let form = this.$verifyForm && new Form(this.$verifyForm, {
      done: function (response) {
        console.log(response.data)
        if (!response.data) return
        if (response.status_code == 200) {
          const $multipass = response.data.multipass
          $multipass && helpers.setMultipass($multipass)
          that.updatePage()
        }
      },
      fail: function () {
        // 清除cookie，渲染登录页面
        helpers.removeToken()
        helpers.removeMultipass()
        that.renderLogin()
      }
    })
    that.$verifyForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }

  updatePage () {
    let that = this
    if (that.$source && that.$source === 'store') {
      helpers.redirectTo(that.$source, helpers.getMultipass())
    } else {
      helpers.redirectTo(that.$source, helpers.getToken())
    }
  }
}

new Login()
