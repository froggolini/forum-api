const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const detailThread = new DetailThread({
      title: 'abc',
      id: 'thread-123',
      date: '2023',
      body: 'hehehe',
      username: 'dicoding',
    });

    let detailComment = [ new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2023',
        content: 'abc',
        is_delete: false,
      }),
    ];

    detailComment = detailComment.map(({ is_delete: boolean, ...otherProperties }) => otherProperties);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentFromThread = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023',
          content: 'abc',
          is_delete: false,
          thread_id: 'thread-123',
        },
      ]));

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        {
          title: 'abc',
          id: 'thread-123',
          date: '2023',
          body: 'hehehe',
          username: 'dicoding',
        },
      ));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadAndComments = await getThreadUseCase.execute({ threadId });

    // Assert
    expect(threadAndComments).toEqual({ ...detailThread, comments: detailComment });
    expect(mockCommentRepository.getCommentFromThread).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });

  it('should not display comments when deleted', async () => {
    // Arrange
    const threadId = 'thread-123';

    const detailThread = new DetailThread({
      title: 'abc',
      id: 'thread-123',
      date: '2023',
      body: 'hehehe',
      username: 'dicoding',
    });

    let detailComment = [
      new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2023',
        content: '**komentar telah dihapus**',
        is_delete: true,
      }),
    ];

    detailComment = detailComment.map(({ is_delete: boolean, ...otherProperties }) => otherProperties);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentFromThread = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023',
          content: '**komentar telah dihapus**',
          is_delete: true,
          thread_id: 'thread-123',
        },
      ]));

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        {
          title: 'abc',
          id: 'thread-123',
          date: '2023',
          body: 'hehehe',
          username: 'dicoding',
        },
      ));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadAndComments = await getThreadUseCase.execute({ threadId });

    // Assert
    expect(threadAndComments).toEqual({ ...detailThread, comments: detailComment });
    expect(mockCommentRepository.getCommentFromThread).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});