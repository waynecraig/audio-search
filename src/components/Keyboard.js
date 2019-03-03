import xs from 'xstream'
import {div, video} from '@cycle/dom'
import Key from './Key'
import isolate from '@cycle/isolate'
import '../style/keyboard.sass'

function intent(keyClick$) {
  return keyClick$.map(id => ({type: 'INPUT', payload: id}))
}

function model(props$, keyFn) {

  function createNewKey(id, props) {
    const sinks = keyFn(props, id)
    return {id, DOM: sinks.DOM.remember(), Click: sinks.Click}
  }

  const usePropsReducer$ = props$
    .map(props => function usePropsReducer(oldState) {
      return props.keys.map(k => createNewKey(k.id, {
        text: k.text, 
        icon: k.icon, 
        r: k.r, 
        c: k.c, 
        active: 0, 
        disable: k.id === 'p', 
        height: props.height
      }))
    })
  
  return usePropsReducer$.fold((state, reducer) => reducer(state), [])
}

function view(keys$) {
  return keys$.map(keys => {
    const vnodes = keys.map(key => 
      key.DOM.map(vnode => {
        vnode.key = key.id
        return vnode
      })
    )
    return xs.combine(...vnodes)
      .map(vnodes => div('.keyboard', vnodes))
  }).flatten()
}

function makeKeyWrapper(DOM, CanPlay, LANG) {
  return function keyWrapper(props, id) {
    const key = isolate(Key, id)({
      DOM, 
      Props: xs.of(props), 
      Disable: id === 'p' ? CanPlay.map(a => !a) : xs.never(),
      LANG
    });
    return {
      DOM: key.DOM,
      Click: key.Click.mapTo(id),
    }
  }
}

export default function(sources) {

  const proxyKeyClick$ = xs.create()
  const action$ = intent(proxyKeyClick$)
  const keyWrapper = makeKeyWrapper(sources.DOM, sources.CanPlay, sources.LANG)
  const keys$ = model(sources.Props, keyWrapper)
  const keyClick$ = keys$
    .map(keys => xs.merge(...keys.map(key => key.Click)))
    .flatten()
  proxyKeyClick$.imitate(keyClick$)
  const vtree$ = view(keys$)

  return {
    DOM: vtree$,
    Input: action$.filter(action => action.type === 'INPUT')
  }

}