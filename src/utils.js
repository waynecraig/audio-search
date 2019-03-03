import config from './config'

export function getFieldData(obj, field, attr) {
  return obj[field] && obj[field].und && obj[field].und[0] && obj[field].und[0][attr] || ''
}

export function getUrlParams() {
  return location.search.replace(/^\?/, '').split('&')
    .map(p => p.split('='))
    .reduce((pre, cur) => {
      pre[cur[0]] = decodeURIComponent(cur[1])
      return pre
    }, {})
}

export function text(lang, t) {
  if (lang === 'en') {
    return t
  }
  return config.zhText[t] || t
}