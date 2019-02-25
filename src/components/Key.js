import { div, span } from "@cycle/dom";
import xs from 'xstream'
import icons from '../icons'

function intent(domSource, disable$) {
  return xs.merge(
    domSource.events('touchend').map(ev => ({type: 'CLICK'})),
    domSource.select('.key').events('touchstart', {preventDefault: true}).map(ev => ({type: 'ACTIVE'})),
    disable$.map(a => ({type: 'DISABLE_CHANGE', payload: a})),
  )
}

function model(props$, action$) {
  const usePropsReducer$ = props$
    .map(props => function usePropsReducer(oldState) {
      return props
    })

  const activeReducer$ = action$
    .filter(a => a.type === 'ACTIVE')
    .map(action => function activeReducer(oldState){
      return Object.assign({}, oldState, {active: 1})
    })

  const unActiveReducer$ = action$
    .filter(a => a.type === 'CLICK')
    .map(action => function unActiveReducer(oldState){
      return Object.assign({}, oldState, {active: 0})
    })

  const disableReducer$ = action$
    .filter(a => a.type === 'DISABLE_CHANGE')
    .map(action => function disableReducer(oldState) {
      return Object.assign({}, oldState, {disable: action.payload})
    })

  return xs.merge(usePropsReducer$, activeReducer$, unActiveReducer$, disableReducer$)
    .fold((state, reducer) => reducer(state), {text: '', r: 1, c: 1, active: 0, disable: 0, height: 0})
}

function view(state$) {
  return state$.map(({text, icon, r, c, active, disable, height}) => {
    const style = {
      'background-color': active && !disable ? '#ccc' : '#fff',
      height: `${height}px`
    }
    return div(`.key.noselect.r${r}.c${c}${disable ? '.disable' : ''}`, {style}, [
      icon ? icons[icon]() : span([text])
    ])
  })
}

function Key(sources) {
  const action$ = intent(sources.DOM, sources.Disable)
  const state$ = model(sources.Props, action$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    Click: action$.filter(a => a.type === 'CLICK')
  }
}

export default Key