'use strict'
const express = require('express')
const Promise = require('bluebird')
const Router = express.Router()
const fetchItems = require('./fetch-items')

Router.get('/', (req, res) => {
  const storiesString = req.query.stories
  const storyIds = storiesString.split(',')
  console.log('stories?', storyIds);

  fetchItems(storyIds)
    .then((stories) => {
      // reverse so most recent saved stories are at top
      res.send(stories).status(200)
    })
    .catch((err) => {
      console.log('error', err)
      return res.send(err).status(400)
    })
})

module.exports = Router
