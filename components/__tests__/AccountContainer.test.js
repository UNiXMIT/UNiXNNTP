import { testAccounts } from '../../mocks/testAccounts'
import { testStorage, setTestStorage } from '../../mocks/testStorage'
import { AccountContainer } from '../AccountContainer'
import { playSound } from '../../utils/audio'
import * as vanX from 'vanjs-ext'
import van from 'vanjs-core'

describe('AccountContainer component', () => {
  let account
  let folders
  let container
  let mailboxes

  beforeEach(() => {
    account = testAccounts[0]
    mailboxes = vanX.reactive(JSON.parse(testStorage.mailboxes))
    van.derive(() => setTestStorage('mailboxes', JSON.stringify(mailboxes)))
    folders = mailboxes.account1
    container = AccountContainer(account, folders)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders correctly', async () => {
    expect(container).toMatchSnapshot()
  })

  const recursivelyCheckFolders = (folders, isEnabled) => {
    Object.values(folders).forEach(folder => {
      expect(folder.enabled).toBe(isEnabled)
      if (folder.subFolders) {
        recursivelyCheckFolders(folder.subFolders, isEnabled)
      }
    })
  }

  it('setAllSubFoldersEnabled sets all subfolders enabled state correctly when "All" is clicked', () => {
    // Find and click the 'All' link
    const allLink = document.querySelector('a[href="#"]:first-child')
    allLink.click()

    // Check if all folders and subfolders are enabled
    recursivelyCheckFolders(folders.enabledFolders, true)
  })

  it('setAllSubFoldersEnabled sets all subfolders enabled state correctly when "None" is clicked', () => {
    // Find and click the 'None' link
    const noneLink = document.querySelector('a[href="#"]:last-child')
    noneLink.click()

    // Check if all folders and subfolders are disabled
    recursivelyCheckFolders(folders.enabledFolders, false)
  })
})

describe('AccountContainer component - Volume Control', () => {
  let account
  let folders
  let container
  let mailboxes

  // Set up for mocking the playSound function
  const mockPlaySound = jest.spyOn(playSound, 'play')
  window.HTMLMediaElement.prototype.play = jest.fn()

  beforeEach(() => {
    account = testAccounts[0]
    mailboxes = vanX.reactive(JSON.parse(testStorage.mailboxes))
    van.derive(() => setTestStorage('mailboxes', JSON.stringify(mailboxes)))
    folders = mailboxes.account1
    container = AccountContainer(account, folders)
    document.body.appendChild(container)
    mockPlaySound.mockClear() // Clearing calls to mock function between tests
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.HTMLMediaElement.prototype.play.mockRestore()
  })

  it('updates volume correctly and plays sound when volume range is changed', () => {
    // Initial assert to ensure playSound hasn't been called yet
    expect(mockPlaySound).not.toHaveBeenCalled()

    // Set a non-custom sound
    folders.sound = 'sound1.mp3'

    // Find the volume range input
    const volumeRangeInput = document.querySelector('#volRange')
    expect(volumeRangeInput).not.toBeNull()

    // Create and dispatch the click event with a new volume value
    const newVolume = '0.5'
    volumeRangeInput.value = newVolume
    volumeRangeInput.dispatchEvent(new Event('click'))

    // Ensure folders.volume is updated correctly
    expect(folders.volume).toBe(newVolume)

    // Ensure playSound.play was called with correct arguments for non-custom sound
    expect(mockPlaySound).toHaveBeenCalledWith(`assets/sounds/${folders.sound}`, newVolume)

    // Expect the Audio play function to be eventually called
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('updates volume correctly and plays custom sound when volume range is changed', () => {
    // Initial assert to ensure playSound hasn't been called yet
    expect(mockPlaySound).not.toHaveBeenCalled()

    // Set a custom sound
    folders.sound = 'customSound'
    folders.customSound = 'data:audio/wav;base64,aGVsbG8gd29ybGQ='

    // Find the volume range input
    const volumeRangeInput = document.querySelector('#volRange')
    expect(volumeRangeInput).not.toBeNull()

    // Create and dispatch the click event with a new volume value
    const newVolume = '0.5'
    volumeRangeInput.value = newVolume
    volumeRangeInput.dispatchEvent(new Event('click'))

    // Ensure folders.volume is updated correctly
    expect(folders.volume).toBe(newVolume)

    // Ensure playSound.play was called with correct arguments for custom sound
    expect(mockPlaySound).toHaveBeenCalledWith(folders.customSound, newVolume)

    // Expect the Audio play function to be eventually called
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })
})
