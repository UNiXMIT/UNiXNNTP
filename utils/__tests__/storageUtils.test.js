import { storageUtil, setUseMocks, syncAccountsStorage } from '../storage'
import { setTestStorage, delTestStorage } from '../../mocks/testStorage'
import { testAccounts } from '../../mocks/testAccounts'

// Helper function to reset test storage to its initial state
function resetTestStorage () {
  setTestStorage('mailboxes', `{
        "account1": {
            "sound": "pop.mp3",
            "enabledFolders": {
                "Inbox": { "enabled": true, "path": "/Inbox", "subFolders": {} },
                "Stuff": { "enabled": true, "path": "/Stuff", "subFolders": {} }
            },
            "notificationDetails": "NameMessagePreview"
        }
    }`)
}

beforeEach(() => {
  resetTestStorage()
  setUseMocks(true)
})

afterEach(() => {
  setUseMocks(false)
})

// Mock the browser object and its methods
global.browser = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
}

describe('storageUtil with mocks', () => {
  it('retrieves mock data for "settings"', async () => {
    const settings = await storageUtil.get('settings')
    expect(settings).toEqual('{"enabled":true,"version":1}')
  })

  it('retrieves data from browser storage', async () => {
    // Set up the mock behavior
    global.browser.storage.local.get.mockResolvedValue({ settings: '{"enabled":true,"version":1}' })
    setUseMocks(false)

    const settings = await storageUtil.get('settings')
    expect(settings).toEqual('{"enabled":true,"version":1}')
  })

  it('sets data to browser storage', async () => {
    // Set up the mock behavior
    global.browser.storage.local.set.mockResolvedValue(undefined)
    setUseMocks(false)

    await storageUtil.set('settings', '{"enabled":true,"version":1}')
    expect(global.browser.storage.local.set).toHaveBeenCalledWith({ settings: '{"enabled":true,"version":1}' })
  })

  it('prints the test storage when useMocks is true', () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log')

    // Set up the mock behavior
    setUseMocks(true)

    storageUtil.print()
    expect(consoleSpy).toHaveBeenCalled()

    // Clean up: remove the spy
    consoleSpy.mockRestore()
  })

  it('prints the browser storage when useMocks is false', async () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log')

    // Set up the mock behavior
    setUseMocks(false)

    await storageUtil.print()
    expect(consoleSpy).toHaveBeenCalled()

    // Clean up: remove the spy
    consoleSpy.mockRestore()
  })
})

describe('syncAccountsStorage', () => {
  it('adds new folders for existing accounts', async () => {
    // Add new folder to account1
    const newFolderStructure = [...testAccounts]
    newFolderStructure[0].folders.push({
      accountId: 'account1',
      name: 'NewFolder',
      path: '/NewFolder',
      subFolders: []
    })

    await syncAccountsStorage(newFolderStructure)

    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))
    expect(updatedMailboxes.account1.enabledFolders).toHaveProperty('NewFolder')
  })

  it('prunes folders no longer present in the account', async () => {
    // Remove "Stuff" folder from account1 indirectly by not including it
    const prunedFolderStructure = [...testAccounts]
    prunedFolderStructure[0].folders = prunedFolderStructure[0].folders.filter(folder => folder.name !== 'Stuff')

    await syncAccountsStorage(prunedFolderStructure)

    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))
    expect(updatedMailboxes.account1.enabledFolders).not.toHaveProperty('Stuff')
  })

  it('adds new account with its folders', async () => {
    // Add completely new account
    const newAccountStructure = [...testAccounts, {
      id: 'account3',
      name: 'test3@example.com',
      type: 'imap',
      folders: [
        {
          accountId: 'account3',
          name: 'Inbox',
          path: '/INBOX',
          type: 'inbox',
          subFolders: []
        }
      ],
      identities: []
    }]

    await syncAccountsStorage(newAccountStructure)

    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))
    expect(updatedMailboxes).toHaveProperty('account3')
    expect(updatedMailboxes.account3.enabledFolders).toHaveProperty('Inbox')
  })

  it('prunes accounts no longer present', async () => {
    // Account pruning - Remove account2 indirectly
    // Set up initial storage
    await syncAccountsStorage(testAccounts)

    const basicAccounts = [
      {
        id: 'account1',
        name: 'test1@example.com',
        type: 'imap',
        folders: []
      }
    ]
    await syncAccountsStorage(basicAccounts)

    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))
    expect(updatedMailboxes).not.toHaveProperty('account2')
  })

  it('adds customSound key if it is missing in the stored account', async () => {
    // Remove the customSound key from account1 for testing
    const initialStorage = {
      account1: {
        sound: 'pop.mp3',
        enabledFolders: {
          Inbox: { enabled: true, path: '/Inbox', subFolders: {} },
          Stuff: { enabled: true, path: '/Stuff', subFolders: {} }
        },
        notificationDetails: 'NameMessagePreview'
        // deliberately omitting customSound key
      },
      account2: {
        sound: 'ding.mp3',
        volume: 0.5,
        enabledFolders: {
          Inbox: {
            enabled: true,
            path: '/Inbox',
            subFolders: {
              'Sub Inbox': {
                enabled: true,
                path: '/Inbox/Sub Inbox',
                subFolders: {}
              }
            }
          },
          Drafts: {
            enabled: true,
            path: '/Drafts',
            subFolders: {}
          }
        },
        notificationDetails: 'NameMessagePreview',
        customSound: 'customDing.mp3'
      }
    }

    // Set the test storage to initialStorage object
    setTestStorage('mailboxes', JSON.stringify(initialStorage))

    // Run syncAccountsStorage with test accounts
    await syncAccountsStorage(testAccounts)

    // Get the updated mailboxes
    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))

    // Check if customSound key is added
    expect(updatedMailboxes.account1).toHaveProperty('customSound', null)
  })
})

describe('syncAccountsStorage initialization', () => {
  beforeEach(() => {
    setUseMocks(true)
    delTestStorage('mailboxes')
  })

  it('creates mailboxes in storage if initially absent', async () => {
    // Call the method which should create `mailboxes` if not present
    await syncAccountsStorage(testAccounts)

    const updatedMailboxes = JSON.parse(await storageUtil.get('mailboxes'))
    expect(updatedMailboxes).toHaveProperty('account1')
    expect(updatedMailboxes.account1).toHaveProperty('sound')
    expect(updatedMailboxes.account1).toHaveProperty('notificationDetails')
    expect(updatedMailboxes.account1).toHaveProperty('enabledFolders')
    expect(updatedMailboxes.account1.enabledFolders).toHaveProperty('Inbox')
  })
})
