// let bus = require('@assets/scripts/events.js')
const Cookie = require('js-cookie')
/**
 * 请求头可能需要Authorization
 */
function ajax (options) {
  if (!options) return

  let xhr = new XMLHttpRequest()
  xhr.open(options.method, options.url)
  // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*')

  if (options.needAuthorization) {
    var token = getToken()
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    } else {
      goToPage('login/')
      return
    }
  }

  xhr.withCredentials = true
  xhr.onload = function () {
    (typeof options.always === 'function') && options.always()

    if (xhr.status === 200 && xhr.responseText) {
      var response = JSON.parse(xhr.responseText)

      if (!response.error) {
        if (typeof options.done === 'function') options.done(response)
      } else if (response.error === 403) {
        // 需要登录, 发出请求登录事件
        // (typeof options.fail === 'function') && options.fail(response)
        // emit('sign-in-required')
      } else if (response.error) {
        if (typeof options.fail === 'function') options.fail(response)
      }
    } else if (xhr.responseText) {
      var response = JSON.parse(xhr.responseText)
      if (typeof options.fail === 'function') options.fail(response)
    }

    // bus.emit(bus.EVENT.HIDE_PROGRESS)
  }

  xhr.addEventListener('progress', function (event) {
    if (event.lengthComputable) {
      let percentComplete = event.loaded / event.total
      console.log(percentComplete)
    }
  }, false)

  // if (options.method.toUpperCase() === 'GET') {
  //   // 如果是 get 请求,无视参数直接发送
  //   xhr.send()
  // } else {
  //   // 如果是 post 请求, 转化下
  //   xhr.send(decodeURI(options.param))
  // }
  xhr.send(decodeURI(options.param))

  // bus.emit(bus.EVENT.SHOW_PROGRESS)
}

/**
 *
 * @param {*} a JSON 数据
 * @description 将 json 格式的数据转化为 formdata
 */
function param (a) {
  let s = []
  let add = function (k, v) {
    v = typeof v === 'function' ? v() : v
    v = v === null ? '' : v === undefined ? '' : v
    s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v)
  }
  var buildParams = function (prefix, obj) {
    let i, len, key

    if (prefix) {
      if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          buildParams(
            prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
            obj[i]
          )
        }
      } else if (String(obj) === '[object Object]') {
        for (key in obj) {
          buildParams(prefix + '[' + key + ']', obj[key])
        }
      } else {
        add(prefix, obj)
      }
    } else if (Array.isArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        add(obj[i].name, obj[i].value)
      }
    } else {
      for (key in obj) {
        buildParams(key, obj[key])
      }
    }
    return s
  }

  return buildParams('', a).join('&')
}

// 存储JWT
function setToken ($token) {
  Cookie.set('login_token', $token, { expires: 1 })
}

// 获取JWT
function getToken () {
  return Cookie.get('login_token')
}

// 删除JWT
function removeToken () {
  Cookie.remove('login_token')
}

// 存储Multipass
function setMultipass ($token) {
  Cookie.set('mtp', $token, { expires: 1 })
}

// 获取Multipass
function getMultipass () {
  return Cookie.get('mtp')
}

// 删除Multipass
function removeMultipass () {
  Cookie.remove('mtp')
}

// 重定向至callback链接
function redirectTo ($source, $token) {
  let url = spliceParams($source, $token)
  window.location.href = url
}

// 拼接url
function spliceParams ($source, $token) {
  let currentUrl = new URL(window.self.location.href)
  let redirect_to = getParams('redirect_to')
  let change = getParams('change')
  let return_to = getParams('return_to')
  let callback = getParams('callback')
  if (redirect_to && change) {
    if ($source && callback && isAllowed(callback)) {
      var redirectUrl = redirect_to + '?source=' + $source + "&callback=" + callback + "&change=" + change
      if (return_to && isAllowed(return_to)) {
        var redirectUrl = redirect_to + '?source=' + $source + "&callback=" + callback + "&change=" + change + "&return_to" + return_to
      }
    }
    else {
      var redirectUrl = redirect_to
    }
  } else {
    if ($source && callback && isAllowed(callback)) {
      if ($token) {
        if ($source !== 'store') {
          if (return_to && isAllowed(return_to)) {
            var redirectUrl = callback + "?token=" + $token + "&return_to=" + return_to
          } else {
            var redirectUrl = callback + "?token=" + $token
          }
        } else { 
          var redirectUrl = callback + "/multipass/" + $token
        }
      } else if (currentUrl.pathname.endsWith('/logout/')){
        var redirectUrl = callback
      } else {
        var redirectUrl = getUrl('login/')
      }
    } else {
      if ($token) {
        var redirectUrl = "https://iprototype.myshopify.com/"
      } else {
        var redirectUrl = "https://iprototype.myshopify.com/"
      }
    }
  }

  
  return redirectUrl
}
// 查询参数
function getParams (param) {
  return searchParams().get(param)
}

// 判断是否是白名单域名
function isAllowed (url) {
  let link = new URL(url)
  if (link.host.endsWith('.myshopify.com')) {
    return true
  } else {
    return false
  }
}

// 获取当前链接的searchParams
function searchParams () {
  let currentUrl = new URL(window.self.location.href)
  return new URLSearchParams(currentUrl.search)
}

// 跳转至下个页面（path, param）
function goToPage(path, param) {
  let url = getUrl(path, param)
  window.location.href = url
}

function getUrl(path, param) {
  let search = searchParams()
  // 遍历参数
  for (key in param) {
    if (key === 'email') {
      search.set(key, window.btoa(param[key]))
    } else {
      search.set(key, param[key])
    } 
  }
  let origin = new URL(window.self.location.origin)
  if (path.includes('https://')) {
    var url = path + '?' + search
  } else {
    var url = origin + path + '?' + search
  }
  return url
}

const Component = {
  setup:
    function (options) {
      this.options = options
      typeof options.beforeCreate === 'function' && options.beforeCreate.call(this)
      this._create()
      typeof options.created === 'function' && options.created.call(this)
    },
  update:
    function () {
      typeof this.options.beforeUpdate === 'function' && this.options.beforeUpdate()
      this._updated()
      typeof this.options.updated === 'function' && this.options.updated()
    },
  destroy:
    function () {
      typeof this.options.beforeDestroy === 'function' && this.options.beforeDestroy()
      this._destory()
      typeof this.options.destoryed === 'function' && this.options.destoryed()
    }
}

module.exports = {
  ajax: ajax,
  param: param,
  setToken: setToken,
  getToken: getToken,
  removeToken: removeToken,
  setMultipass: setMultipass,
  getMultipass: getMultipass,
  removeMultipass: removeMultipass,
  redirectTo: redirectTo,
  getParams: getParams,
  goToPage: goToPage,
  getUrl: getUrl,
  Component: Component
}
