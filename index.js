'use strict'
const bodyParser = require('body-parser')
const axios = require('axios')
const morgan = require('morgan')
const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()
const server = require('http').Server(app)

// app.use(express.static('watch'))
// const watchNode = require('./watch')
// const dashboardConnection = watchNode.createConnection(server)
// const options = {
//   dashboardConnection,
//   dashboardPath: '/dashboard'
// }
// app.use(watchNode.watch.bind(options))

app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/stories', require('./routes/stories'))
app.use('/comments', require('./routes/comments'))
app.use('/saved', require('./routes/saved'))

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
