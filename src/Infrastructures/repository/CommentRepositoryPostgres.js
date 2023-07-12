const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedUserComment = require('../../Domains/comments/entities/AddedUserComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
 
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }
 
  async addComment(userComment) {
    const { content, threadId, owner } = userComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
 
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, thread_id, time, owner',
      values: [id, content, threadId, date, owner],
    };
 
    const result = await this._pool.query(query);
 
    return new AddedUserComment({ ...result.rows[0] });
  }

  async getCommentFromThread(threadId) {
    const query = {
      text: 'SELECT comments.id, comments.content, comments.thread_id, comments.time AS date, comments.owner, comments.is_delete, users.username FROM comments INNER JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.time ASC',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    // if (!result.rows.length) {
    //   throw new NotFoundError('Comment tidak ditemukan');
    // }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async verifyCommentExist(commentId, threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }
}
 
module.exports = CommentRepositoryPostgres;