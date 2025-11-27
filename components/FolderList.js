import van from 'vanjs-core'
import * as vanX from 'vanjs-ext'

const {
  a,
  input,
  li,
  span,
  ul
} = van.tags

// Helper function for setting all subfolder enabled states
export function setAllSubFoldersEnabled (folder, enabled) {
  folder.enabled = enabled
  if (folder.subFolders) {
    Object.values(folder.subFolders).forEach(subFolder => {
      setAllSubFoldersEnabled(subFolder, enabled)
    })
  }
}

export function FolderList (account) {
  const createList = (folders) => vanX.list(ul, folders, ({ val: folder }, deleter, folderName) => {
    const hasSubfolders = folder.subFolders && Object.keys(folder.subFolders).length > 0

    // Toggle class for expand/collapse function, applied only to list items with subfolders.
    const caret = hasSubfolders ? span({ class: 'liexpand caret caret-down' }) : span({ class: 'caret invisible' })
    const allNoneSpan = hasSubfolders
      ? span(
        { class: 'select-deselect px-2' },
        a({
          href: '#',
          class: 'small all link-underline link-underline-opacity-0 link-underline-opacity-75-hover',
          onclick: (e) => {
            e.preventDefault()
            setAllSubFoldersEnabled(folder, true)
          }
        }, 'All'),
        span({ class: 'small' }, ' / '),
        a({
          href: '#',
          class: 'small none link-underline link-underline-opacity-0 link-underline-opacity-75-hover',
          onclick: (e) => {
            e.preventDefault()
            setAllSubFoldersEnabled(folder, false)
          }
        }, 'None')
      )
      : null

    const folderElement = li(
      {
        class: hasSubfolders ? 'folder-item subfolder' : 'folder-item',
        'data-open': 'true'
      },
      caret,
      span(
        input({
          class: 'me-2',
          type: 'checkbox',
          checked: () => folder.enabled,
          onclick: (e) => (folder.enabled = e.target.checked),
          'data-mailbox-path': folderName
        }),
        folderName
      ),
      allNoneSpan
    )

    // Bind click event on caret to toggle the subfolder list.
    if (hasSubfolders) {
      const subList = ul({ class: 'nested active' }, ...createList(folder.subFolders).children)
      van.add(folderElement, subList)
    }

    return folderElement
  })

  return createList(account.enabledFolders)
}
