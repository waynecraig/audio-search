import {div} from '@cycle/dom'
import IconBtn from './IconBtn'
import xs from 'xstream'
import '../style/head-bar.sass'
import isolate from '@cycle/isolate'
import { getFieldData } from '../utils'

export default function (sources) {

  const usePropsReducer$ = sources.Props.map(a => a.left)
    .map(props => oldState => {
      return props
    })
  
  const exhChangeReducer$ = sources.Play.map(a => getFieldData(a, 'field_exhibition', 'target_id')).filter(a=>a)
    .map(id => oldState => Object.assign({}, oldState, {
      url: oldState.url.replace(/\d+$/, id)
    }))

  const listBtnProps$ = xs.merge(usePropsReducer$, exhChangeReducer$)
    .fold((state, reducer) => reducer(state), {icon: '', url: ''})

  const leftBtn = isolate(IconBtn, 'left')({
    Props: listBtnProps$,
    DOM: sources.DOM
  })

  const rightBtn = isolate(IconBtn, 'right')({
    Props: sources.Props.map(prop => prop.right),
    DOM: sources.DOM
  })

  const DOM = xs.combine(leftBtn.DOM, rightBtn.DOM).map(doms => (
    div('.head-bar', [
      div('.head-bar-left', [doms[0]]),
      div('.head-bar-right', [doms[1]]),
    ])
  ))

  const JUMP = xs.merge(leftBtn.JUMP, rightBtn.JUMP)
  const SCAN = xs.merge(leftBtn.SCAN, rightBtn.SCAN)

  return { DOM, JUMP, SCAN }

}