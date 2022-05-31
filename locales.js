require('dotenv').config()
const contentful = require('contentful')
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.CTFL_SPACE,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CTFL_ACCESSTOKEN
})

function format (data) {
  return data.items.map(function (item) {
    const locale = item
    // if (locale.default) locale.code = ''
    return locale
  })
}

module.exports = async () => {
  return client.getLocales()
    .then((response) => {
      // console.log(format(response))
      return format(response)
    })
    .catch(console.error)
}
