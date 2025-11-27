export const testStorage = {
  // Add predefined keys and values for testing here
  settings: '{"enabled":true,"version":1}',
  mailboxes: `{
        "account1": {
            "sound": "pop.mp3",
            "volume": 1,
            "enabledFolders": {
                "Inbox": {
                    "enabled": true,
                    "path": "/Inbox",
                    "subFolders": {
                        "Sub Inbox": {
                            "enabled": true,
                            "path": "/Inbox/Sub Inbox",
                            "subFolders": {}
                        },
                        "Another": {
                            "enabled": true,
                            "path": "/Inbox/Another",
                            "subFolders": {}
                        }
                    }
                },
                "Stuff": {
                    "enabled": true,
                    "path": "/Stuff",
                    "subFolders": {}
                }
            },
            "notificationDetails": "NameMessagePreview"
        },
        "account2": {
            "sound": "ding.mp3",
            "volume": 0.5,
            "enabledFolders": {
                "Inbox": {
                    "enabled": true,
                    "path": "/Inbox",
                    "subFolders": {
                        "Sub Inbox": {
                            "enabled": true,
                            "path": "/Inbox/Sub Inbox",
                            "subFolders": {}
                        }
                    }
                },
                "Drafts": {
                    "enabled": true,
                    "path": "/Drafts",
                    "subFolders": {}
                }
            },
            "notificationDetails": "NameMessagePreview"
        }
    }`
}

export function setTestStorage (key, value) {
  testStorage[key] = value
}

export function delTestStorage (key) {
  delete testStorage[key]
}
