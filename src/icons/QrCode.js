import {svg} from '@cycle/dom'

export default function () {
  return svg({attrs: {viewBox: '0 0 496 496'}}, [
    svg.g([
      svg.path({attrs: {d: 'M416,80H80v128H0v16h80v192h336V224h80v-16h-80V80z M192,128h32v16h-32V128z M96,96h80v80H96V96z M176,400H96v-80h80V400z M128,304v-16h16v16H128z M400,400H192v-96h-32v-32h-48v32H96v-80h16v32h48v-32h32v32h80v-32h32v96h80v-48h-32v-16h32v-32h16V400z M128,240v-16h16v16H128z M256,224v16h-48v-16h32H256z M240,208v-16h16v16H240z M368,288v16h-48v-80h48v16h-32v48H368zM400,208h-16h-80h-32v-32h-48v32h-32h-32h-48H96v-16h96v-32h48v-48h-48V96h112v16h-32v48h32v32h96V208z M304,128v16h-16v-16H304z M400,176h-80V96h80V176z'}}),
      svg.path({attrs: {d: 'M160,336h-48v48h48V336z M144,368h-16v-16h16V368z'}}),
      svg.path({attrs: {d: 'M384,112h-48v48h48V112z M368,144h-16v-16h16V144z'}}),
      svg.path({attrs: {d: 'M208,320h32v16h-32v48h80V272h-80V320z M224,288h48v80h-48v-16h32v-48h-32V288z'}}),
      svg.path({attrs: {d: 'M304,384h80v-48h-80V384z M320,352h48v16h-48V352z'}}),
      svg.polygon({attrs: {points: '16,16 136,16 136,0 0,0 0,136 16,136'}}),
      svg.polygon({attrs: {points: '48,136 48,48 136,48 136,32 32,32 32,136'}}),
      svg.polygon({attrs: {points: '48,360 32,360 32,464 136,464 136,448 48,448'}}),
      svg.polygon({attrs: {points: '16,360 0,360 0,496 136,496 136,480 16,480'}}),
      svg.polygon({attrs: {points: '448,136 464,136 464,32 360,32 360,48 448,48'}}),
      svg.polygon({attrs: {points: '360,0 360,16 480,16 480,136 496,136 496,0'}}),
      svg.polygon({attrs: {points: '480,480 360,480 360,496 496,496 496,360 480,360'}}),
      svg.polygon({attrs: {points: '448,360 448,448 360,448 360,464 464,464 464,360'}}),
    ])
  ])
}