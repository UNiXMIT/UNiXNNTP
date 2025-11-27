export const testAccounts = [
  {
    id: 'account1',
    name: 'test1@example.com',
    type: 'imap',
    folders: [
      {
        accountId: 'account1',
        name: 'Inbox',
        path: '/INBOX',
        type: 'inbox',
        subFolders: []
      },
      {
        accountId: 'account1',
        name: 'Org',
        path: '/Org',
        subFolders: [
          {
            accountId: 'account1',
            name: 'Todo',
            path: '/Org/Todo',
            subFolders: []
          },
          {
            accountId: 'account1',
            name: 'Doing',
            path: '/Org/Doing',
            subFolders: []
          },
          {
            accountId: 'account1',
            name: 'Done',
            path: '/Org/Done',
            subFolders: []
          }
        ]
      },
      {
        accountId: 'account1',
        name: 'Keep',
        path: '/Keep',
        subFolders: []
      },
      {
        accountId: 'account1',
        name: 'Notes',
        path: '/Notes',
        subFolders: [
          {
            accountId: 'account1',
            name: 'Nested',
            path: '/Notes/Nested',
            subFolders: [
              {
                accountId: 'account1',
                name: 'NestedNested',
                path: '/Notes/Nested/Nested',
                subFolders: []
              }
            ]
          }
        ]
      }
    ],
    identities: [
      {
        accountId: 'account1',
        id: 'id1',
        label: '',
        name: 'Test Person',
        email: 'test1@example.com',
        replyTo: '',
        organization: '',
        composeHtml: true,
        signature: '',
        signatureIsPlainText: true
      }
    ]
  },
  {
    id: 'account2',
    name: 'test2@example.com',
    type: 'imap',
    folders: [
      {
        accountId: 'account2',
        name: 'Inbox',
        path: '/INBOX',
        type: 'inbox',
        subFolders: []
      },
      {
        accountId: 'account2',
        name: 'Org',
        path: '/Org',
        subFolders: [
          {
            accountId: 'account2',
            name: 'Todo',
            path: '/Org/Todo',
            subFolders: []
          },
          {
            accountId: 'account2',
            name: 'Doing',
            path: '/Org/Doing',
            subFolders: []
          },
          {
            accountId: 'account2',
            name: 'Done',
            path: '/Org/Done',
            subFolders: []
          }
        ]
      },
      {
        accountId: 'account2',
        name: 'Keep',
        path: '/Keep',
        subFolders: []
      },
      {
        accountId: 'account2',
        name: 'Notes',
        path: '/Notes',
        subFolders: [
          {
            accountId: 'account2',
            name: 'Nested',
            path: '/Notes/Nested',
            subFolders: [
              {
                accountId: 'account2',
                name: 'NestedNested',
                path: '/Notes/Nested/Nested',
                subFolders: []
              }
            ]
          }
        ]
      }
    ],
    identities: [
      {
        accountId: 'account2',
        id: 'id2',
        label: '',
        name: 'Test Person',
        email: 'test2@example.com',
        replyTo: '',
        organization: '',
        composeHtml: true,
        signature: '',
        signatureIsPlainText: true
      }
    ]
  },
  {
    id: 'account4',
    name: 'Blogs & News Feeds',
    type: 'rss',
    folders: [
      {
        accountId: 'account4',
        name: 'Trash',
        path: '/Trash',
        type: 'trash',
        subFolders: []
      },
      {
        accountId: 'account4',
        name: 'News - Get your hot news here',
        path: '/News - Get your hot news here',
        subFolders: [
          {
            accountId: 'account4',
            name: 'Hottest News',
            path: '/News - Get your hot news here/Hottest News',
            subFolders: [
              {
                accountId: 'account4',
                name: 'Super Hot',
                path: '/News - Get your hot news here/Hottest News/Super Hot',
                subFolders: []
              }
            ]
          }
        ]
      }
    ],
    identities: []
  }
]
