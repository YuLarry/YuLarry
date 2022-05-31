const helpers = require('scripts/helpers.js')

const Links = class{
  constructor () {
    this.$links = document.querySelectorAll('.as-update-link')
    this.init()
  }
  init () {
    this.updateLinks()
  }
  updateLinks() {
    var that = this
    that.$links && Array.prototype.map.call(that.$links, (link) => {
      link.href = helpers.getUrl(link.dataset.link)
    })
  }
}

module.exports = Links