const UserComment = require('../UserComment');

describe('a UserComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
      // Arrange
      const payload = {
        content: 'abc',
      };
   
      // Action and Assert
      expect(() => new UserComment(payload)).toThrowError('USER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        content: 123,
        threadId: true,
        owner: {}
      };

      // Action and Assert
      expect(() => new UserComment(payload)).toThrowError('USER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create userComment object correctly', () => {
      // Arrange
      const payload = {
        content: 'abc',
        threadId: 'thread-123',
        owner: 'user-123',
      };
  
      // Action
      const { content, threadId, owner } = new UserComment(payload);
  
      // Assert
      expect(content).toEqual(payload.content);
      expect(threadId).toEqual(payload.threadId);
      expect(owner).toEqual(payload.owner);
    });
  });