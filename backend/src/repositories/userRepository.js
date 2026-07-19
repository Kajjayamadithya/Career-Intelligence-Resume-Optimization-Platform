const User = require('../models/user');

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email, selectFields = '') {
    let query = User.findOne({ email });
    if (selectFields) {
      query = query.select(selectFields);
    }
    return await query;
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async addRefreshToken(id, token) {
    return await User.findByIdAndUpdate(
      id,
      { $push: { refreshTokens: token } },
      { new: true }
    );
  }

  async removeRefreshToken(id, token) {
    return await User.findByIdAndUpdate(
      id,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  async clearRefreshTokens(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { refreshTokens: [] } },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
