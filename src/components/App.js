import xs from "xstream";
import { div } from "@cycle/dom";
import "../style/app.sass";
import config from "../config";
import HeadBar from "./HeadBar";
import Keyboard from "./Keyboard";
import InfoBar from "./InfoBar";
import Player from "./Player";

export default function (sources) {
  const config$ = xs.of(config);
  const playProxy$ = xs.create();
  const headBar = HeadBar({
    Props: config$.map((prop) => prop.headBar),
    DOM: sources.DOM,
    Play: playProxy$,
    HTTP: sources.HTTP,
  });
  const canPlayProxy$ = xs.create();
  const keyboard = Keyboard({
    Props: config$.map((prop) => prop.keyboard),
    DOM: sources.DOM,
    CanPlay: canPlayProxy$,
    LANG: sources.LANG,
  });

  const direct$ = xs.merge(
    sources.WX.filter((a) => (a.type = "scanQRCode"))
      .map((a) =>
        parseInt(
          a.payload
            .replace(/^https?:/, "")
            .replace("//" + location.host + location.pathname + "?s=", "")
        )
      )
      .filter((a) => a && a > 0 && a < 1000000)
      .map((a) => a.toString()),
    sources.PARAMS.map((a) => a.s).filter((a) => a && a.length <= 6)
  );

  const infoBar = InfoBar({
    Input: keyboard.Input,
    HTTP: sources.HTTP,
    DIRECT: direct$,
    LANG: sources.LANG,
  });
  playProxy$.imitate(infoBar.Play);
  canPlayProxy$.imitate(infoBar.CanPlay);
  const player = Player({
    DOM: sources.DOM,
    Play: infoBar.Play,
    LANG: sources.LANG,
  });

  const vdom$ = xs
    .combine(headBar.DOM, player.DOM, infoBar.DOM, keyboard.DOM)
    .map((doms) => div(".app", doms));

  const http$ = xs.merge(infoBar.HTTP, headBar.HTTP);

  return {
    DOM: vdom$,
    HTTP: http$,
    JUMP: headBar.JUMP,
    WX: headBar.WX,
  };
}
