import * as vanX from 'vanjs-ext'
import { FolderList, setAllSubFoldersEnabled } from '../FolderList' // Update the import path according to your file structure.

describe('FolderList component', () => {
  let accountMock
  let folderList

  beforeEach(() => {
    // Setup the mock account data before each test
    accountMock = vanX.reactive({
      enabledFolders: {
        Inbox: {
          enabled: false,
          subFolders: {
            Important: { enabled: false },
            Work: { enabled: false }
          }
        }
      }
    })
    // Create the FolderList with the mock account data
    folderList = FolderList(accountMock)
    document.body.appendChild(folderList) // Append the folderList to the jsdom body
  })

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = ''
  })

  it('should properly toggle enabled state of all subfolders to true when "All" is clicked', () => {
    // Simulate clicking "All" to enable all subfolders
    const allLink = document.querySelector('.all')
    allLink.click()

    // Check if the subfolders are now enabled
    expect(accountMock.enabledFolders.Inbox.enabled).toBe(true)
    expect(accountMock.enabledFolders.Inbox.subFolders.Important.enabled).toBe(true)
    expect(accountMock.enabledFolders.Inbox.subFolders.Work.enabled).toBe(true)
  })

  it('should properly toggle enabled state of all subfolders to false when "None" is clicked', () => {
    // Initially set all subfolders to true
    setAllSubFoldersEnabled(accountMock.enabledFolders.Inbox, true)

    // Simulate clicking "None" to disable all subfolders
    const noneLink = document.querySelector('.none')
    noneLink.click()

    // Check if the subfolders are now disabled
    expect(accountMock.enabledFolders.Inbox.enabled).toBe(false)
    expect(accountMock.enabledFolders.Inbox.subFolders.Important.enabled).toBe(false)
    expect(accountMock.enabledFolders.Inbox.subFolders.Work.enabled).toBe(false)
  })

  it('should properly toggle enabled state of a folder when its checkbox is clicked', () => {
    // Initially set the folder to false
    accountMock.enabledFolders.Inbox.enabled = false

    // Simulate clicking the checkbox to enable the folder
    const folderCheckbox = document.querySelector('input[data-mailbox-path="Inbox"]')
    folderCheckbox.click()

    // Check if the folder is now enabled
    expect(accountMock.enabledFolders.Inbox.enabled).toBe(true)

    // Simulate clicking the checkbox again to disable the folder
    folderCheckbox.click()

    // Check if the folder is now disabled
    expect(accountMock.enabledFolders.Inbox.enabled).toBe(false)
  })

  it('renders correctly', async () => {
    const FolderListHTML = FolderList(accountMock)
    expect(FolderListHTML).toMatchSnapshot()
  })
})
