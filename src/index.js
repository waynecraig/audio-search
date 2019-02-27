import './polyfills/object_assign'
import xs from 'xstream'
import {run} from '@cycle/run'
import {div, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http';
import {makeJumpDriver} from './drivers/jump'
import {makeScanDriver} from './drivers/scan'
import './style/app.sass'
import config from './config'
import HeadBar from './components/HeadBar'
import Keyboard from './components/Keyboard'
import InfoBar from './components/InfoBar'
import Player from './components/Player'

function main(sources) {

  const config$ = xs.of(config)
  const playProxy$ = xs.create()
  const headBar = HeadBar({
    Props: config$.map(prop => prop.headBar),
    DOM: sources.DOM,
    Play: playProxy$,
  })
  const canPlayProxy$ = xs.create()
  const keyboard = Keyboard({
    Props: config$.map(prop => prop.keyboard),
    DOM: sources.DOM,
    CanPlay: canPlayProxy$,
  })
  const infoBar = InfoBar({
    Input: keyboard.Input,
    HTTP: sources.HTTP,
  })
  playProxy$.imitate(infoBar.Play)
  canPlayProxy$.imitate(infoBar.CanPlay)
  const player = Player({
    DOM: sources.DOM,
    Play: infoBar.Play,
  })
  
  const vdom$ = xs.combine(headBar.DOM, player.DOM, infoBar.DOM, keyboard.DOM)
    .map(doms => div('.app', doms))

  return { 
    DOM: vdom$, 
    HTTP: infoBar.HTTP, 
    JUMP: headBar.JUMP, 
    SCAN: headBar.SCAN
  }
}

run(main, { 
  DOM: makeDOMDriver('body'),
  HTTP: makeHTTPDriver(),
  JUMP: makeJumpDriver(),
  SCAN: makeScanDriver()
})