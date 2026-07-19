const authService = require('../services/authService');

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const data = await authService.registerUser({ name, email, password, role });
      
      setRefreshTokenCookie(res, data.refreshToken);

      res.status(210).json({
        success: true,
        message: 'Registration successful',
        accessToken: data.accessToken,
        user: data.user
      });
    } catch (error) {
      next(error);
    }
  }

  // User login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.loginUser({ email, password });

      setRefreshTokenCookie(res, data.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken: data.accessToken,
        user: data.user
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req, res, next) {
    try {
      // Extract from cookies (requires cookie-parser or parsed headers)
      // Since cookie-parser might not be added, we can parse it manually or add cookie-parser.
      // Wait, let's parse it manually from req.headers.cookie for robustness, or add cookie-parser.
      // Let's add manual parser just in case, or retrieve it from body/headers.
      let token = null;
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const rtCookie = cookies.find(c => c.trim().startsWith('refreshToken='));
        if (rtCookie) {
          token = rtCookie.split('=')[1];
        }
      }
      
      // Fallback to body or header if cookie is missing
      if (!token && req.body.refreshToken) {
        token = req.body.refreshToken;
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is missing'
        });
      }

      const data = await authService.refreshAccessToken(token);
      setRefreshTokenCookie(res, data.refreshToken);

      res.status(200).json({
        success: true,
        accessToken: data.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  // User logout
  async logout(req, res, next) {
    try {
      let token = null;
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const rtCookie = cookies.find(c => c.trim().startsWith('refreshToken='));
        if (rtCookie) {
          token = rtCookie.split('=')[1];
        }
      }

      if (!token && req.body.refreshToken) {
        token = req.body.refreshToken;
      }

      // If user is authenticated, we have req.user from authMiddleware
      const userId = req.user ? req.user.userId : null;

      if (userId && token) {
        await authService.logoutUser(userId, token);
      }

      // Clear the cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
