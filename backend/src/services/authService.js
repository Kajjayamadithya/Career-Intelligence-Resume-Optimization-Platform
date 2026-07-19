const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
  // Generate Access and Refresh JWT Tokens
  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Register user service
  async registerUser({ name, email, password, role }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    // Create user in DB
    const user = await userRepository.create({
      name,
      email,
      password,
      role: role || 'Student'
    });

    const tokens = this.generateTokens(user);
    
    // Save refresh token
    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    // Return user without password and tokens
    const userJson = user.toJSON();
    delete userJson.password;
    
    return {
      user: userJson,
      ...tokens
    };
  }

  // Login user service
  async loginUser({ email, password }) {
    // Check if user exists (explicitly select password field)
    const user = await userRepository.findByEmail(email, '+password +refreshTokens');
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    
    // Store refresh token
    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    const userJson = user.toJSON();
    delete userJson.password;
    delete userJson.refreshTokens;

    return {
      user: userJson,
      ...tokens
    };
  }

  // Refresh Token Rotation Service
  async refreshAccessToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      const error = new Error('Refresh token is required.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
      );
      
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      // Check user model select refresh tokens list (we need to select it explicitly since it's hidden)
      const userWithTokens = await userRepository.findByEmail(user.email, '+refreshTokens');
      
      if (!userWithTokens.refreshTokens.includes(oldRefreshToken)) {
        // Reuse detection / compromised token! Clear all sessions for safety.
        await userRepository.clearRefreshTokens(user._id);
        const error = new Error('Invalid refresh token session. Please log in again.');
        error.statusCode = 403;
        throw error;
      }

      // Generate new token pair (refresh token rotation)
      const tokens = this.generateTokens(user);

      // Rotate tokens in DB
      await userRepository.removeRefreshToken(user._id, oldRefreshToken);
      await userRepository.addRefreshToken(user._id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Invalid or expired refresh token.');
      error.statusCode = 401;
      throw error;
    }
  }

  // Logout service
  async logoutUser(userId, refreshToken) {
    if (refreshToken) {
      await userRepository.removeRefreshToken(userId, refreshToken);
    }
    return true;
  }
}

module.exports = new AuthService();
