import './polyfills/object_assign'
import xs from 'xstream'
import {run} from '@cycle/run'
import {div, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeJumpDriver} from './drivers/jump'
import {makeWxDriver} from './drivers/wx'
import storageDriver from '@cycle/storage'
import './style/main.sass'
import {getUrlParams} from './utils'
import config from './config'
import Lang from './components/Lang'
import App from './components/App'

function main(sources) {

  const urlParams$ = xs.of(getUrlParams()).remember()
  const config$ = xs.of(config).remember()

  const lang = Lang({
    DOM: sources.DOM,
    PARAMS: urlParams$,
    STORAGE: sources.STORAGE,
  })

  const app = App({
    DOM: sources.DOM,
    HTTP: sources.HTTP,
    JUMP: sources.JUMP,
    WX: sources.WX,
    PROPS: config$,
    LANG: lang.LANG.remember(),
    PARAMS: urlParams$,
  })

  const vtree$ = xs.combine(app.DOM, lang.DOM).map(doms => div('.main', doms))

  return { 
    DOM: vtree$,
    HTTP: app.HTTP, 
    JUMP: app.JUMP, 
    WX: app.WX,
    STORAGE: lang.STORAGE,
  }
}

run(main, { 
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  JUMP: makeJumpDriver(),
  WX: makeWxDriver(),
  STORAGE: storageDriver,
})