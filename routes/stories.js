'use strict'
require('dotenv').config()
const express = require('express')
const axios = require('axios')
const Promise = require('bluebird')
const Router = express.Router()
const _ = require('lodash')
const ROOT_URL = 'https://hacker-news.firebaseio.com/v0'
const cacheMgr = require('redis')
const REDIS_HASH = process.env.REDIS_HASH
const fetchItems = require('./fetch-items')

const fetchStory = (id) => {
  return (
    axios(`${ROOT_URL}/item/${id}.json`)
    .then((story) => story.data)
  )
}

const fetchStories = (endpoint, ids, savedIds = []) => {
  const length = ids.length
  const idsToFetch = ids.slice().splice(0,30).concat(savedIds)

  return Promise.all(idsToFetch.map(fetchStory))
    .then((allStories) => {

      const savedStories = allStories.slice(allStories.length - savedIds.length, allStories.length)
      const stories = allStories.slice(0, allStories.length - savedIds.length)
      return { savedStories, stories }
    })
}

Router.get('/:endpoint', (req, res) => {
  const endpoint = req.params.endpoint.toLowerCase()
  const query = req.query
  const savedIdsStr = query.savedStories
  let savedIds
  if (savedIdsStr) {
    savedIds = savedIdsStr.split(',')
  }

  const url = `${ROOT_URL}/${endpoint}.json`

  axios(url)
    .then(response => response.data)
    .then(storyIds => fetchStories(endpoint, storyIds, savedIds))
    .then((stories) => res.send(stories).status(200))
    .catch((err) => {
      res.send(err).status(409)
    })
})

module.exports = Router
