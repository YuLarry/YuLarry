const _ = require('lodash')

module.exports = {
  layout: 'default',
  computed: data => data.pagination ? data.pagination.alias : '',
  title: data => {
    const key = _.get(data, 'pagination.alias')
    // console.log(data[key].title)
    // console.log((typeof data[key] === 'undefined') ? data.title : data[key].title)
    const content = data[key] || {}
    return content.title || data.title
  },
  locale: data => {
    const key = _.get(data, 'pagination.alias')
    const content = data[key] || {}
    return {
      lang: _.get(content, '_meta.lang')
    }
  },
  t: data => data.locales[data.locale.lang] || {}
}
