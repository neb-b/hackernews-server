'use strict'
const express = require('express')
const axios = require('axios')
const Promise = require('bluebird')
const Router = express.Router()
const ROOT_URL = 'https://hacker-news.firebaseio.com/v0'
const fetchItems = require('./fetch-items')

Router.get('/', (req, res) => {
  const ids = req.query.comments.split(',')

  fetchItems(ids)
    .then((comments) => {
      res.send({comments}).status(200)
    })
    .catch((err) => res.send(err).status(409))
})

module.exports = Router
