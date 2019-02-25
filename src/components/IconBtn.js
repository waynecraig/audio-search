import {div, a} from '@cycle/dom'
import icons from '../icons'
import xs from 'xstream'

function intent(domSource, props$) {
  return xs.merge(
    domSource.events('touchstart').map(a => ({type: 'ACTIVE'})),
    xs.combine(
      domSource.events('touchend'),
      props$.map(p => p.url)
    ).filter(a => a[0]).map(a => ({type: 'CLICK', payload: a[1]}))
  )
}

function model(action$, props$) {

  const initState = {icon: '', active: 0}

  const usePropsReducer$ = props$
    .map(props => oldState => {
      return Object.assign({}, oldState, {icon: props.icon})
    })

  const activeReducer$ = action$
    .filter(a => a.type === 'ACTIVE')
    .map(a => oldState => {
      return Object.assign({}, oldState, {active: 1})
    })

  const unActiveReducer$ = action$
    .filter(a => a.type === 'CLICK')
    .map(a => oldState => {
      return Object.assign({}, oldState, {active: 0})
    })
  
  return xs.merge(usePropsReducer$, activeReducer$, unActiveReducer$)
    .fold((state, reducer) => reducer(state), initState)

}

function view(state$) {
  return state$.filter(s=>s.icon).map(s => {
    return div('.icon-btn', icons[s.icon]())
  })
}

export default function (sources) {
  const action$ = intent(sources.DOM, sources.Props)
  const state$ = model(action$, sources.Props)
  const DOM = view(state$)
  const JUMP = action$.filter(a => a.type === 'CLICK' && a.payload).map(a => a.payload)
  const SCAN = action$.filter(a => a.type === 'CLICK' && !a.payload).mapTo(1)

  return { DOM, JUMP, SCAN }
}