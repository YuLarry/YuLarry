var serialize = require('./serialize.js')
var ajax = require('./helpers.js').ajax

var Pristine = require('./pristine.js')
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
        

        if (!that.validate(that.$form)) return false
        // 运行自定义的校验函数
        if ((typeof that.options.validate === 'function') && !that.options.validate.call(that)) return false
        // 自定义处理数据
        if (typeof that.options.handleData === 'function') {
          that.options.handleData.call(that)
        }

        // 如果有param参数则自定义param
        if (typeof that.options.params === 'object') {
          var param = that.options.params
        } else {
          var param = serialize(that.$form)
        }

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

        // 运行异步函数
        if (typeof that.options.async === 'function') {
          that.options.async.call(that).then(() => {
            that.freeze()
            ajax(ajaxOptions)
          }).catch((response) => {
            if ((typeof that.options.catch === 'function') && !that.options.catch.call(that, response)) return false
          })
        } else {
          that.freeze() 
          ajax(ajaxOptions)
        }
        return false
      }
      this.$form.addEventListener('input', function () {
        that.clearErrorMessage()
      })
    },
  validate:
    function (form) {
      let defaultConfig = {
        // class of the parent element where the error/success class is added
        classTo: 'form-pristine',
        classToInput: 'input-pristine',
        errorClass: 'is-invalid',
        successClass: 'has-success',
        // class of the parent element where error text element is appended
        errorTextParent: 'form-pristine',
        errorTextTag: 'div',
        // class of the error text element
        errorTextClass: 'invalid-feedback'
      }
      var valid = new Pristine(form, defaultConfig).validate()
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
      // var fields = this.fields()
      // for (var key in fields) {
      //   var field = fields[key]
      //   field.$error && field.$error.classList.add('d-none')
      //   field.$node.classList.remove('is-invalid')
      // }
    },
    
  showFormError:
    function (errorDom) {
      if (this.$error && errorDom) this.$error.innerText = errorDom.innerText
      if (this.$error) this.$error.classList.remove('d-none')
    }
  // showFormError:
  //   function ($errorTips) {
  //     let message = $errorTips[Object.keys($errorTips)[0]] 
  //     if (this.$error && message) this.$error.innerText = message
  //     this.$error.classList.remove('d-none')
  //   }
}

module.exports = Form