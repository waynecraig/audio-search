import { svg } from "@cycle/dom";

export default function () {
  return svg({ attrs: { viewBox: "0 0 12 12" } }, [
    svg.g([
      svg.path({
        attrs: {
          d: "M3 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm5 0a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8z",
        },
      }),
    ]),
  ]);
}
