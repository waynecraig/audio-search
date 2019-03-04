export default {
  lang: 'en', // en or zh
  headBar: {
    left: {
      icon: 'list',
      url: 'http://x.moca-yinchuan.com/audio/#/exhibition/audios/46'
    },
    right: {
      icon: 'qrCode',
    }
  },
  keyboard: {
    rn: 4,
    cn: 4,
    height: (window.innerHeight - 100) * 0.5 * 0.25,
    keys: [
      { text: '1', id: '1', r: 1, c: 1 },
      { text: '2', id: '2', r: 1, c: 1 },
      { text: '3', id: '3', r: 1, c: 1 },
      { icon:'trash', id: 'c', r: 1, c: 1 },
      { text: '4', id: '4', r: 1, c: 1 },
      { text: '5', id: '5', r: 1, c: 1 },
      { text: '6', id: '6', r: 1, c: 1 },
      { icon: 'delete', id: 'b', r: 1, c: 1 },
      { text: '7', id: '7', r: 1, c: 1 },
      { text: '8', id: '8', r: 1, c: 1 },
      { text: '9', id: '9', r: 1, c: 1 },
      { text: '0', id: '0', r: 1, c: 1 },
      { text: 'PLAY', id: 'p', r: 1, c: 4 },
    ]
  },
  zhText: {
    'PLAY': '播放',
    'MOCA Yinchuan': '银川当代美术馆',
    'Audio Guide System': '语音导览系统',
    'No Result!': '未搜索到作品',
    'Searching...': '搜索中...',
    'Please Enter Audio Number': '请输入作品编号',
    'Number Too Large!': '超过最大编号限制',
  }
}