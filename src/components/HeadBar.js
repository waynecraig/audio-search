import {div} from '@cycle/dom'
import IconBtn from './IconBtn'
import xs from 'xstream'
import '../style/head-bar.sass'
import isolate from '@cycle/isolate'

export default function (sources) {

  const leftBtn = isolate(IconBtn, 'left')({
    Props: sources.Props.map(prop => prop.left),
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