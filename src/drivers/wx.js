import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt';

export function makeWxDriver() {

  function wxDriver(out$) {

    let onResult = () => 0

    out$.addListener({
      next: out => {
        if (out.type === 'config') {
          wx.config(out.payload)
        } else if (out.type === 'scanQRCode') {
          wx.scanQRCode({
            needResult: 1,
            scanType: ["qrCode"],
            success: function (res) {
              onResult({type: 'scanQRCode', payload: res.resultStr})
            }
          })
        }
      }
    })

    const in$ = xs.create({
      start: listener => {
        onResult = d => {
          listener.next(d)
        }
      },
      stop: () => 0
    })

    return adapt(in$)
  }

  return wxDriver
}