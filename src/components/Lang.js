import xs from "xstream";
import { div, p, span, img, ol } from "@cycle/dom";
import dropRepeats from "xstream/extra/dropRepeats";
import delay from "xstream/extra/delay";
import "../style/lang.sass";

function intent(dom$) {
  const changeLang$ = dom$
    .select(".langBtn")
    .events("touchend")
    .map((a) => {
      const lang = a.ownerTarget.getAttribute("data-value");
      return { type: "CHANGE_LANG", payload: lang };
    });
  return xs.merge(
    changeLang$,
    changeLang$.compose(delay(500)).mapTo({ type: "TURN", payload: 0 })
  );
}

function model(action$, params$, storage$) {
  const initState = { use: 1, hide: 0, lang: 0 };

  const envReducer$ = xs
    .combine(
      params$.map((a) => a.lang).startWith(""),
      params$.map((a) => a.s).startWith(""),
      storage$.local.getItem("lang").startWith("")
    )
    .map(([paramLang, s, storeLang]) => (oldState) => {
      return {
        use: !(paramLang || (s && storeLang)),
        hide: oldState.hide,
        lang: paramLang || (s && storeLang) ? storeLang : "",
      };
    });

  const actionReducer$ = action$
    .filter((a) => a.type === "CHANGE_LANG")
    .map((a) => (oldState) => {
      return { use: oldState.use, hide: 1, lang: a.payload };
    });

  const turnReducer$ = action$
    .filter((a) => a.type === "TURN")
    .map((a) => (oldState) => {
      return Object.assign({}, oldState, { use: a.payload });
    });

  return xs
    .merge(envReducer$, actionReducer$, turnReducer$)
    .fold((state, reducer) => reducer(state), initState);
}

function view(state$) {
  return state$.map((state) => {
    if (!state.use) {
      return null;
    }
    const style = {
      top: state.hide ? "100%" : "0%",
    };
    return div(".lang", { style }, [
      div(".info", [
        p(["欢迎使用"]),
        p(["Welcome to use"]),
        p(".gap"),
        p(["银川当代美术馆语音导览系统"]),
        p(["MOCA Yinchuan Audio Guide System"]),
      ]),
      div(".btns", [
        div(".langBtn", { attrs: { "data-value": "zh" } }, [span(["中文"])]),
        div(".langBtn", { attrs: { "data-value": "en" } }, [span(["English"])]),
      ]),
      div(".footer", [img(".logo", { attrs: { src: "img/logo.png" } })]),
    ]);
  });
}

export default function (sources) {
  const action$ = intent(sources.DOM);
  const state$ = model(action$, sources.PARAMS, sources.STORAGE);
  const vtree$ = view(state$);

  const lang$ = state$
    .map((a) => a.lang)
    .filter((a) => a)
    .compose(dropRepeats());

  return {
    DOM: vtree$,
    LANG: lang$,
    STORAGE: lang$.map((value) => ({ key: "lang", value })),
  };
}
