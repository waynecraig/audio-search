import { div, span } from "@cycle/dom";
import xs from "xstream";
import '../style/info-bar.sass'
import dropRepeats from 'xstream/extra/dropRepeats'

const urlPrefix = 'http://x.moca-yinchuan.com/audio/admin/?q=service/node/'
const urlPostfix = '.json'

function intent(input$, http$) {
  const cmds = {
    'c': 'CLEAR',
    'b': 'DELETE',
    'p': 'PLAY'
  }
  return xs.merge(
    input$.map(input => ({
      type: cmds[input.payload] || (/^\d$/.test(input.payload) ? 'TYPE' : 'NONE'),
      payload: input.payload
    })),
    http$.select('node').map((response$) => {
      const no = response$.request.url.replace(urlPrefix, '').replace(urlPostfix, '')
      return response$.replaceError(() => xs.of({body: {nid: no}}))
    }).flatten().map(res => {
      if (res.body.type === 'audio') {
        return {
          type: 'GET_DATA',
          payload: res.body
        }
      } else {
        return {
          type: 'GET_DATA',
          payload: {nid: res.body.nid}
        }
      }
    })
  )
}

function model(action$) {
  const typeReducer$ = action$
    .filter(a => a.type === 'TYPE')
    .map(action => function typeReducer(oldState) {
      const state = {}
      const no = `${oldState.no}${action.payload}`
      if (no.length > 6) {
        state.tip = '超过最大编号限制'
      } else {
        state.tip = ''
      }
      state.no = no.substr(0, 6)
      state.res = 0
      return state
    })
  
  const clearReducer$ = action$
    .filter(a => a.type === 'CLEAR')
    .map(action => function clearReducer(oldState) {
      return {no: '', tip: '', res: 0}
    })
  
  const deleteReducer$ = action$
    .filter(a => a.type === 'DELETE')
    .map(action => function deleteReducer(oldState) {
      return {no: oldState.no.substr(0, Math.max(0, oldState.no.length - 1)), tip: '', res: 0}
    })
    
  const playReducer$ = action$
    .filter(a => a.type === 'PLAY')
    .map(action => function playReducer(oldState) {
      if (oldState.res && oldState.no && oldState.tip) {
        return {no: '', tip: '', res: 0, play: oldState.res}
      } else {
        return oldState
      }
    })

  const getDataReducer$ = action$
    .filter(a => a.type === 'GET_DATA')
    .map(action => function getDataReducer(oldState) {
      if (action.payload && action.payload.nid === oldState.no) {
        return {no: oldState.no, tip: action.payload.title, res: action.payload}
      } else {
        return {no: oldState.no, tip: oldState.tip, res: oldState.res}
      }
    })

  return xs.merge(typeReducer$, clearReducer$, deleteReducer$, playReducer$, getDataReducer$)
    .fold((state, reducer) => reducer(state), {no: '', tip: '', res: 0})
}

function view(state$) {
  return state$.map(({no, tip, res}) => {
    const c = []
    if (no) {
      c.push(span('.no', [no]))
      if (!tip) {
        c.push(span('.tip', [res ? '未搜索到作品' : '搜索中...']))
      }
    }
    if (!no || tip) {
      c.push(span('.tip', [tip || '请输入作品编号']))
    }
    return div('.info-bar', c)
  })
}

function InfoBar(sources) {
  const action$ = intent(sources.Input, sources.HTTP)
  const state$ = model(action$)
  const vtree$ = view(state$)
  const noChange$ = state$.map(s => s.no).filter(a=>a).compose(dropRepeats()).map(no => ({
    url: `${urlPrefix}${no}${urlPostfix}`,
    category: 'node',
    method: 'GET'
  }))
  const canPlay$ = state$.map(a => a.no && a.tip && a.res).compose(dropRepeats())
  const play$ = state$.filter(a => a.play).map(a => a.play).compose(dropRepeats())
  return {
    DOM: vtree$,
    HTTP: noChange$,
    CanPlay: canPlay$,
    Play: play$,
  }
}

export default InfoBar