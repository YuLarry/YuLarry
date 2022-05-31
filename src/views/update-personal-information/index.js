require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')

const Update = require('scripts/updatePage.js')

const Personal = class {
  constructor () {
    this.$updateInfo = document.querySelector('.as-update-info')
    this.$parent = this.$updateInfo

    this.$getPersonalInfoForm = this.$parent.querySelector('.as-get-personal-info-form')
    this.$submitPersonalInfoForm = this.$parent.querySelector('.as-submit-personal-info-form')
    this.$form = this.$submitPersonalInfoForm
    this.$birthday = this.$form && this.$form.querySelector('.as-birthday')
    this.init()
  } 
  init () {
    this.getPersonalInfo()
    this.renderParams()
    this.handleBirth()
    this.submitInfo()
  }
  getPersonalInfo() {
    var that = this
    let form = this.$getPersonalInfoForm && new Form(this.$getPersonalInfoForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          that.renderInfo(response.data)
        }
      },
      fail: function (response) {
        if(response.status_code === 500) {
          page.redirect()
        }
      }
    })
    this.$getPersonalInfoForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }
  renderParams() {
    var that = this
    this.ifNeedMultipass = this.$submitPersonalInfoForm.querySelector('.as-need-multipass-param')
    this.$changeUser = helpers.getParams('change')
    if (this.$changeUser) {
      this.ifNeedMultipass.value = '1'
    }
  }
  renderInfo(data) {
    var that = this
    const arr = {}
    // 铺平
    Object.keys(data).forEach(function(key) {
      if (key === 'profile') {
        Object.keys(data.profile).forEach(function(param) {
          arr[param] = data.profile[param]
        })
      } else {
        arr[key] = data[key]
      }
    })
    console.log(arr)
    this.renderForm(arr)
    this.renderBirth()
  }
  renderForm(arr) {
    // 遍历表单
    var that = this
    for (let i = this.$form.elements.length - 1; i >= 0; i = i - 1) {
      if (this.$form.elements[i].name === '') {
        continue
      }
      switch (this.$form.elements[i].nodeName){
        case 'INPUT': 
          switch (this.$form.elements[i].type) {
            case 'text':
            case 'email':
            case 'hidden':
              Object.keys(arr).forEach(function(key) {
                if (key === that.$form.elements[i].dataset.name) {
                  that.$form.elements[i].value = arr[key]
                }
              })
              break
            case 'radio':
              if (arr.gender) {
                if (that.$form.elements[i].value === arr.gender) {
                  that.$form.elements[i].checked = true
                }
              }
              break
          }
          break
        case 'SELECT':
          if (arr.country) {
            if (that.$form.elements[i].dataset.name === 'country') {
              that.$form.elements[i].value = arr.country
            } else {
              that.$form.elements[i].value = 'gl'
            }
          }  
          break
      } 
    }
  }
  renderBirth() {
    var that = this
    if (!this.$birthday) return
    let birthStr = this.$birthday.value
    if(!birthStr) return
    let birthArr = birthStr.split('-')
    this.$form.querySelector('.as-year').value = birthArr[0]
    this.$form.querySelector('.as-month').value = birthArr[1]
    this.$form.querySelector('.as-day').value = birthArr[2]
  }
  handleBirth() {
    var that = this
    let year = this.$form.querySelector('.as-year').value
    let month = this.$form.querySelector('.as-month').value
    let day = this.$form.querySelector('.as-day').value
    let birth = year + '-' + month + '-' + day
    this.$birthday.value = birth
  }
  submitInfo() {
    var that = this
    // 设置用户名需要认证
    let form = this.$submitPersonalInfoForm && new Form(this.$submitPersonalInfoForm, {
      handleData: function() {
        that.handleBirth()
      },
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          let $token = response.data.token
          let $multipass = response.data.multipass
          console.log($multipass)
          $token && helpers.setToken(response.data.token)
          $multipass && helpers.setMultipass($multipass)
          new Update(that.$parent)
        }
      },
      fail: function (response) {
        if (!form) return
        this.showFormError(that.$submitPersonalInfoForm.querySelector('.as-invalid-error'))     
      }
    })
  }
}


// 页面流相关功能
const Page = class {
  constructor () {
    this.$page = document.querySelector('.as-update-info')
    if (this.$page) {
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
      this.redirect()
    } else {
      // 已登录的话则初始化页面
      document.body.classList.remove('invisible')
      new Personal()
    }
  }
  redirect() {
    var that = this
    // 从其他系统登出，没有登录跳转至登录页面
    // 添加redirect_to参数
    let currentUrl = window.self.location.origin + window.self.location.pathname
    let params = {
      'redirect_to': currentUrl
    }
    helpers.goToPage(this.$login, params)
  }
}
const page = new Page()
