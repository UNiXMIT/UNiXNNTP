const imageLoc = 'https://raw.githubusercontent.com/UNiXMIT/UNiXNNTP/main/src/icons/rocket128.png'
let globalWebhook;
const notificationMessageMap = {}
let seenHeaders = []
const discordMaxRequests = 5;
const discordMaxTime = 5000;
let callQueue = []; 
let pendingQueue = []; 
let isProcessing = false;

browser.storage.local.get("savedWebhook").then(result => {
  globalWebhook = result.savedWebhook || null;
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.savedWebhook) {
    globalWebhook = changes.savedWebhook.newValue;
  }
});

async function onNewMailReceived (folder, messageList) {
  console.log(`New mail received in folder: ${folder.name}, ${messageList.messages.length} messages`)
  const platform = (await browser.runtime.getPlatformInfo()).os
  await new Promise(resolve => setTimeout(resolve, 2000))
  let realMessageCount = 0
  for (const message of messageList.messages) {
    // Check if this message actually returns a real message object. If not this could
    // be related to bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1881532
    const realMessage = await browser.messages.get(message.id)
    if (realMessage.headerMessageId === '') {
      continue
    }
    realMessageCount++
    if (!seenHeaders.includes(message.headerMessageId)) {
      seenHeaders.push(message.headerMessageId)
      seenHeaders = seenHeaders.slice(-1000)
    } else {
      realMessageCount--
      continue
    }
    let messageDetails = ''
    messageDetails = `${message.author} - ${message.subject}`
    if (messageDetails.length > 100) {
      messageDetails = messageDetails.substring(0, 97) + '...'
    }
    const title = `${folder.name}`
    const notificationId = 'newMailNotification_' + Date.now()
    browser.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: ['win'].includes(platform) ? imageLoc : null,
      title,
      message: messageDetails
    }).then(() => {
      notificationMessageMap[notificationId] = message.id
    })
    if (globalWebhook) {
      rateLimitedNotifyDiscord(title, messageDetails);
    }
  }
  cleanupOldNotifications()
}

function notifyDiscord(title, message) {
    fetch(globalWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        avatar_url: imageLoc,
        username: title,
      })
    })
}

function processQueue() {
    if (isProcessing || pendingQueue.length === 0) {
        return;
    }
    isProcessing = true;
    const now = Date.now();
    callQueue = callQueue.filter(timestamp => now - timestamp < discordMaxTime);
    if (callQueue.length < discordMaxRequests) {
        const args = pendingQueue.shift();
        const [title, message] = args;
        notifyDiscord(title, message);
        callQueue.push(Date.now());
        isProcessing = false;
        processQueue(); 
    } else {
        const oldestCallTime = callQueue[0];
        const waitTime = oldestCallTime + discordMaxTime - now;
        setTimeout(() => {
            isProcessing = false;
            processQueue();
        }, waitTime);
    }
}

function rateLimitedNotifyDiscord(title, message) {
    pendingQueue.push([title, message]);
    processQueue();
}

function cleanupOldNotifications () {
  const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000 // 3 days
  const currentTime = Date.now()
  Object.keys(notificationMessageMap).forEach((notificationId) => {
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

browser.runtime.getBrowserInfo().then(info => {
  const tbMajorVersion = Number(info.version.split('.')[0])
  if (tbMajorVersion >= 121) {
    browser.messages.onNewMailReceived.addListener(onNewMailReceived, true)
  } else {
    browser.messages.onNewMailReceived.addListener(onNewMailReceived)
  }
}).catch(error => {
  console.error('Failed to get browser info:', error)
})

browser.notifications.onClicked.addListener(async (notificationId) => {
  const messageId = notificationMessageMap[notificationId]

  if (messageId) {
    try {
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
    delete notificationMessageMap[notificationId]
  }
})

browser.notifications.onClosed.addListener((notificationId) => {
  if (notificationMessageMap[notificationId]) {
    delete notificationMessageMap[notificationId]
  }
})

const keepAlive = () => setInterval(browser.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();