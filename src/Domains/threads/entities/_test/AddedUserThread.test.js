const AddedUserThread = require('../AddedUserThread');

describe('a AddedUserThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Indonesia',
    };

    // Action and Assert
    expect(() => new AddedUserThread(payload)).toThrowError('ADDED_USER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'dicoding',
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedUserThread(payload)).toThrowError('ADDED_USER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedUserThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'abc',
      owner: 'user-123',
    };

    // Action
    const addedUserThread = new AddedUserThread(payload);

    // Assert
    expect(addedUserThread.id).toEqual(payload.id);
    expect(addedUserThread.title).toEqual(payload.title);
    expect(addedUserThread.owner).toEqual(payload.owner);
  });
});
