const axios = require('axios')
const ROOT_URL = 'https://hacker-news.firebaseio.com/v0'

module.exports = function fetchItems (ids) {
  const fetchComment = (id) => (
    axios(`${ROOT_URL}/item/${id}.json`)
    .then((comment) => {
      return comment.data
    })
    .catch((err) => console.log('err', err))
  )

  return Promise.all(ids.map(fetchComment))
    .then((comments) => {
      return comments
    })
}
