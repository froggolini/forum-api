const AddedUserComment = require('../AddedUserComment');

describe('a AddedUserComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Dicoding Indonesia',
    };

    // Action and Assert
    expect(() => new AddedUserComment(payload)).toThrowError('ADDED_USER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedUserComment(payload)).toThrowError('ADDED_USER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedUserComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'abc',
      owner: 'user-123',
    };

    // Action
    const addedUserComment = new AddedUserComment(payload);

    // Assert
    expect(addedUserComment.id).toEqual(payload.id);
    expect(addedUserComment.content).toEqual(payload.content);
    expect(addedUserComment.owner).toEqual(payload.owner);
  });
});
