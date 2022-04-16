import { div, h2, p, h } from "@cycle/dom";
import xs from "xstream";
import '../style/player.sass'
import { getFieldData, text } from '../utils'
import icons from '../icons'

const fileRoot = location.protocol + '//moca-yinchuan.art/audio/admin/sites/default/files/'

function intent(domSource, play$) {
  return xs.merge(
    play$.map(a => ({type: 'NEW_TASK', payload: a})),
  )
}

function model(action$, changeLang$, audio$) {
  const initState = { id: '', title: '', audio: '', image: '', author: '', lang: 'zh', data: null, playing: false }

  const newTaskReducer$ = action$
    .filter(a => a.type === 'NEW_TASK')
    .map(action => function(oldState){
      const a = action.payload
      const end = oldState.lang === 'en' ? '_en' : ''
      return {
        ...initState,
        id: a.nid, 
        title: end ? getFieldData(a, 'field_title' + end, 'value') : a.title, 
        audio: getFieldData(a, 'field_file' + end, 'uri').replace('public://', ''), 
        image: getFieldData(a, 'field_cover', 'uri').replace('public://', ''), 
        author: getFieldData(a, 'field_author' + end, 'value'),
        lang: oldState.lang,
        data: a,
      }
    })

  const changeLangReducer$ = changeLang$
    .map(lang => function(oldState){
      if (lang !== oldState.lang) {
        const s = Object.assign({}, oldState, {lang})
        if (s.data) {
          const a = s.data
          const end = s.lang === 'en' ? '_en' : ''
          s.title = end ? getFieldData(a, 'field_title' + end, 'value') : a.title
          s.audio = getFieldData(a, 'field_file' + end, 'uri').replace('public://', '')
          s.image = getFieldData(a, 'field_cover', 'uri').replace('public://', '')
          s.author = getFieldData(a, 'field_author' + end, 'value')
        }
        return s
      }
      return oldState
    })

  const audioReducer$ = audio$
    .map(action => function(oldState) {
      switch(action.type) {
        case 'play':
          return {
            ...oldState,
            playing: true,
          }
        case 'pause':
          return {
            ...oldState,
            playing: false,
          }
      }
    })

  return xs.merge(newTaskReducer$, changeLangReducer$, audioReducer$)
    .fold((state, reducer) => reducer(state), initState)
}

function view(state$) {
  return state$.map(({id, title, audio, image, author, lang, playing}) => {
    const style = {
      'background-color': '#00bcb4'
    }
    if (image) {
      style['background-image'] = `url(${fileRoot}${image})`
    }
    const line1 = id ? `${id}. ${title}` : text(lang, 'MOCA Yinchuan')
    const line2 = id ? (author ? `${text(lang, 'Author')}: ${author}` : '') : text(lang, 'Audio Guide System')
    const children = [
      div('.audio-info', [
        h2([line1]),
        p([line2]),
      ]),
      div('.audio-ctrl', [
        div('.player', [
          div(playing ? '.pause-icon' : '.play-icon', [
            playing ? icons.pause() : icons.play(),
          ])
        ]),
        /*h('audio', {attrs: {
          src: audio ? `${fileRoot}${audio}` : undefined,
          controls: true,
          autoplay: true
        }}),*/
      ])
    ]
    return div('.player', {style}, [div('.content', children)])
  })
}

function Player(sources) {
  const action$ = intent(sources.DOM, sources.Play)
  const state$ = model(action$, sources.LANG, sources.AUDIO)
  const vtree$ = view(state$)

  const audio$ = xs.merge(
    sources.DOM.select('.play-icon').events('click').map(ev => ({type: 'play'})),
    sources.DOM.select('.pause-icon').events('click').map(ev => ({type: 'pause'})),
    state$.map(state => state.audio).map(audio => ({type: 'setUrl', payload: audio})),
  )

  return {
    DOM: vtree$,
    AUDIO: audio$,
  }
}

export default Player