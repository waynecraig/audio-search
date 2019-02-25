export function makeScanDriver() {
  function scanDriver(out$) {
    out$.addListener({
      next: out => {
        console.log(out)
      }
    })
  }
  return scanDriver
}