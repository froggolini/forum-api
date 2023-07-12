const UserComment = require('../../Domains/comments/entities/UserComment');
 
class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }
 
  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload.threadId);
    const userComment = new UserComment(useCasePayload);
    return this._commentRepository.addComment(userComment);
  }
}

module.exports = AddCommentUseCase;