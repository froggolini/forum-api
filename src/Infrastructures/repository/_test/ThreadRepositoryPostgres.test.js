const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const UserThread = require('../../../Domains/threads/entities/UserThread');
const AddedUserThread = require('../../../Domains/threads/entities/AddedUserThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
 
describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();  
    await UsersTableTestHelper.cleanTable();
  });
 
  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread', async () => {
      // Arrange
      const userThread = new UserThread({
        title: 'abc',
        body: 'hehehe',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      await threadRepositoryPostgres.addThread(userThread);
 
      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });
 
    it('should return added thread correctly', async () => {
      // Arrange
      const userThread = new UserThread({
        title: 'abc',
        body: 'hehehe',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      const addedUserThread = await threadRepositoryPostgres.addThread(userThread);
 
      // Assert
      expect(addedUserThread).toStrictEqual(new AddedUserThread({
        id: 'thread-123',
        title: 'abc',
        owner: 'user-123',
      }));
    });
  });

  describe('getThread function', () => {
    it('should get thread correctly', async () => {
      // Arrange
      const userThread = new UserThread({
        id: 'thread-123',
        title: 'abc',
        body: 'hehehe',
        owner: 'user-123',
        date: '2023'
      });

      await ThreadsTableTestHelper.addThread(userThread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123', 
        title: userThread.title, 
        body: userThread.body,  
        date: '2023',
        username: 'dicoding',
      });
    });

    it('should return NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyThreadExist', () => {
    it('should throw NotFoundError when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-321'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread exist', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});