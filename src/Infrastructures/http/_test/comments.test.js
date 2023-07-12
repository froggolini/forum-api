const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersAuthTestHelper = require('../../../../tests/UsersAuthTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'abc'
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { userId, accessToken } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);
      const { userId, accessToken } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 401 when adding comments with no authentication', async () => {
        // Arrange
        const requestPayload = {
          content: 'abc',
        };

        const server = await createServer(container);
        const { userId } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
        const threadId = 'thread-123';
        await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'abc',
      };

      const server = await createServer(container);
      const { accessToken, userId } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-321/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /comments/', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);
      const { userId } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);
      const { userId, accessToken } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-321/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when user is not owner', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);
      const { userId, accessToken } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'Another User' });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123', threadId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200 and delete comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);
      const { userId, accessToken } = await UsersAuthTestHelper.getUserIdAndAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
