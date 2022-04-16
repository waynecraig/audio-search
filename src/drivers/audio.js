import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt';

export function makeAudioDriver() {
  function audioDriver(out$) {
    const audio = new Audio();

    out$.addListener({
      next: (out) => {
        switch (out.type) {
          case "setUrl":
            console.log(out.payload)
            audio.setAttribute("src", out.payload);
            break;
          case "play":
            audio.play();
            break;
          case "pause":
            audio.pause();
            break;
        }
      },
    });

    const in$ = xs.create({
      start: (listener) => {
        audio.addEventListener("play", () => {
          listener.next("play");
        });
        audio.addEventListener("pause", () => {
          listener.next("pause");
        });
      },
      stop: () => 0,
    });

    return adapt(in$);
  }

  return audioDriver;
}
