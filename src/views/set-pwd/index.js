require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')
const Params = require('scripts/renderParams.js')
const Visible = require('scripts/visibleControl.js')

const Setpsw = class {
  constructor () {
    
    this.$setPwd = document.querySelector('.as-set-pwd')
    this.$parent = this.$setPwd

    this.$setPwdForm = this.$parent.querySelector('.as-set-pwd-form')
    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    // 邀请码路径
    this.$invitationPath = this.$parent.dataset.invitationPage

    this.$source = helpers.getParams('source')

    // 初始化multipass
    this.$multipass = null
    // 初始化参数
    this.$param = null
  

    this.init()
  } 
  init () {
    new Visible()
    new Params(this.$parent)
    this.submitSetPwd()
  }

  submitSetPwd() {
    var that = this
    let form = this.$setPwdForm && new Form(this.$setPwdForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          // 注册成功，设置cookie
          helpers.setToken(response.data.token)
          that.$multipass = response.data.multipass
          that.updatePage()
        }
      },
      fail: function(response) {
        if (!form) return
        if (response.status_code === 422 || response.status_code === 403) {
          this.showFormError(that.$setPwdForm.querySelector('.as-other-error'))
        } else {
          this.showFormError(that.$setPwdForm.querySelector('.as-format-error'))
        }
      }
    })
  }
  updatePage() {
    var that = this

    that.$multipass && helpers.setMultipass(that.$multipass)

    if (that.$source && that.$source === 'forum' && that.$invitationPath && typeof that.$invitationPath !== 'undefined') { 
      // 来源于论坛，且有邀请码页面，则去邀请码
      helpers.goToPage(that.$invitationPath, this.$param) 
    } else if (that.$path && typeof that.$path !== 'undefined') {
      // 没有邀请码页面或者不来自论坛，但有下一页
      helpers.goToPage(that.$path)
    } else if (that.$source && that.$source !== 'store') {
      // 没有下一页，来自于论坛
      helpers.redirectTo(that.$source, helpers.getToken())
    } else {
      // 来自于商城
      that.$multipass && helpers.redirectTo('store', that.$multipass)
    }
  }
}

new Setpsw()
