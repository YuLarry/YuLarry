const Visible = class{
  constructor () {
    this.$visibleWrap = document.querySelectorAll('.as-pwd-wrap')  
    this.init()
  }
  init () {
    this.addPwdVisibleEventListener()
  }
  addPwdVisibleEventListener() {
    var that = this
    that.$visibleWrap && Array.prototype.map.call(that.$visibleWrap, ($visibleWrap) => {
      let $visiblePwd = $visibleWrap.querySelector('.as-pwd-input')
      let $visibleControl = $visibleWrap.querySelector('.as-visible-control')

      $visibleControl && $visibleControl.addEventListener('click', function () {
        $visibleControl.classList.toggle('content-invisible')
        var typeAttr = document.createAttribute('type')
        if ($visibleControl.classList.contains('content-invisible')) {
          typeAttr.value = 'password'
        } else {
          typeAttr.value = 'text'
        }
        $visiblePwd && $visiblePwd.setAttributeNode(typeAttr)
      })
    })
  }
}

module.exports = Visible