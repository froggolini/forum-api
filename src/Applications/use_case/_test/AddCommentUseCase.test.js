const UserComment = require('../../../Domains/comments/entities/UserComment');
const AddedUserComment = require('../../../Domains/comments/entities/AddedUserComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddCommentUseCase = require('../AddCommentUseCase');
 
describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'abc',
      threadId: 'thread-123',
      owner: 'user-123'
    };
    const mockAddedUserComment = new AddedUserComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
 
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
 
    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedUserComment));
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
 
    // Action
    const addedUserComment = await getCommentUseCase.execute(useCasePayload);
 
    // Assert
    expect(addedUserComment).toStrictEqual(new AddedUserComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(new UserComment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
  });
});