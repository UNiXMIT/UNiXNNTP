/* global FileReader */
import van from 'vanjs-core'
import { playSound } from '../utils/audio'

const {
  a,
  span,
  img,
  button,
  div,
  small
} = van.tags

export function Dropdown (dropLabel, stateKey, map, accountData) {
  const dropdownDiv = div(
    { class: 'dropdown d-flex align-items-center mt-2 ps-3' },
    small(dropLabel),
    button(
      {
        class: 'btn btn-sm btn-primary dropdown-toggle',
        id: 'dropdownMenuButton',
        'data-bs-toggle': 'dropdown',
        'aria-haspopup': 'true',
        'aria-expanded': 'false'
      },
      () => map[accountData[stateKey]]
    )
  )
  const dropdownContents = div({
    class: 'dropdown-menu',
    'aria-labelledby': 'dropdownMenuButton'
  })
  for (const [key, label] of Object.entries(map)) {
    const labelspan = span(
      { class: 'labelcontainer' }, span({ class: 'labeltext', 'data-key': key }, label),
      span({ class: 'labelicons' },
        stateKey === 'sound' && label !== 'None'
          ? img({
            src: './assets/images/icons/play-alt-svgrepo-com.svg',
            class: 'playicon',
            'data-key': key,
            onclick: (e) => {
              e.stopPropagation()
              if (stateKey === 'sound') {
                if (e.target.dataset.key !== 'customSound') {
                  playSound.play(`assets/sounds/${e.target.dataset.key}`, accountData.volume)
                } else {
                  playSound.play(accountData.customSound, accountData.volume)
                }
              }
            }
          })
          : null,
        stateKey === 'sound' && label === 'Custom'
          ? img({
            src: './assets/images/icons/cog-svgrepo-com.svg',
            class: 'settingsicon',
            'data-key': key,
            onclick: (e) => {
              e.stopPropagation()
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'audio/*'
              /* istanbul ignore next */
              input.onchange = (e) => {
                const file = e.target.files[0]
                const reader = new FileReader()
                reader.onload = (ev) => {
                  accountData.customSound = ev.target.result
                }
                reader.readAsDataURL(file)
              }
              input.click() // Open file dialog
            }
          })
          : null
      )
    )
    van.add(
      dropdownContents,
      a(
        {
          class: `dropdown-item ${accountData[stateKey] === key ? '' : ''}`,
          href: '#',
          'data-key': key,
          onclick: (e) => {
            accountData[stateKey] = e.target.dataset.key
          }
        },
        labelspan
      )
    )
  }
  van.add(dropdownDiv, dropdownContents)
  return dropdownDiv
}
