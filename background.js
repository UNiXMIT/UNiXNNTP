const imageLoc = 'https://raw.githubusercontent.com/UNiXMIT/UNiXSF/refs/heads/main/SFExt/icons/rocket128.png'
const DISCORD_WEBHOOK_URL = "https://webhook.lewisakura.moe/api/webhooks/1443945438062444705/IxYX-dMn3c3z0nfpVYudDkoz8fv4vKU7cKTtCd248M03BU-TfU7PGobht8IYV2cFHI1b";
// Object to keep the messageId for each notification
const notificationMessageMap = {}
// Array to keep the seen headers to prevent duplicate notifications
let seenHeaders = []
// Configuration for the rate limit
const MAX_CALLS = 5;
const TIME_WINDOW_MS = 10000; // 5 seconds

// State variables for the rate limiter
let callQueue = []; // Stores the timestamps of recent successful calls
let pendingQueue = []; // Stores arguments for notifications waiting to be sent
let isProcessing = false;

async function onNewMailReceived (folder, messageList) {
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
      continue
    }

    // Handling notifications based on details preference:
    let messageDetails = ''
    // Default to NameMessagePreview
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

    // Send to Discord Webhook
    if (DISCORD_WEBHOOK_URL) {
      rateLimitedNotifyDiscord(title, messageDetails);
    }
  }
  cleanupOldNotifications()
}

function notifyDiscord(title, message) {
    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        avatar_url: imageLoc,
        username: title,
      })
    })
    .then(response => {
      if (!response.ok) {
        console.error('Error sending Discord notification:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error sending Discord notification:', error);
    });
}

function processQueue() {
    if (isProcessing || pendingQueue.length === 0) {
        return;
    }

    isProcessing = true;

    // 1. Clean up old timestamps from the call queue
    const now = Date.now();
    callQueue = callQueue.filter(timestamp => now - timestamp < TIME_WINDOW_MS);

    // 2. Check if we are within the limit
    if (callQueue.length < MAX_CALLS) {
        // We can send the notification!
        const args = pendingQueue.shift();
        const [title, message] = args;

        // Call the original function
        notifyDiscord(title, message);

        // Record the new call timestamp
        callQueue.push(Date.now());

        // Immediately try to process the next item (to potentially fill up the slot)
        isProcessing = false;
        processQueue(); 
    } else {
        // We have hit the rate limit. Calculate time until the oldest timestamp expires.
        const oldestCallTime = callQueue[0];
        const waitTime = oldestCallTime + TIME_WINDOW_MS - now;
        
        console.log(`Rate limit reached. Waiting ${waitTime}ms before retrying.`);

        // Set a timer to retry processing the queue after the necessary wait time
        setTimeout(() => {
            isProcessing = false;
            processQueue();
        }, waitTime);
    }
}

function rateLimitedNotifyDiscord(title, message) {
    // Add the new request to the queue
    pendingQueue.push([title, message]);
    
    // Attempt to process the queue immediately
    processQueue();
}

// Don't keep notifications IDs in the map forever
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