const Promise = require('bluebird')
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL || 6379)
const path = require('path')
const socketIO = require('socket.io')
const MS_IN_HOUR = 3600000

const createDashboard = (results) => {
  const totalRequests = JSON.parse(results[0]) || 0
  const requestsLastHour = results[1] || 0

  return {
    totalRequests, requestsLastHour
  }
}

exports.createConnection = function(server) {
  console.log('\nSetting up dashboard... \n');

  const io = socketIO(server)
  const now = Date.now()
  const oneHourPrior = now - MS_IN_HOUR

  io.on('connection', (socket) => {
    console.log('connected to browser...')

    const now = Date.now()
    const oneHourPrior = now - MS_IN_HOUR

    client.multi()
      .zscore('requests', 'total')
      .zcount('history', oneHourPrior, now)
      .exec((err, results) => {
        if (err) return reject(err)

        const dashboard = createDashboard(results)
        io.emit('request', JSON.stringify(dashboard))
      })
  })
  return io
}

exports.watch = function(req, res, next) {
  const options = this
  const io = options.dashboardConnection
  const dashboardPath = options.dashboardPath

  const emit = (key, data) => {
    io.emit(key, JSON.stringify(data))
  }

  const updateRedis = () => {
    const now = Date.now()
    const oneHourPrior = now - MS_IN_HOUR

    return new Promise((resolve, reject) => {
      client.multi()
        .zscore('requests', 'total')
        .zincrby('requests', 1, 'total')
        .zcount('history', oneHourPrior, now)
        .zadd('history', now, now)
        .exec((err, results) => {
          if (err) return reject(err)

          const totalRequests = JSON.parse(results[0]) + 1 || 1
          const requestsLastHour = results[2] + 1 || 1

          const dashboardData = {
            totalRequests, requestsLastHour
          }

          resolve(dashboardData)
        })
    })
  }

  if (req.path === dashboardPath) {
    res.sendFile(path.join(`${__dirname}/watch.html`))
  } else {
    updateRedis()
      .then((dashboard) => emit('request', dashboard))
      .then(next)
      .catch((err) => {
        console.log("error", err)
        next()
      })
  }
}

client.on('connect', () => {
  console.log('connected to redis...')
})
