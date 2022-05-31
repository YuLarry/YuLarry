var serialize = require('./serialize.js')
var ajax = require('./helpers.js').ajax

function Form ($form, options) {
  if (!$form) return
  this.$form = $form
  this.options = options || {}
  this.$submit = this.$form.querySelector('.as-submit')
  this.$error = this.$form.querySelector('.as-form-error')
  this.$tips = this.$form.querySelector('.as-form-tips')

  this.init()
}

Form.prototype = {
  constructor: Form,
  init:
    function () {
      var that = this;
      (typeof this.options.init === 'function') && this.options.init.call(this) 
      this.$form.onsubmit = function (event) {
        event = event || window.event

        event.preventDefault()
        event.stopPropagation()

        if (!that.validate()) return false
        // 运行自定义的校验函数
        if ((typeof that.options.validate === 'function') && !that.options.validate.call(that)) return false

        that.freeze()
        var param = serialize(that.$form)
        var ajaxOptions = {
          method: that.$form.method.toUpperCase(),
          url: that.$form.action,
          param: param,
          done:
            function (response) {
              (typeof that.options.done === 'function') && that.options.done.call(that, response)
            },
          fail:
            function (response) {
              (typeof that.options.fail === 'function') && that.options.fail.call(that, response)
            },
          always:
            function (response) {
              // that.unfreeze()
            }
        }
        ajaxOptions.needAuthorization = that.$form.dataset.needAuthorization === 'true' ? true : false  
        
        ajax(ajaxOptions)
 
        return false
      }
      this.$form.addEventListener('input', function () {
        that.clearErrorMessage()
      })
    },
  validate:
    function () {
      var valid = true
      var fields = this.fields()
      // console.log(fields)
      for (var key in fields) {
        var field = fields[key]
        // 验空 或 根据 data-regx 指定的正则表达式进行验证 或checkbox未被勾选
        if ((field.required && !field.value) || (field.regx && !field.regx.test(field.value)) ) {
          field.$node.classList.add('is-invalid')
          field.$error && field.$error.classList.remove('d-none')
          valid = false
        }
        // 验证checkbox是否被勾选
        if (field.type === 'checkbox' && field.required && !field.checked) {
          field.$error && field.$error.classList.remove('d-none')
          valid = false
        }
      }
      return valid
    },
  fields:
    function () {
      var $inputs = Array.prototype.concat(Array.prototype.slice.call(this.$form.querySelectorAll('input')), Array.prototype.slice.call(this.$form.querySelectorAll('textarea')))
      var fields = {}
      for (var i = 0; i < $inputs.length; i++) {
        var $input = $inputs[i]
        if (!$input.name) continue
        var $tips, $error
        var siblings = $input.parentNode.children
        for (var j = 0; j < siblings.length; j++) {
          var sibling = siblings[j]
          if (sibling.classList.contains('as-field-tips')) $tips = sibling
          if (sibling.classList.contains('as-field-error')) $error = sibling
        }

        fields[$input.name] = {
          regx: $input.pattern && new RegExp($input.pattern),
          $node: $input,
          required: !!$input.required,
          value: $input.value,
          type: $input.type,
          checked: $input.checked,
          $tips: $tips,
          $error: $error
        }
      }
      return fields
    },

  freeze:
    function () {
      var that = this
      var fields = this.fields()
      for (var key in fields) {
        fields[key].$node.disabled = true
      }
      if (this.$submit) this.$submit.disabled = true
      // this.$submit.classList.add('debuzz')

      setTimeout(function () {
        that.unfreeze()
      }, 3000)
    },


  unfreeze:
    function () {
      var fields = this.fields()
      for (var key in fields) {
        fields[key].$node.disabled = false
      }
      if (this.$submit) this.$submit.disabled = false 
      // this.$submit.classList.remove('debuzz')
    },
  clearErrorMessage:
    function () {
      this.$error && this.$error.classList.add('d-none')
      var fields = this.fields()
      for (var key in fields) {
        var field = fields[key]
        field.$error && field.$error.classList.add('d-none')
        field.$node.classList.remove('is-invalid')
      }
    },
  showFormError:
    function (errorDom) {
      if (this.$error && errorDom) this.$error.innerText = errorDom.innerText
      if (this.$error) this.$error.classList.remove('d-none')
    }
}

module.exports = Form