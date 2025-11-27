/* globals MouseEvent */
import { Dropdown } from '../Dropdown'
import * as audio from '../../utils/audio' // import the audio module

const mockDropLabel = 'Test: '
const mockSoundStateKey = 'sound'
const mockNonSoundStateKey = 'color'
const mockMap = { 'sound1.mp3': 'Sound 1', 'sound2.mp3': 'Sound 2', none: 'No Sound', customSound: 'Custom' }
const mockNonSoundMap = { red: 'Red', blue: 'Blue' }
const mockAccountData = { sound: 'sound1.mp3', customSound: '' }
const mockNonSoundAccountData = { color: 'red', size: 'large' }

jest.mock('../../utils/audio', () => ({
  playSound: {
    play: jest.fn()
  }
}))

const setupDropdown = (stateKey, map, accountData) => {
  document.body.innerHTML = '' // reset the document body
  const dropdown = Dropdown(mockDropLabel, stateKey, map, accountData)
  document.body.appendChild(dropdown)
  return dropdown
}

const clickDropdownToOpen = () => {
  const dropdownButton = document.querySelector('button.dropdown-toggle')
  dropdownButton.click()
}

const findAndClickPlayIcon = (text) => {
  const optionElement = Array.from(document.querySelectorAll('.dropdown-item'))
    .find(option => option.textContent.includes(text))
  if (optionElement) {
    const playIcon = optionElement.querySelector('.playicon')
    if (playIcon) {
      playIcon.click()
    }
  }
}

const findAndClickSettingsIcon = (text) => {
  const optionElement = Array.from(document.querySelectorAll('.dropdown-item'))
    .find(option => option.textContent.includes(text))
  if (optionElement) {
    const settingsIcon = optionElement.querySelector('.settingsicon')
    if (settingsIcon) {
      settingsIcon.click()
    }
  }
}

const findAndDispatchEvent = (text, event = 'click') => {
  const optionElement = Array.from(document.querySelectorAll('.dropdown-item'))
    .find(option => option.textContent === text)
  if (optionElement) {
    optionElement.dispatchEvent(new MouseEvent(event))
  }
}

describe('Dropdown component', () => {
  it('renders correctly', () => {
    const dropdown = setupDropdown(mockSoundStateKey, mockMap, mockAccountData)
    expect(dropdown).toMatchSnapshot()
  })

  it('changes selection when a new option is clicked', () => {
    setupDropdown(mockSoundStateKey, mockMap, mockAccountData)
    clickDropdownToOpen()
    findAndDispatchEvent(mockMap['sound2.mp3'])
    expect(mockAccountData[mockSoundStateKey]).toBe('sound2.mp3')
  })

  it('plays sound when the play icon of an option is clicked', () => {
    setupDropdown(mockSoundStateKey, mockMap, mockAccountData)
    clickDropdownToOpen()
    findAndClickPlayIcon(mockMap['sound2.mp3'])
    expect(audio.playSound.play).toHaveBeenCalled()
  })

  it('does not play sound when the play icon of an option is clicked if the dropdown is not of type sound', () => {
    setupDropdown(mockNonSoundStateKey, mockNonSoundMap, mockNonSoundAccountData)
    clickDropdownToOpen()
    findAndClickPlayIcon(mockNonSoundMap.blue)
    expect(audio.playSound.play).not.toHaveBeenCalled()
  })

  it('opens file dialog when the settings icon for custom sound is clicked', () => {
    setupDropdown(mockSoundStateKey, mockMap, mockAccountData)
    clickDropdownToOpen()

    const originalCreateElement = document.createElement
    const mockClick = jest.fn()

    document.createElement = jest.fn((tagName) => {
      if (tagName === 'input') {
        const input = originalCreateElement.call(document, tagName)
        input.click = mockClick
        return input
      }
      return originalCreateElement.call(document, tagName)
    })

    findAndClickSettingsIcon(mockMap.customSound)
    expect(mockClick).toHaveBeenCalled()

    // Restore original createElement function
    document.createElement = originalCreateElement
  })

  test.skip('updates customSound in accountData when a file is selected', () => {
    // Implementation would go here, but mocking FileReader proves unreliable
    // Thus we are skipping this until we find a more robust testing strategy
  })

  it('plays the custom sound when the custom sound option is clicked', () => {
    mockAccountData.customSound = 'data:audio/wav;base64,aGVsbG8gd29ybGQ='
    setupDropdown(mockSoundStateKey, mockMap, mockAccountData)
    clickDropdownToOpen()
    findAndClickPlayIcon(mockMap.customSound)
    expect(audio.playSound.play).toHaveBeenCalledWith('data:audio/wav;base64,aGVsbG8gd29ybGQ=', undefined)
  })
})
