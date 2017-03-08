(function loadDashboard() {
  const connectToServer = () => {
    const socket = io('https://hacker-news-server.herokuapp.com')
    // const socket = io('http://localhost:3000')
    socket.on('request', (requestData) => {
      const data = JSON.parse(requestData)

      const totalRequests = data.totalRequests
      const requestsLastHour = data.requestsLastHour
      updateDashboard(totalRequests, requestsLastHour)
    })
  }

  const updateDashboard = (total, totalLastHour) => {
    updateBeacon()
    updateRequestsPerHour(totalLastHour)
    updateTotal(total)
  }

  const updateBeacon = () => {
    function removeActiveClass(e) {
      if (e.propertyName !== 'background-color') return
      this.classList.remove('active')
    }

    const beacon = document.querySelector('#beacon')
    beacon.addEventListener('transitionend', removeActiveClass)
    beacon.classList.add('active')
  }

  const updateRequestsPerHour = (total) => {
    const requestsPerHour = document.querySelector('#rph')
    requestsPerHour.innerHTML = total
  }

  const updateTotal = (total) => {
    const totalSpan = document.querySelector('#total')
    totalSpan.innerHTML = total
  }

  connectToServer()
})()
