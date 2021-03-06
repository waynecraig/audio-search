const https = require('https')
const crypto = require('crypto')
const config = require('./wx-config.js')

const appId = config.appId
const key = config.appSecrete

const fetchJSON = url => new Promise((resolve, reject) => {
  https.get(url, res => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
  
    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      res.resume();
      reject(error.message)
      return;
    }
  
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        resolve(parsedData)
      } catch (e) {
        console.error(e.message);
        reject(e.message)
      }
    });

  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    reject(e.message)
  });
})

const CACHE = {
  token: {data: '', expireTime: 0},
  ticket: {data: '', expireTime: 0}
}

const getAccessToken = () => {
  if (CACHE.token.data && CACHE.token.expireTime - 10000 > Date.now()) {
    return Promise.resolve(CACHE.token.data)
  } else {
    return fetchJSON(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${key}`)
      .then(json => {
        if (json.access_token) {
          CACHE.token.data = json.access_token
          CACHE.token.expireTime = json.expires_in * 1000 + Date.now()
          return json.access_token
        } else {
          return Promise.reject('no access_token')
        }
      })
  }
}

const getTicket = token => {
  if (CACHE.ticket.data && CACHE.ticket.expireTime - 10000 > Date.now()) {
    return CACHE.ticket.data
  } else {
    return fetchJSON(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`)
      .then(json => {
        if (json.ticket) {
          CACHE.ticket.data = json.ticket
          CACHE.ticket.expireTime = json.expires_in * 1000 + Date.now()
          return json.ticket
        } else {
          return Promise.reject('no ticket')
        }
      })
  }
}

const randomstr = () => {
  return Math.floor(Math.random() * 1000000) + ''
}

const sign = (ticket, nonceStr, timestamp, url) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(`jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`);
  return shasum.digest('hex')
}

const getSign = url => {
  return getAccessToken().then(getTicket).then(ticket => {
    const nonceStr = randomstr();
    const timestamp = Date.now();
    const signature = sign(ticket, nonceStr, timestamp, url)
    return {
      appId, timestamp, nonceStr, signature, jsApiList: ['scanQRCode']
    }
  }).catch(e => {
    console.error(e)
  })
}

module.exports.getSign = getSign