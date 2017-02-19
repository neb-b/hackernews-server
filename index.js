'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const Promise = require('bluebird')
const morgan = require('morgan')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const redis = require('redis')
const PORT = process.env.PORT || 3000
const REDIS_PORT = process.env.REDIS_URL || 6379
const client = redis.createClient(REDIS_PORT)

app.use((req, res, next) => {
  req.io = io
  next()
})

app.use((req, res, next) => {
  const newRequest = () => {
    const io = req.io
    return new Promise((resolve, reject) => {
      client.hget('hackernews', 'requests', (err, value) => {
        if (err) {
          console.log("error!", err)
          reject(err)
        }

        const newTotal = value ? parseInt(value) + 1 : 1

        client.hset('hackernews', 'requests', newTotal, (err, result) => {
          if (err) {
            console.log('error initializing redis', err)
            reject(err)
          }

          console.log('emitting new total', newTotal)
          io.emit('request', newTotal)
          resolve()
        })
      })
    })
  }

  if (req.path !== '/dashboard') {
    newRequest()
      .then(next)
  } else {
    next()
  }
})

app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/stories', require('./routes/stories'))
app.use('/comments', require('./routes/comments'))
app.get('/dashboard', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)))

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})

io.on('connection', (socket) => {
  console.log('connected to browser...')
  client.hget('hackernews', 'requests', (err, value) => {
    io.emit('request', value)
  })
})

client.on('connect', () => {
  console.log('connected to redis...')
})
