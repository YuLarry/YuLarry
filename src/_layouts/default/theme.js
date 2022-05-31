import { Toast, Modal } from 'bootstrap/dist/js/bootstrap.esm'
var hogan = require('hogan.js')
var $message = document.getElementById('message-toast')

if ($message) {
  var toast = new Toast($message)

  document.addEventListener(bus.EVENT.SHOW_SIMPLE_MESSAGE, function (event) {
    var message = event.detail
    var $text = $message.querySelector('.as-toast-body')
    var $title = $message.querySelector('.as-toast-title')
    if ($text) $text.textContent = message && message.description
    if ($title) $title.textContent = message && message.title
    toast.show()
  })
  
}

// 可在触发器（如按钮）上将属性 data-toggle 改为 data-lazyload-toggle 可以触发懒加载逻辑，其对应的弹窗等可以懒加载
var lazyloadToggle = function (event) {
  var $target = event.target
  var id = $target.getAttribute('data-target') || $target.getAttribute('data-bs-target') || $target.getAttribute('href')
  var $tpl = id && document.querySelector(id + '-template')
  if ($tpl) {
    var engine = hogan.compile($tpl.innerHTML)
    if (engine) $tpl.outerHTML = engine.render()
    $target.setAttribute('data-toggle', $target.getAttribute('data-lazyload-toggle'))
    $target.setAttribute('data-bs-toggle', $target.getAttribute('data-lazyload-toggle'))
    var nextTick = setTimeout(function () {
      clearTimeout(nextTick)
      $target.click()
    })
    $target.removeEventListener('click', lazyloadToggle)
  }
}


document.addEventListener('click', function (event) {
  var $target = event.target
  if ($target.getAttribute('data-lazyload-toggle') && !$target.getAttribute('data-toggle')) {
    lazyloadToggle(event)
    event.preventDefault()
  }
  if ($target.getAttribute('data-lazyload-toggle') && !$target.getAttribute('data-bs-toggle')) {
    lazyloadToggle(event)
    event.preventDefault()
  }
})
