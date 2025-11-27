/* global browser */
import { testStorage, setTestStorage } from '../mocks/testStorage'
import { defaultSound, defaultDetails, defaultVolume } from '../constants/settings'

export let useMocks = false

export const storageUtil = {
  get: function (key) {
    if (useMocks) { // Use mocks if the flag is true
      return Promise.resolve(testStorage[key])
    } else {
      return browser.storage.local.get(key).then((result) => result[key])
    }
  },
  set: function (key, value) {
    if (useMocks) { // Use mocks if the flag is true
      setTestStorage(key, value)
      return Promise.resolve()
    } else {
      const data = {}
      data[key] = value
      return browser.storage.local.set(data)
    }
  },
  print: function () {
    if (useMocks) { // Print testing data if the flag is true
      console.log(JSON.stringify(testStorage, null, 2))
    } else {
      browser.storage.local.get().then((result) => {
        console.log(JSON.stringify(result, null, 2))
      })
    }
  }
}

// Export a function to set the useMocks variable
export function setUseMocks (newValue) {
  useMocks = newValue
}

export async function syncAccountsStorage (accounts) {
  // Retrieve stored accounts or initialize with default if not present.
  const storedAccounts = JSON.parse(await storageUtil.get('mailboxes') || '{}')

  // Collect IDs of current (valid) accounts
  const currentAccountIds = new Set(accounts.map(account => account.id))

  // Identify and remove stored accounts that no longer exist
  Object.keys(storedAccounts).forEach(storedAccountId => {
    if (!currentAccountIds.has(storedAccountId)) {
      console.log(`Pruning account no longer present: ${storedAccountId}`)
      delete storedAccounts[storedAccountId]
    }
  })

  for (const account of accounts) {
    // Retrieve stored account or set up default structure if not present.
    const storedAcc = storedAccounts[account.id] || {
      enabledFolders: {},
      sound: defaultSound,
      customSound: null,
      volume: defaultVolume,
      notificationDetails: defaultDetails
    }

    // Set/Update stored account name
    storedAcc.accountName = account.name

    // Update to add customSound key if it doesnt exist
    if (!storedAcc.customSound) {
      storedAcc.customSound = null
    }

    // Recursive function to process each folder and its subfolders.
    const processFolders = (folderArray, parentObject = storedAcc.enabledFolders) => {
      folderArray.forEach(folder => {
        if (!parentObject[folder.name]) {
          parentObject[folder.name] = { enabled: true, subFolders: {}, path: folder.path }
        }

        if (folder.subFolders && folder.subFolders.length > 0) {
          processFolders(folder.subFolders, parentObject[folder.name].subFolders) // Enter the next level of nesting
        }
      })
    }

    // Start processing folders from the root level.
    processFolders(account.folders)

    // Function to recursively collect full paths of all folders and subfolders
    function collectPaths (folders, validPaths = new Set()) {
      folders.forEach(folder => {
        validPaths.add(folder.path) // Add the full path of the current folder
        if (folder.subFolders && folder.subFolders.length) {
          collectPaths(folder.subFolders, validPaths) // Recursively process subfolders
        }
      })
      return validPaths
    }

    // Collected valid paths from account data
    const validPaths = collectPaths(account.folders) // Generate a Set of valid 'path' values

    // Prune folder function removes folders that no longer exist.
    function pruneFolders (enabledFolders, validPaths) {
      Object.keys(enabledFolders).forEach(folderName => {
        const folder = enabledFolders[folderName]
        if (!validPaths.has(folder.path)) {
          delete enabledFolders[folderName]
        } else {
          if (Object.keys(folder.subFolders).length > 0) {
            pruneFolders(folder.subFolders, validPaths) // Recursive call
          }
        }
      })
    }

    pruneFolders(storedAcc.enabledFolders, validPaths)
    // Save processed account data back into the storedAccounts object.
    storedAccounts[account.id] = storedAcc
  }

  // Save updated accounts back to storage.
  await storageUtil.set('mailboxes', JSON.stringify(storedAccounts))
}
