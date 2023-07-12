const UserThread = require('../UserThread');

describe('a UserThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
      // Arrange
      const payload = {
        title: 'abc',
      };
   
      // Action and Assert
      expect(() => new UserThread(payload)).toThrowError('USER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        title: 123,
        body: true,
        owner: {}
      };

      // Action and Assert
      expect(() => new UserThread(payload)).toThrowError('USER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create userThread object correctly', () => {
      // Arrange
      const payload = {
        title: 'abc',
        body: 'hehehe',
        owner: 'user-123',
      };
  
      // Action
      const { title, body, owner } = new UserThread(payload);
  
      // Assert
      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(owner).toEqual(payload.owner);
    });
  });