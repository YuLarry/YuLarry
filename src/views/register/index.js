require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')
const Links = require('scripts/renderLinks.js')
const Params = require('scripts/renderParams.js')

const Register = class {
  constructor () {
    
    this.$registerSection = document.querySelector('.as-register-section')
    this.$parent = this.$registerSection

    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    // 是否进行邮箱验证
    this.$verify = this.$parent.dataset.verify

    // 邮箱输入表单
    this.$emailForm = this.$parent.querySelector('.as-email-form')
    // 发送email参数
    this.$checkEmailParam = this.$emailForm.querySelector('.as-check-email-param')

    // 发送验证码表单
    this.$checkEmailForm = this.$parent.querySelector('.as-check-email-form')
    // email输入
    this.$userEmail = this.$checkEmailForm.querySelector('.as-user-email')
    
    this.init()
  } 
  init () {
    // 页面链接加上url参数
    new Links()
    // url中如果有email参数则渲染至输入框
    new Params(this.$parent)

    this.listenEmail()
    this.checkEmail()
  }

  // 输入时，更新所有参数
  listenEmail() {
    var that = this
    this.$userEmail.addEventListener('change', () => {
      that.$checkEmailParam.value = that.$userEmail.value
    })
  }

  checkEmail() {
    var that = this
    this.checkform = this.$checkEmailForm && new Form(this.$checkEmailForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          // 需要认证邮箱
          if (that.$verify) {
            that.sendVerificationCode()
          } else {
            let currentEmail = that.$userEmail.value
            let params = {
              'email': currentEmail
            }
            // 校验成功，邮箱可用, 跳转至邮箱验证页面
            helpers.goToPage(that.$path, params)
          }
        }
      },
      fail: function (response) {
        this.showFormError(that.$checkEmailForm.querySelector('.as-exist-error'))
      }
    })
  }

  // 发送邮箱验证码
  sendVerificationCode() {
    var that = this
    let form = this.$emailForm && new Form(this.$emailForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          let currentEmail = that.$userEmail.value
          let params = {
            'email': currentEmail
          }
          // 校验成功，邮箱可用, 跳转至邮箱验证页面
          helpers.goToPage(that.$path, params)
        }
      },
      fail: function(response) {
        if (response.status_code === 429) {
          that.checkform.showFormError(that.$checkEmailForm.querySelector('.as-frequent-error'))
        } else {
          that.checkform.showFormError(that.$checkEmailForm.querySelector('.as-invalid-error'))
        }
      }
    })
    // 火狐兼容性，需要cancelable属性
    that.$emailForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }
}

new Register()
