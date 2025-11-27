import van from 'vanjs-core'

const {
  div,
  form,
  h3
} = van.tags

export function FolderContainer () {
  return div(
    { class: 'container mt-4' },
    h3('Enable Folders'),
    form({ id: 'folders' }, div({ id: 'mailboxes-list' }))
  )
}
