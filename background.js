/* global browser */

import { setUseMocks, storageUtil, syncAccountsStorage } from './utils/storage'
import { testAccounts } from './mocks/testAccounts'
import { defaultSettings } from './constants/settings'

const DISCORD_WEBHOOK_URL = "https://webhook.lewisakura.moe/api/webhooks/1437829638029054094/nRe66VXWRbY83FBMnAhW5TFdgMt7iPl-p_qHtSjciDTuk_NTjL100ryMWSg4lsPvOvrM";

const useMocks = process.env.NODE_ENV === 'test' || false
setUseMocks(useMocks)
// Object to keep the messageId for each notification
const notificationMessageMap = {}
// Array to keep the seen headers to prevent duplicate notifications
let seenHeaders = []

// Helper function to recursively search for a folder by path
function findFolderByPath (folders, path) {
  for (const key in folders) {
    const folder = folders[key]
    if (folder.path === path) {
      return folder.enabled ? folder : null
    }
    if (folder.subFolders) {
      const subFolder = findFolderByPath(folder.subFolders, path)
      if (subFolder) {
        return subFolder
      }
    }
  }
  return null
}

async function shouldNotify (folder) {
  const mailboxesString = await storageUtil.get('mailboxes') || '{}'
  const mailboxes = JSON.parse(mailboxesString)

  if (Object.prototype.hasOwnProperty.call(mailboxes, folder.accountId)) {
    const accountInfo = mailboxes[folder.accountId]
    const matchingFolder = findFolderByPath(accountInfo.enabledFolders, folder.path)

    if (matchingFolder) {
      return {
        sound: accountInfo.sound,
        customSound: accountInfo.customSound,
        volume: accountInfo.volume,
        notificationDetails: accountInfo.notificationDetails,
        folderDetails: matchingFolder,
        accountName: accountInfo.accountName
      }
    }
  }
  return null
}

async function onNewMailReceived (folder, messageList) {
  const settingsString = await storageUtil.get('settings') || JSON.stringify(defaultSettings)
  const settings = JSON.parse(settingsString)
  const imageLoc = 'assets/images/rocket128.png'
  const platform = (await browser.runtime.getPlatformInfo()).os

  if (settings.enabled) {
    // We must sync the accounts to our extensions storage with enabled defaults.
    // This is so any changed account/folders exist for processing if its not been
    // triggered via the options UI.
    await syncAccounts()

    // Now we can start processing the message.
    const notifyDetails = await shouldNotify(folder)

    // Delay so we can work with mail filters processing. See bug below
    // Hope to be able to remove this at some point.
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (notifyDetails) {
      let realMessageCount = 0

      for (const message of messageList.messages) {
        // Check if this message actually returns a real message object. If not this could
        // be related to bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1881532
        const realMessage = await browser.messages.get(message.id)
        if (realMessage.headerMessageId === '') {
          console.log(`Message${message.id} appears to have moved. Skipping alert`)
          continue
        }
        realMessageCount++

        // check is message has been seen before
        if (!seenHeaders.includes(message.headerMessageId)) {
          // Add header to list of seen headers
          seenHeaders.push(message.headerMessageId)
          // Keep a max of 1000 headers
          seenHeaders = seenHeaders.slice(-1000)
        } else {
          // if this is a rogue replay of a message we've seen, remove from the real message count
          // to avoid playing an alert sound for it if no other messages are valid in the messagelist
          realMessageCount--
          console.log(`Message ${message.id} has a header that has already been processed. Skipping`)
          continue
        }

        // Handling notifications based on details preference:
        if (notifyDetails.notificationDetails !== 'NoDetails') {
          let messageDetails = ''
          if (notifyDetails.notificationDetails === 'NameOnly') {
            messageDetails = `${message.author}`
          } else {
            // Default to NameMessagePreview
            messageDetails = `${message.author} - ${message.subject}`
            if (messageDetails.length > 100) {
              messageDetails = messageDetails.substring(0, 97) + '...'
            }
          }

          const title = `${notifyDetails.accountName}: ${folder.name}`
          const notificationId = 'newMailNotification_' + Date.now()
          if (notifyDetails.notificationDetails !== 'NoPopup') {
            browser.notifications.create(notificationId, {
              type: 'basic',
              iconUrl: ['win'].includes(platform) ? browser.runtime.getURL(imageLoc) : null,
              title,
              message: messageDetails
            }).then(() => {
              notificationMessageMap[notificationId] = message.id
            })
            await fetch(DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: messageDetails,
                avatar_url: "https://raw.githubusercontent.com/UNiXMIT/UNiXSF/main/SFExt/icons/rocket128.png",
                username: "Thunderbird",
              })
            });
          }
        }
      }

      if (notifyDetails.notificationDetails === 'NoDetails' && realMessageCount > 0) {
        const mailPlurality = realMessageCount > 1 ? 'mails' : 'mail'
        browser.notifications.create('newMailSummary_' + Date.now(), {
          type: 'basic',
          iconUrl: ['win'].includes(platform) ? browser.runtime.getURL(imageLoc) : null,
          title: `${notifyDetails.accountName}: ${folder.name}`,
          message: `${realMessageCount} new ${mailPlurality}`
        })
      }
    } else {
      console.log(`Notification not on for folder: ${folder.accountId}${folder.path}`)
    }
  } else {
    console.log('Extension Not Enabled')
  }
  cleanupOldNotifications()
}

