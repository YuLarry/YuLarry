require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const Links = require('scripts/renderLinks.js')
const Params = require('scripts/renderParams.js')

const ForgotPwd = class {
  constructor () {
    this.$forgotPwd = document.querySelector('.as-forgot-password')
    this.$successPage = document.querySelector('.as-success-page')

    this.$forgotPwdform = document.querySelector('.as-forgot-pwd-form')

    // record email
    this.$userEmail = this.$forgotPwd.querySelector('.as-user-email')
    this.$renderEmail = this.$successPage.querySelector('.as-render-email')

    this.init()
  }

  init () {
    new Links()
    new Params(this.$forgotPwdform)
    this.submitForgotPwd()
  }

  submitForgotPwd () {
    const that = this
    const form = this.$forgotPwdform && new Form(this.$forgotPwdform, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          that.renderSuccessPage()
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 404) {
          this.showFormError(that.$forgotPwdform.querySelector('.as-not-exist-error'))
        } else {
          this.showFormError(that.$forgotPwdform.querySelector('.as-invalid-error'))
        }
      }
    })
  }

  renderSuccessPage () {
    this.$forgotPwd.classList.add('d-none')
    this.$successPage.classList.remove('d-none')
    this.renderEmail()
  }

  renderEmail () {
    const email = this.$userEmail.value
    if (this.$renderEmail) {
      this.$renderEmail.innerHTML = email
    }
  }
}

new ForgotPwd()
