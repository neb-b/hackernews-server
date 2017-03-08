(function loadDashboard() {
  const BREAKDOWN_DIAMETER = 300

  const connectToServer = () => {
    // const socket = io('https://hacker-news-server.herokuapp.com')
    const socket = io('http://localhost:3000')
    socket.on('request', (requestData) => {
      const data = JSON.parse(requestData)

      const totalRequests = data.totalRequests
      const requestsLastHour = data.requestsLastHour

      updateDashboard(data)
    })
  }

  const updateDashboard = (data) => {
    console.log('data', data);
    const {totalRequests, requestsLastHour, breakdown} = data
    updateBeacon()
    updateRequestsPerHour(requestsLastHour)
    updateTotal(totalRequests)
    updateBreakdown(breakdown)
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

  const updateBreakdown = (breakdown) => {
    // prepare data
    let dataSet = []
    for (let key in breakdown) {
      const piePiece = {label: key, count: breakdown[key]}
      dataSet.push(piePiece)
    }

    // create chart
    const radius = BREAKDOWN_DIAMETER / 2
    const color = d3.scaleOrdinal(d3.schemeCategory20b)
    const svg = d3.select('#requests-breakdown')
      .append('svg')
      .attr('height', BREAKDOWN_DIAMETER)
      .attr('width', BREAKDOWN_DIAMETER)
      .append('g')
      .attr('transform', 'translate(' + (radius) +  ',' + (radius) + ')');

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const pie = d3.pie()
      .value((d) => d.count)
      .sort(null)

    const path = svg.selectAll('path')
      .data(pie(dataSet))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label))
  }

  connectToServer()
})()
