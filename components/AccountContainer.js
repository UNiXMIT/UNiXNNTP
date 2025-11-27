import van from 'vanjs-core'
import { Dropdown } from './Dropdown'
import { setAllSubFoldersEnabled, FolderList } from './FolderList'
import { soundsMap, detailsMap } from '../constants/settings'
import { playSound } from '../utils/audio'

const {
  a,
  div,
  h5,
  strong,
  input,
  small
} = van.tags

export function AccountContainer (account, folders) {
  // Function to toggle all folders and subfolders for an account
  const toggleAllFolders = (enabled) => {
    Object.values(folders.enabledFolders).forEach(folder => {
      setAllSubFoldersEnabled(folder, enabled)
    })
  }

  const accountView = div({
    class: 'treeview w-100 border',
    id: 'treeview-account1'
  })
  const header = div(
    { id: 'header', class: 'bg-primary text-white mb-3' },
    div(
      { class: 'd-flex justify-content-between pt-3 ps-3 pe-3' },
      h5({ class: ' ps-3' }, strong(account.name)),
      div(
        a({
          href: '#',
          class: 'small link-light link-underline link-underline-opacity-0 link-underline-opacity-75-hover',
          onclick: (e) => {
            e.preventDefault()
            toggleAllFolders(true)
          }
        }, 'All'),
        ' / ',
        a({
          href: '#',
          class: 'small link-light link-underline link-underline-opacity-0 link-underline-opacity-75-hover',
          onclick: (e) => {
            e.preventDefault()
            toggleAllFolders(false)
          }
        }, 'None')
      )
    ),
    div(
      { class: 'd-flex pt-3 ps-3 pe-3' },
      Dropdown('Sound:', 'sound', soundsMap, folders),
      Dropdown('Details: ', 'notificationDetails', detailsMap, folders),
      div({ class: 'd-flex align-items-center volume-range mt-2 ps-3' },
        small('Volume: '),
        input({
          type: 'range',
          class: ' form-range vol-range-thumb ps-3',
          min: '0',
          max: '1',
          step: '0.1',
          id: 'volRange',
          value: () => folders.volume,
          onclick: (e) => {
            folders.volume = e.target.value
            if (folders.sound !== 'customSound') {
              playSound.play(`assets/sounds/${folders.sound}`, folders.volume)
            } else {
              playSound.play(folders.customSound, folders.volume)
            }
          }
        })
      )
    )
  )
  van.add(accountView, header)
  van.add(accountView, FolderList(folders))

  return accountView
}
