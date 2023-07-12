const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserComment = require('../../../Domains/comments/entities/UserComment');
const AddedUserComment = require('../../../Domains/comments/entities/AddedUserComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable(); 
    await ThreadsTableTestHelper.cleanTable(); 
    await UsersTableTestHelper.cleanTable();
  });
 
  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment', async () => {
      // Arrange
      const userComment = new UserComment({
        content: 'abc',
        threadId: 'thread-123',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      await commentRepositoryPostgres.addComment(userComment);
 
      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });
 
    it('should return added comment correctly', async () => {
      // Arrange
      const userComment = new UserComment({
        content: 'abc',
        threadId: 'thread-123',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      const addedUserComment = await commentRepositoryPostgres.addComment(userComment);
 
      // Assert
      expect(addedUserComment).toStrictEqual(new AddedUserComment({
        id: 'comment-123',
        content: 'abc',
        owner: 'user-123'
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return AuthorizationError when comment owner != real owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321')).rejects.toThrow(AuthorizationError);
    });

    it('should not return AuthorizationError when comment owner is the real owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comment[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when comment not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentExist function', () => {
    it('should return NotFoundError when comment in thread != exist', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-321' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123', 'thread-321')).rejects.toThrow(NotFoundError);
    });

    it('should not return NotFoundError when comment in thread is exist', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123', 'thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getCommentFromThread function', () => {
    it('should return comments from thread correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const result = await commentRepositoryPostgres.getCommentFromThread('thread-123');

      // Assert
      expect(result).toStrictEqual([
        {
          id: 'comment-123',
          thread_id: 'thread-123',
          owner: 'user-123',
          content: 'abc',
          date: '2023',
          is_delete: false,
          username: 'dicoding',
        },
      ]);
    });
  });
});