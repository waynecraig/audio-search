const http = require('http')
const wx = require('./wx')
const querystring = require('querystring')

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  const p = req.url.replace(/\?.*$/, '')
  if (p !== '/') {
    return res.end(JSON.stringify({code:1}))
  }
  const q = req.url.replace(/^.*\?/, '').replace(/\#.*$/, '')
  const obj = querystring.parse(q)
  const url = obj && obj.u
  if (!url) {
    return res.end(JSON.stringify({code:2}))
  }
  wx.getSign(url).then(conf => {
    res.end(JSON.stringify({code:0, conf}))
  }).catch(e => {
    res.end(JSON.stringify({code:3}))
  })
}).listen(9090, '127.0.0.1', () => {
  console.log('ws Svr is setup')
})