import User from '../models/user.model.js';
import { hashPassword, comparePassword } from '../config/lib/bcrypt.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../config/lib/jwt.js';
import envs from '../config/envs.js';

export const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'user',
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = await generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = await generateRefreshToken({ id: user._id, role: user.role });
    user.lastLogin = new Date();
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: envs.node_env === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 60 minutes
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing. Please login again.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please login again.',
      });
    }

    const newAccessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token. Please login again.',
    });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: envs.node_env === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    const user = await User.findById(userId).select('+password');
    const isValid = await user.isPasswordCorrect(currentPassword);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = await hashPassword(newPassword);
    await user.clearTokens();

    res.json({
      success: true,
      message: 'Password changed. Please login again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to change password: ${error.message}`,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`,
    });
  }
};
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already registered' });
//     }

//     const user = await User.create({ name, email, password });
//     const token = generateToken(user._id);
//     setAuthCookie(res, token);

//     return res.status(201).json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const token = generateToken(user._id);
//     setAuthCookie(res, token);

//     return res.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/auth/logout
// router.post('/logout', (req, res) => {
//   clearAuthCookie(res);
//   return res.json({ message: 'Logged out' });
// });

// // GET /api/auth/me (get current user)
// router.get('/me', async (req, res) => {
//   try {
//     const cookieHeader = req.headers.cookie || '';
//     const cookieMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
//     const header = req.headers.authorization;
//     const token =
//       cookieMatch?.[1] || (header && header.startsWith('Bearer ') ? header.split(' ')[1] : null);

//     if (!token) {
//       return res.status(401).json({ error: 'Not authenticated' });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }
//     return res.json({
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// });

// export default router;
