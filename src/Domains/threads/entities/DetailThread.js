class DetailThread {
    constructor(payload) {
      this._verifyPayload(payload);
  
      const { id, title, body, date, username } = payload;

      this.id = id;
      this.title = title;
      this.body = body;
      this.date = date;
      this.username = username;
    }
  
    _verifyPayload({ title, id, date, body, username }) {
      if (!title || !id || !date || !body || !username) {
        throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
      }
  
      if (typeof title !== 'string' || typeof id !== 'string' || typeof date !== 'string' || typeof body !== 'string' || typeof username !== 'string') {
        throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
    }
  }
  
  module.exports = DetailThread;