import { div, h2, p, h } from "@cycle/dom";
import xs from "xstream";
import '../style/player.sass'
import { getFieldData } from '../utils'

const fileRoot = 'http://x.moca-yinchuan.com/audio/admin/sites/default/files/'

function intent(domSource, play$) {
  return xs.merge(
    play$.map(a => ({type: 'NEW_TASK', payload: a}))
  )
}

function model(action$) {
  const initState = { id: '', title: '', audio: '', image: '', author: '' }

  const newTaskReducer$ = action$
    .filter(a => a.type === 'NEW_TASK')
    .map(action => function(oldState){
      const a = action.payload
      return {
        id: a.nid, 
        title: a.title, 
        audio: getFieldData(a, 'field_file', 'uri').replace('public://', ''), 
        image: getFieldData(a, 'field_cover', 'uri').replace('public://', ''), 
        author: getFieldData(a, 'field_author', 'value')
      }
    })

  return xs.merge(newTaskReducer$)
    .fold((state, reducer) => reducer(state), initState)
}

function view(state$) {
  return state$.map(({id, title, audio, image, author}) => {
    const style = {
      'background-color': '#00bcb4'
    }
    if (image) {
      style['background-image'] = `url(${fileRoot}${image})`
    }
    const line1 = id ? `${id}. ${title}` : '银川当代美术馆'
    const line2 = id ? (author ? `作者: ${author}` : '') : '语音导览搜索系统'
    const children = [
      div('.audio-info', [
        h2([line1]),
        p([line2]),
      ]),
      div('.audio-ctrl', [
        h('audio', {attrs: {
          src: audio ? `${fileRoot}${audio}` : undefined,
          controls: true,
          autoplay: true
        }})
      ])
    ]
    return div('.player', {style}, [div('.content', children)])
  })
}

function Player(sources) {
  const action$ = intent(sources.DOM, sources.Play)
  const state$ = model(action$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}

export default Player