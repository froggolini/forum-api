const UserThread = require('../../Domains/threads/entities/UserThread');
 
class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }
 
  async execute(useCasePayload) {
    const addedUserThread = new UserThread(useCasePayload);
    return this._threadRepository.addThread(addedUserThread);
  }
}

module.exports = AddThreadUseCase;