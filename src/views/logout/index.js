require('@layouts/default/theme.js')
const Form = require('scripts/form.js')
const helpers = require('scripts/helpers.js')

const Logout = class {
  constructor () { 
    this.$source = helpers.getParams('source')
    this.init()
  }
  
  init() {
    this.logout()
  }
  logout() {
    var that = this
    helpers.removeToken()
    helpers.removeMultipass()
    helpers.redirectTo(that.$source)
  }
}

new Logout()
