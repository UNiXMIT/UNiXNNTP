/* globals location */
import van from 'vanjs-core'
import * as vanX from 'vanjs-ext'
import { storageUtil } from '../utils/storage'
import { defaultSettings } from '../constants/settings'

const {
  button,
  div,
  form,
  h3,
  input,
  label,
  a,
  img
} = van.tags

export async function GlobalSettings () {
  const settings = vanX.reactive(
    JSON.parse(
      (await storageUtil.get('settings')) ?? JSON.stringify(defaultSettings)
    )
  )
  van.derive(() => storageUtil.set('settings', JSON.stringify(settings)))
  return div(
    { class: 'container mt-4' },
    h3('Settings'),
    form(
      { id: 'preferences-form' },
      div(
        { class: 'd-flex justify-content-between pt-3 ps-3 pe-3' },
        div(
          div(
            { class: 'form-check' },
            input({
              class: 'form-check-input',
              type: 'checkbox',
              id: 'enabledCheckbox',
              checked: () => settings.enabled,
              onclick: (e) =>
                (settings.enabled = e.target.checked)
            }),
            label(
              {
                class: 'form-check-label',
                for: 'enabledCheckbox'
              },
              'Enabled'
            )
          )
        ),

        div(
          button(
            {
              type: 'button',
              id: 'resetButton',
              class: 'btn btn-warning',
              onclick: async () => {
                await storageUtil.set('settings', null) // Clear settings from storage
                await storageUtil.set('mailboxes', JSON.stringify({})) // Clear mailboxes from storage
                location.reload() // Reload the page
              }
            },
            'Reset All'
          )
        )
      ),
      div(
        { class: 'd-flex justify-content-between pt-3 ps-3 pe-3' },
        div(
          a(
            {
              href: 'https://www.buymeacoffee.com/dansul'
            },
            img(
              {
                src: 'assets/images/bmc-button.png',
                style: 'width: 150px'
              }
            )
          )
        )
      )
    )
  )
}
