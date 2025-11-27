/* global browser */
import 'bootstrap'
import van from 'vanjs-core'
import * as vanX from 'vanjs-ext'
import { AccountContainer } from './components/AccountContainer'
import { GlobalSettings } from './components/GlobalSettings'
import { FolderContainer } from './components/FolderContainer'
import { setUseMocks, storageUtil, syncAccountsStorage } from './utils/storage'
import { testAccounts } from './mocks/testAccounts'

const useMocks = process.env.NODE_ENV === 'test' || false
setUseMocks(useMocks)

async function loadMailboxes (accounts) {
  await syncAccountsStorage(accounts)
  const foldersData = vanX.reactive(
    JSON.parse((await storageUtil.get('mailboxes')) ?? JSON.stringify([]))
  )
  van.derive(() => storageUtil.set('mailboxes', JSON.stringify(foldersData)))
  const mailboxesListElement = document.getElementById('mailboxes-list')

  for (const account of accounts) {
    van.add(
      mailboxesListElement,
      AccountContainer(account, foldersData[account.id])
    )
  }
  return mailboxesListElement
}

document.addEventListener('DOMContentLoaded', async () => {
  let accountsData
  if (process.env.NODE_ENV === 'test' || useMocks) {
    accountsData = testAccounts
  } else {
    accountsData = await browser.accounts.list()
    const excludedTypes = ['none', 'rss']
    accountsData = accountsData.filter(obj => !excludedTypes.includes(obj.type))
  }

  van.add(document.querySelector('app'), await GlobalSettings(), FolderContainer)
  van.add(await loadMailboxes(accountsData))

  const toggler = document.getElementsByClassName('liexpand')
  let i

  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener('click', function () {
      this.parentElement.querySelector('.nested').classList.toggle('active')
      this.classList.toggle('caret-down')
    })
  }
})
