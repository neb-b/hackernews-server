'use strict'
const bodyParser = require('body-parser')
const axios = require('axios')
const morgan = require('morgan')
const PORT = process.env.PORT || 3000

const express = require('express')
const app = express()
const server = require('http').Server(app)
const watch = require('./watch')
const dashboardConnection = watch.init(server)
const options = {
  dashboardPath: '/dashboard'
}
app.use(watch.dashboard.bind(dashboardConnection, options))

app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/stories', require('./routes/stories'))
app.use('/comments', require('./routes/comments'))

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
