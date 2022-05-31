require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')
const Params = require('scripts/renderParams.js')

const Verify = class {
  constructor () {

    this.$verifySection = document.querySelector('.as-verify-section')
    this.$parent = this.$verifySection

    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    this.$prevPath = this.$parent.dataset.prevPage
    // 若链接中含有email参数
    this.$email = window.atob(helpers.getParams('email'))
    // 验证码表单
    this.$verifyForm = this.$parent.querySelector('.as-verification-form')
    // 发送验证码表单
    this.$emailForm = this.$parent.querySelector('.as-email-form')

    // send again and countdown
    this.$sendAgain = this.$parent.querySelector('.as-send-again')
    this.$countdownWrap = this.$parent.querySelector('.as-countdown-wrap')
    this.$countdownNumber = this.$countdownWrap.querySelector('.as-countdown-number')

    // 验证码表单初始化
    this.$form = null

    this.init()
  } 
  init () {
    // 渲染url中的email参数
    new Params(this.$parent)
    this.submitVerification()
    this.initCountdown()
    this.addChangeEmailListener()
    this.addSendAgainListener()

  }
  // 绑定验证码提交事件
  submitVerification() {
    var that = this   
    this.$form = this.$verifyForm && new Form(this.$verifyForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          helpers.goToPage(that.$path)
        }
      },
      fail: function (response) {
        if (!that.$form) return
        this.showFormError(that.$verifyForm.querySelector('.as-invalid-error'))
      }
    })
  }

  addChangeEmailListener() {
    var that = this
    let change = this.$parent.querySelector('.as-change')
    change.addEventListener('click', () => {
      // 返回注册页
      helpers.goToPage(that.$prevPath)
    })
  }

  // 重新发送邮件验证码
  addSendAgainListener() {
    var that = this
    this.$sendAgain.addEventListener('click', () => {   
      that.sendVerificationCode()
    })
  }

  // 发送邮箱验证码
  sendVerificationCode() {
    if (!this.$form) return
    var that = this
    let form = this.$emailForm && new Form(this.$emailForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          that.initCountdown()
        }
      },
      fail: function(response) {
        // 展示报错信息
        if (response.status_code === 429) {
          that.$form.showFormError(that.$emailForm.querySelector('.as-frequent-error'))
        } else {
          that.$form.showFormError(that.$emailForm.querySelector('.as-invalid-error'))
        }
      }
    })
    // 提交表单
    that.$emailForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }

  initCountdown() {
    this.$sendAgain.classList.add('d-none')
    this.$countdownWrap.classList.remove('d-none')
    // 发送验证码的间隔时间
    let timer = parseInt(this.$countdownNumber.dataset.interval)
    this.$countdownNumber.innerHTML = timer
    let countdown = setInterval(() => {
      timer = timer - 1
      this.$countdownNumber.innerHTML = timer
      if (timer < 1) {
        clearInterval(countdown)
        this.$countdownWrap.classList.add('d-none')
        this.$sendAgain.classList.remove('d-none')
      }
    },1000)
  }
}

new Verify()
