import { FolderContainer } from '../FolderContainer'

describe('FolderContainer', () => {
  it('renders correctly', () => {
    // Here we are creating an instance of the FolderContainer
    const container = FolderContainer()
    // We are using Jest's 'expect' function to check if the container matches the previous snapshot
    expect(container).toMatchSnapshot()
  })
})
