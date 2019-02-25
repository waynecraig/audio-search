export function makeJumpDriver() {
  function jumpDriver(out$) {
    out$.addListener({
      next: out => {
        window.location.href = out
      }
    })
  }
  return jumpDriver
}