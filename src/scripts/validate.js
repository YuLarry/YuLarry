const ValidateForm = class {
  constructor ($parent) {
    this.$validInputWrap = $parent.querySelectorAll('.as-form-input-wrap')
    this.$validInput = this.$validInputWrap.querySelectorAll('.as-form-input')
    this.$errorTips = this.$validInputWrap.querySelector('.as-error-tips')
  
    this.init()
  }
  
  init () {
    this.triggerError()
  }
  
  triggerError () {
    this.$validInput && this.$validInput.addEventListener('focus', () => {
      this.hideError(this.$validInput, this.$errorTips)
    })
    this.$validInput && this.$validInput.addEventListener('blur', () => {
      let status = this.validateForm(this.$validInput)
      if (!status){
        this.showError(this.$validInput, this.$errorTips)
      }
    })
  }
  hideError ($dom, $tips) {
    $dom.classList.remove('is-invalid')
    $tips && $tips.classList.add('d-none')
  }
  showError ($dom, $tips) {
    $dom.classList.add('is-invalid')
    $tips && $tips.classList.remove('d-none')
  }
  validateForm ($dom) {
    const val = $dom.value
    const pattern = $dom.pattern
    const regx = pattern && new RegExp(pattern) || undefined
    if (val.length == 0) {
      return true
    }
    if (regx && !regx.test(val)) {
      return false
    }
    return true
  }
}

module.exports = ValidateForm
