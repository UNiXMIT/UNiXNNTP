import { setUseMocks, storageUtil } from '../../utils/storage'
import { delTestStorage } from '../../mocks/testStorage'
import { GlobalSettings } from '../GlobalSettings'

setUseMocks(true)

// Mock window.location.reload
delete window.location
window.location = { reload: jest.fn() }

describe('GlobalSettings component', () => {
  let component

  beforeEach(async () => {
    // Render the component before each test
    component = await GlobalSettings()
    document.body.appendChild(component)
  })

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = ''
  })

  it('renders correctly', () => {
    expect(component).toMatchSnapshot()
  })

  it('clicks on the "Enabled" label', () => {
    const label = document.querySelector('.form-check-label')
    label.click()
    expect(label.textContent).toBe('Enabled')
  })

  it('clicks on the "Reset All" button', async () => {
    const button = document.querySelector('#resetButton')
    button.click()

    // Check if the correct settings in the storage were changed
    const settings = await storageUtil.get('settings')
    const mailboxes = await storageUtil.get('mailboxes')
    expect(settings).toBe(null)
    expect(mailboxes).toEqual('{}')

    // Check if window.location.reload was called
    expect(window.location.reload).toHaveBeenCalled()
  })
})

describe('globalSettings initialization', () => {
  beforeEach(() => {
    setUseMocks(true)
    delTestStorage('settings')
  })

  it('creates default settings in storage if initially absent', async () => {
    // Call the method which should create `settings` if not present
    await GlobalSettings()

    const updatedSettings = JSON.parse(await storageUtil.get('settings'))
    expect(updatedSettings).toHaveProperty('enabled')
    expect(updatedSettings).toHaveProperty('version')
  })
})
