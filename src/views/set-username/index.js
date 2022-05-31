require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')

const Params = require('scripts/renderParams.js')

const Update = require('scripts/updatePage.js')

const Username = class {
  constructor () {
    this.$setUsername = document.querySelector('.as-set-username')
    this.$parent = this.$setUsername

    this.$setUsernameForm = this.$parent.querySelector('.as-set-username-form')
    this.$usernameParam = this.$setUsernameForm.querySelector('.as-username-param')

    this.$getUsernameForm = this.$parent.querySelector('.as-get-username-form')
    
    // 是否需要更新用户名
    this.$update = false
    // 本人旧用户名
    this.$name = ''
    this.init()
  } 
  init () {
    this.getUsername()
    this.renderParams()
    this.addListenChange()
    this.submitSetUsername()
  }
  getUsername() {
    var that = this
    let form = this.$getUsernameForm && new Form(this.$getUsernameForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          if(response.data.username) {
            that.$name = response.data.username
            that.$usernameParam.value = that.$name
          }

        }
      },
      fail: function (response) {
        return
      }
    })
    that.$getUsernameForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }
  renderParams() {
    var that = this
    this.ifNeedMultipass = this.$setUsernameForm.querySelector('.as-need-multipass-param')
    this.$changeUser = helpers.getParams('change')
    if (this.$changeUser) {
      this.ifNeedMultipass.value = '1'
      new Params(this.$setUsernameForm)
    }
  }
  addListenChange() {
    var that = this
    this.$usernameParam.addEventListener('change', () => {
      if (that.$usernameParam.value === that.$name) {
        that.$update = false
      } else {
        that.$update = true
      } 
    })
  }
  submitSetUsername() {
    var that = this
    // 设置用户名需要认证
    let form = this.$setUsernameForm && new Form(this.$setUsernameForm, {
      validate: function() {
        if (that.$update) {
          return true
        } else {
          new Update(that.$parent)
          return false
        }
      },
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          let $token = response.data.token
          let $multipass = response.data.multipass
          $token && helpers.setToken(response.data.token)
          $multipass && helpers.setMultipass($multipass)

          new Update(that.$parent)
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 422) {
          this.showFormError(that.$setUsernameForm.querySelector('.as-already-error'))
        } else {
          this.showFormError(that.$setUsernameForm.querySelector('.as-invalid-error'))
        }
      }
    })
  }
}


// 页面流相关功能
const Page = class {
  constructor () {
    this.$page = document.querySelector('.as-set-username')
    if (this.$page && this.$page.dataset.login) {
      this.$login = this.$page.dataset.login
    }
    this.init()
  }
  init () {
    this.ifLogin()
  }

  ifLogin() {
    var that = this
    let token = helpers.getToken()
    if (!token) {
      // 从其他系统登出，没有登录跳转至登录页面
      // 添加redirect_to参数
      let currentUrl = window.self.location.origin + window.self.location.pathname
      let params = {
        'redirect_to': currentUrl
      }
      helpers.goToPage(this.$login, params)
    } else {
      // 已登录的话则初始化页面
      document.body.classList.remove('invisible')
      new Username()
    }
  }
}
new Page()
