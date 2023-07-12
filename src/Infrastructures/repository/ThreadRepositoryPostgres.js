const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedUserThread = require('../../Domains/threads/entities/AddedUserThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
 
class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }
 
  async addThread(userThread) {
    const { title, body, owner } = userThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();
 
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, time, owner',
      values: [id, title, body, date, owner],
    };
 
    const result = await this._pool.query(query);
 
    return new AddedUserThread( result.rows[0] );
  }

  async getThreadById(threadId) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.time AS date, users.username FROM threads INNER JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}
 
module.exports = ThreadRepositoryPostgres;