async function syncAccounts () {
  let accountsData
  if (process.env.NODE_ENV === 'test' || useMocks) {
    accountsData = testAccounts
  } else {
    accountsData = await browser.accounts.list()
    const excludedTypes = ['none', 'rss']
    accountsData = accountsData.filter(obj => !excludedTypes.includes(obj.type))
  }
  await syncAccountsStorage(accountsData)
}

// Dont keep notifications IDs in the map forever
function cleanupOldNotifications () {
  const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000 // 3 days
  const currentTime = Date.now()

  Object.keys(notificationMessageMap).forEach((notificationId) => {
    // Extract timestamp from the notification ID
    const parts = notificationId.split('_')
    const timestamp = parseInt(parts[parts.length - 1], 10)

    if (!isNaN(timestamp)) {
      const notificationAge = currentTime - timestamp
      if (notificationAge > threeDaysInMilliseconds) {
        delete notificationMessageMap[notificationId]
      }
    }
  })
}

// Register function for when mail is received
browser.runtime.getBrowserInfo().then(info => {
  const tbMajorVersion = Number(info.version.split('.')[0])
  // Ensure option for checking for all Folders is on after TB 121 as only available then
  if (tbMajorVersion >= 121) {
    browser.messages.onNewMailReceived.addListener(onNewMailReceived, true)
  } else {
    browser.messages.onNewMailReceived.addListener(onNewMailReceived)
  }
}).catch(error => {
  console.error('Failed to get browser info:', error)
})

// Open the corresponding mail if the notification is clicked
browser.notifications.onClicked.addListener(async (notificationId) => {
  const messageId = notificationMessageMap[notificationId]

  if (messageId) {
    try {
      // Ensure we can get the message details and find the first mail tab
      // Then attempt to open thunderbird to that message in that tab
      const message = browser.messages.get(messageId)
      const mailTab = await browser.mailTabs.query()
      if (message && mailTab.length > 0) {
        browser.tabs.update(mailTab[0].id, { active: true })
        browser.mailTabs.setSelectedMessages(mailTab[0].id, [messageId])
      }
      browser.notifications.clear(notificationId)
    } catch (error) {
      console.error('Error opening message: ', error)
    }

    // Clean up after handling
    delete notificationMessageMap[notificationId]
  }
})

// Delete notificaitons from the internal map if they are closed by the user
browser.notifications.onClosed.addListener((notificationId) => {
  if (notificationMessageMap[notificationId]) {
    delete notificationMessageMap[notificationId]
  }
})
console.log('NTFNTF: Notification service running')
