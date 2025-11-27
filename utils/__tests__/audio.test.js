import { playSound } from '../audio'

describe('playSound', () => {
  it('plays a sound', () => {
    // Mock the Audio object and its methods
    const mockPlay = jest.fn()
    global.Audio = jest.fn().mockImplementation(() => {
      return { play: mockPlay }
    })

    playSound.play('test.mp3')

    // Verify that the Audio object was created with the correct file name
    expect(global.Audio).toHaveBeenCalledWith('test.mp3')

    // Verify that the play method was called
    expect(mockPlay).toHaveBeenCalled()
  })

  it('throws an error when no file name is provided', () => {
    expect(() => playSound.play()).toThrow('No sound file or data provided')
  })
})
