const UserThread = require('../../../Domains/threads/entities/UserThread');
const AddedUserThread = require('../../../Domains/threads/entities/AddedUserThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
 
describe('AddThreadUseCase', () => {
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'abc',
      body: 'hehehe',
      owner: 'user-123'
    };
    const mockAddedUserThread = new AddedUserThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });
 
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
 
    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedUserThread));
 
    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
 
    // Action
    const addedUserThread = await getThreadUseCase.execute(useCasePayload);
 
    // Assert
    expect(addedUserThread).toStrictEqual(new AddedUserThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.addThread).toBeCalledWith(new UserThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});