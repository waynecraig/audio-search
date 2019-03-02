import './polyfills/object_assign'
import xs from 'xstream'
import {run} from '@cycle/run'
import {div, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http';
import {makeJumpDriver} from './drivers/jump'
import {makeWxDriver} from './drivers/wx'
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
    HTTP: sources.HTTP,
  })
  const canPlayProxy$ = xs.create()
  const keyboard = Keyboard({
    Props: config$.map(prop => prop.keyboard),
    DOM: sources.DOM,
    CanPlay: canPlayProxy$,
  })

  const direct$ = xs.merge(
    sources.WX.filter(a=>a.type='scanQRCode').map(a => 
      parseInt(a.payload.replace(location.origin + location.pathname + '?s=', ''))
    ).filter(a => a && a > 0 && a < 1000000).map(a=>a.toString()),
    xs.of(location.search.match(/[\?\&]s=(\d+)/)).filter(a=>a).map(a=>a[1]).filter(a=>a.length <= 6)
  )

  const infoBar = InfoBar({
    Input: keyboard.Input,
    HTTP: sources.HTTP,
    DIRECT: direct$,
  })
  playProxy$.imitate(infoBar.Play)
  canPlayProxy$.imitate(infoBar.CanPlay)
  const player = Player({
    DOM: sources.DOM,
    Play: infoBar.Play,
  })
  
  const vdom$ = xs.combine(headBar.DOM, player.DOM, infoBar.DOM, keyboard.DOM)
    .map(doms => div('.app', doms))

  const http$ = xs.merge(infoBar.HTTP, headBar.HTTP)

  return { 
    DOM: vdom$, 
    HTTP: http$, 
    JUMP: headBar.JUMP, 
    WX: headBar.WX
  }
}

run(main, { 
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  JUMP: makeJumpDriver(),
  WX: makeWxDriver()
})