require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')
const Params = require('scripts/renderParams.js')
const Visible = require('scripts/visibleControl.js')

const ForgotPsw = class {
  constructor () {
    this.$resetPwd = document.querySelector('.as-reset-pwd')
    this.$parent = this.$resetPwd

    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    this.$resetForm = this.$parent.querySelector('.as-reset-pwd-form')

    this.init()
  }

  init () {
    new Visible()
    this.submitResetPwd()
  }

  submitResetPwd () {
    let that = this
    new Params(this.$resetForm)

    const form = that.$resetForm && new Form(that.$resetForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          // 不自动登录,显示重置成功页面
          // 暂时重定向至登录页面
          if (that.$path && typeof that.$path !== 'undefined') {
            helpers.goToPage(that.$path)
          }
        }
      },
      fail: function (response) {
        if (!form) return 
        this.showFormError(that.$resetForm.querySelector('.as-invalid-error'))
      }
    })
  }
}

new ForgotPsw()
