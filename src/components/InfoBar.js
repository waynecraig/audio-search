import { div, span } from "@cycle/dom";
import xs from "xstream";
import '../style/info-bar.sass'
import dropRepeats from 'xstream/extra/dropRepeats'
import { getFieldData, text } from '../utils'

const urlPrefix = 'http://moca-yinchuan.art/audio/admin/?q=service/node/'
const urlPostfix = '.json'

function intent(input$, http$, direct$) {
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
    }),
    direct$.map(d => ({type: 'DIRECT', payload: d}))
  )
}

function model(action$, changeLang$) {
  const typeReducer$ = action$
    .filter(a => a.type === 'TYPE')
    .map(action => function typeReducer(oldState) {
      const state = {}
      const no = `${oldState.no}${action.payload}`
      if (no.length > 6) {
        state.tip = text(oldState.lang, 'Number Too Large!')
      } else {
        state.tip = ''
      }
      state.no = no.substr(0, 6)
      state.res = 0
      state.auto = 0
      state.lang = oldState.lang
      return state
    })
  
  const clearReducer$ = action$
    .filter(a => a.type === 'CLEAR')
    .map(action => function clearReducer(oldState) {
      return {no: '', tip: '', res: 0, auto: 0, lang: oldState.lang}
    })
  
  const deleteReducer$ = action$
    .filter(a => a.type === 'DELETE')
    .map(action => function deleteReducer(oldState) {
      return {no: oldState.no.substr(0, Math.max(0, oldState.no.length - 1)), tip: '', res: 0, auto: 0, lang: oldState.lang}
    })
    
  const playReducer$ = action$
    .filter(a => a.type === 'PLAY')
    .map(action => function playReducer(oldState) {
      if (oldState.res && oldState.no && oldState.tip) {
        return {no: '', tip: '', res: 0, play: oldState.res, auto: 0, lang: oldState.lang}
      } else {
        return oldState
      }
    })

  const getDataReducer$ = action$
    .filter(a => a.type === 'GET_DATA')
    .map(action => function getDataReducer(oldState) {
      if (action.payload && action.payload.nid === oldState.no) {
        if (oldState.auto) {
          return {no: '', tip: '', res: 0, play: action.payload, auto: 0, lang: oldState.lang}
        } else {
          const tip = oldState.lang === 'en' ? getFieldData(action.payload, 'field_title_en', 'value') : action.payload.title
          return {no: oldState.no, tip, res: action.payload, auto: 0, lang: oldState.lang}
        }
      } else {
        return {no: oldState.no, tip: oldState.tip, res: oldState.res, auto: 0, lang: oldState.lang}
      }
    })

  const directReducer$ = action$
    .filter(a => a.type === 'DIRECT')
    .map(action => oldState => {
      return {no: action.payload, tip:'', res: 0, auto: 1, lang: oldState.lang}
    })

  const changeLangReducer$ = changeLang$
    .map(lang => oldState => {
      return Object.assign({}, oldState, {lang})
    })

  return xs.merge(typeReducer$, clearReducer$, deleteReducer$, playReducer$, getDataReducer$, directReducer$, changeLangReducer$)
    .fold((state, reducer) => reducer(state), {no: '', tip: '', res: 0, auto: 0, lang: 'zh'})
}

function view(state$) {
  return state$.map(({no, tip, res, lang}) => {
    const c = []
    if (no) {
      c.push(span('.no', [no]))
      if (!tip) {
        c.push(span('.tip', [res ? text(lang, 'No Result!') : text(lang, 'Searching...')]))
      }
    }
    if (!no || tip) {
      c.push(span('.tip', [tip || text(lang, 'Please Enter Audio Number')]))
    }
    return div('.info-bar', c)
  })
}

function InfoBar(sources) {
  const action$ = intent(sources.Input, sources.HTTP, sources.DIRECT).remember()
  const state$ = model(action$, sources.LANG)
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