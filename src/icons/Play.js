import { svg } from "@cycle/dom";

export default function () {
  return svg({ attrs: { viewBox: "0 0 12 12" } }, [
    svg.g([
      svg.path({
        attrs: {
          d: "M4.496 1.994A1 1 0 0 0 3 2.862v6.277a1 1 0 0 0 1.496.868l5.492-3.139a1 1 0 0 0 0-1.736L4.496 1.994z",
        },
      }),
    ]),
  ]);
}
