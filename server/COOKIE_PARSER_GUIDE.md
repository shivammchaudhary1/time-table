# 🍪 COOKIE-PARSER COMPREHENSIVE GUIDE

## Table of Contents

1. [What is Cookie-Parser?](#what-is-cookie-parser)
2. [Why Do We Need It?](#why-do-we-need-it)
3. [How It Works](#how-it-works)
4. [Setup & Installation](#setup--installation)
5. [Usage in Our Project](#usage-in-our-project)
6. [Behind the Scenes](#behind-the-scenes)
7. [Security Considerations](#security-considerations)
8. [Examples](#examples)

---

## What is Cookie-Parser?

**Cookie-Parser** is Express middleware that parses HTTP cookies from incoming requests and makes them easily accessible via `req.cookies` object.

### Without Cookie-Parser:

```javascript
// Raw cookie header string
req.headers.cookie = 'refreshToken=abc123xyz; userId=456; theme=dark';

// You'd need to manually parse this string 😞
const parseCookie = (header) => {
  const pairs = header.split(';');
  // Complex parsing logic...
};
```

### With Cookie-Parser:

```javascript
// Automatically parsed into JavaScript object
req.cookies = {
  refreshToken: 'abc123xyz',
  userId: '456',
  theme: 'dark',
};
```

---

## Why Do We Need It?

### 1. **Authentication Token Storage** 🔐

- Store JWT refresh tokens securely in HTTP-only cookies
- Protect from XSS attacks (JavaScript cannot access HTTP-only cookies)
- Browser automatically sends cookies with every request

### 2. **Session Management** 👤

- Maintain user sessions across requests
- Track user preferences, shopping cart, etc.

### 3. **Easy Data Access** 🎯

- Access cookies as simple JavaScript object properties
- `req.cookies.refreshToken` instead of parsing raw header

### 4. **Secure HTTP-Only Cookies** 🛡️

- Set cookies that JavaScript cannot read or modify
- Only HTTP requests can access (prevents XSS theft)
- Browser controls lifecycle (expiry, domain, path)

---

## How It Works

### High-Level Flow:

```
┌──────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                             │
├──────────────────────────────────────────────────────────────┤
│  1. User logs in                                             │
│  2. Receives response with Set-Cookie header                │
│  3. Browser automatically stores cookie                      │
│  4. On next request, browser adds Cookie header             │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ HTTP REQUEST with Cookie Header                             │
├──────────────────────────────────────────────────────────────┤
│ Cookie: refreshToken=abc123xyz; userId=456; theme=dark     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ EXPRESS SERVER                                               │
├──────────────────────────────────────────────────────────────┤
│ 1. Raw request arrives with Cookie header                   │
│ 2. cookie-parser middleware processes it                    │
│ 3. Parses into JavaScript object                            │
│ 4. Attaches to req.cookies                                  │
│ 5. Route handler receives parsed cookies                    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ ROUTE HANDLER (Route Logic)                                  │
├──────────────────────────────────────────────────────────────┤
│ const refreshToken = req.cookies.refreshToken              │
│ // Can now use token for refresh or verification           │
└──────────────────────────────────────────────────────────────┘
```

---

## Setup & Installation

### 1. Install Package

```bash
npm install cookie-parser
```

### 2. Import in server.js

```javascript
import cookieParser from 'cookie-parser';
```

### 3. Use Middleware

```javascript
// Apply BEFORE routes
app.use(cookieParser());

// Order matters! Place after body parsers but before routes
app.use(express.json());
app.use(cookieParser()); // ← HERE
app.use(appRoutes);
```

### 4. Optional: Secret for Signed Cookies

```javascript
// For signed cookies (verify they weren't tampered with)
app.use(cookieParser('your-secret-key-here'));
```

---

## Usage in Our Project

### Location in Code:

```
server/
├── server.js (setup - line 12)
├── controllers/
│   └── auth.controller.js (usage in login/refresh)
└── middleware/
    └── auth.middleware.js (usage in token extraction)
```

### 1. **Setting Cookies (Login)**

**File:** `controllers/auth.controller.js`

```javascript
// After verifying credentials and generating tokens
res.cookie('refreshToken', refreshToken, {
  httpOnly: true, // JavaScript cannot access
  secure: true, // HTTPS only (production)
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  path: '/', // Available across app
});

res.json({
  success: true,
  message: 'Login successful',
  user: userData,
  accessToken: accessToken, // Send access token in body
});
```

**What Happens:**

1. Server sends response with `Set-Cookie: refreshToken=...`
2. Browser receives response
3. Browser stores cookie automatically
4. Cookie expires in 7 days or when browser closes

### 2. **Reading Cookies (Refresh Token)**

**File:** `controllers/auth.controller.js`

```javascript
export const refreshAccessToken = async (req, res) => {
  // cookie-parser parsed it into req.cookies
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token missing. Please login again.',
    });
  }

  // Verify and use token...
};
```

**What Happens:**

1. Browser sends request with `Cookie: refreshToken=...` header
2. cookie-parser intercepts the request
3. Parses `Cookie` header into JavaScript object
4. Attaches to `req.cookies`
5. Our code accesses via `req.cookies.refreshToken`

### 3. **Token Extraction (Middleware)**

**File:** `middleware/auth.middleware.js`

```javascript
const getTokenFromRequest = (req) => {
  // Try Authorization header first (access token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // Fallback to cookie (refresh token)
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  return null;
};

const auth = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  // Token extracted, now verify and attach user
  const decoded = verifyAccessToken(token);
  req.user = await User.findById(decoded.id);

  next();
};
```

---

## Behind the Scenes

### Request Flow with Detailed Breakdown:

```
STEP 1: USER LOGS IN
─────────────────────
User enters email & password
Client sends: POST /api/auth/login { email, password }


STEP 2: SERVER VALIDATES & GENERATES TOKENS
─────────────────────────────────────────────
controller/auth.controller.js:
  ✓ Hash password match
  ✓ Generate accessToken (15 min expiry)
  ✓ Generate refreshToken (7 day expiry)


STEP 3: SERVER SENDS RESPONSE WITH COOKIES
───────────────────────────────────────────
Server sends HTTP response:

  HTTP/1.1 200 OK
  Set-Cookie: refreshToken=abc123xyz;
              HttpOnly;
              Secure;
              SameSite=Strict;
              Max-Age=604800;  // 7 days
              Path=/

  {
    "success": true,
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }


STEP 4: BROWSER PROCESSES RESPONSE
──────────────────────────────────
1. Browser reads Set-Cookie header
2. Stores cookie in local cookie storage
3. Cookie is marked as HttpOnly
   → JavaScript cannot access: ❌ document.cookie won't show it
   → Only HTTP requests can access: ✓ Automatic on next request


STEP 5: CLIENT MAKES AUTHENTICATED REQUEST
────────────────────────────────────────────
Browser sends:

  GET /api/courses
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Cookie: refreshToken=abc123xyz


STEP 6: MIDDLEWARE PROCESSES REQUEST
────────────────────────────────────
1. morgan middleware logs request
2. cookieParser() middleware intercepts
3. Parses Cookie header:
   - Input:  "refreshToken=abc123xyz"
   - Output: req.cookies.refreshToken = "abc123xyz"
4. Passes to auth middleware


STEP 7: AUTH MIDDLEWARE EXTRACTS TOKEN
──────────────────────────────────────
getTokenFromRequest(req):
  1. Check Authorization header
     → Found! "Bearer eyJhbGciOiJIUzI1NiIs..."
     → Extract token
  2. Return token to auth()


STEP 8: AUTH MIDDLEWARE VERIFIES TOKEN
──────────────────────────────────────
auth():
  1. Verify token signature & expiry
  2. Find user in database
  3. Check user is active
  4. Attach user to req.user
  5. Call next() → route handler


STEP 9: ROUTE HANDLER EXECUTES
──────────────────────────────
app.get('/api/courses', auth, handler):
  handler(req, res) {
    // req.user is available!
    const userId = req.user._id;
    const userRole = req.user.role;
    // Get courses for this user...
  }
```

### Cookie Lifecycle:

```
Timeline:
─────────

[User logs in]
    ↓
[Server creates cookie] → Max-Age: 7 days
    ↓
[Browser stores cookie]
    ↓
[User browses for 3 days]
    ↓
[Cookie sent with every request automatically] ✓
    ↓
[4th day - AccessToken expires]
    ↓
[Frontend calls /refresh endpoint]
    ↓
[Server reads refreshToken from req.cookies]
    ↓
[Server generates new accessToken]
    ↓
[User continues working]
    ↓
[7th day - Cookie expires automatically]
    ↓
[Cookie sent with request but server rejects]
    ↓
[User must login again]
```

---

## Security Considerations

### 1. **HTTP-Only Flag** 🔒

```javascript
res.cookie('refreshToken', token, {
  httpOnly: true, // JavaScript CANNOT access
});
```

**Why?**

- Protects against XSS attacks
- Malicious scripts cannot steal token via `document.cookie`
- Browser controls access

**Verify:**

```javascript
// This WON'T work:
console.log(document.cookie); // Won't show refreshToken

// But browser sends it automatically:
fetch('/api/refresh'); // Cookie automatically included
```

### 2. **Secure Flag** 🔐

```javascript
res.cookie('refreshToken', token, {
  secure: true, // HTTPS only (production)
});
```

**Why?**

- Cookie only sent over HTTPS
- Man-in-the-middle attacks prevented
- In development, set to false for testing

### 3. **SameSite Flag** 🎯

```javascript
res.cookie('refreshToken', token, {
  sameSite: 'strict', // No cross-site requests
});
```

**Options:**

- `'strict'`: Never send to cross-site requests
- `'lax'`: Send on top-level navigation (safer default)
- `'none'`: Send to all cross-site requests (risky)

**Why?**

- Prevents CSRF (Cross-Site Request Forgery)
- Malicious sites cannot make requests to your API with your cookies

### 4. **Max-Age / Expires** ⏱️

```javascript
res.cookie('refreshToken', token, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});
```

**Why?**

- Automatic expiry - cookie deleted after time passes
- Prevents indefinite access with stolen token
- Matches JWT expiry (both 7 days for refresh token)

### 5. **Path Restriction** 📍

```javascript
res.cookie('refreshToken', token, {
  path: '/', // Available across entire app
});
```

**Options:**

- `'/'`: Available on all routes
- `'/api'`: Only sent for `/api/*` routes

---

## Examples

### Example 1: Complete Login Flow

```javascript
// FRONTEND
async function login(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send cookies!
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // accessToken in response, refreshToken in cookie
  localStorage.setItem('accessToken', data.accessToken);
  // refreshToken automatically stored by browser ✓

  return data.user;
}

// BACKEND - server.js
app.use(cookieParser()); // Parse cookies automatically

// BACKEND - auth.controller.js
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  const isValid = await user.isPasswordCorrect(password);

  if (!isValid) return res.status(401).json({ success: false });

  const { accessToken, refreshToken } = await user.generateTokens();

  // Set refreshToken in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user: user.toJSON(),
    accessToken, // Return access token in body
  });
};
```

### Example 2: Refresh Token Flow

```javascript
// FRONTEND
async function makeAuthenticatedRequest(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    credentials: 'include', // Send refreshToken cookie
  });

  // If 401 (token expired), try refresh
  if (res.status === 401) {
    const refreshRes = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Send refreshToken cookie
    });

    if (!refreshRes.ok) throw new Error('Login required');

    const { accessToken } = await refreshRes.json();
    localStorage.setItem('accessToken', accessToken);

    // Retry original request
    return makeAuthenticatedRequest(url, options);
  }

  return res;
}

// BACKEND - auth.controller.js
export const refreshAccessToken = async (req, res) => {
  // Cookie-Parser parsed the refreshToken for us!
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    const newAccessToken = generateAccessToken({ id: user._id });

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ success: false });
  }
};
```

### Example 3: Logout

```javascript
// BACKEND - auth.controller.js
export const logout = async (req, res) => {
  const userId = req.user._id;

  // Clear tokens from database
  await User.findByIdAndUpdate(userId, {
    accessToken: null,
    refreshToken: null,
  });

  // Clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res.json({ success: true, message: 'Logged out' });
};

// FRONTEND
async function logout() {
  await fetch('http://localhost:5000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  localStorage.removeItem('accessToken');
  // refreshToken cookie automatically cleared by server ✓

  // Redirect to login
  window.location.href = '/login';
}
```

---

## Debugging Tips

### Check if Cookies are Received:

```javascript
app.use(cookieParser());

app.get('/debug', (req, res) => {
  res.json({
    cookies: req.cookies,
    signedCookies: req.signedCookies,
    headers: req.headers,
  });
});
```

### Browser DevTools:

1. **Application → Cookies**
   - See all stored cookies
   - Check HttpOnly, Secure, SameSite flags
   - View expiry date

2. **Network → Headers**
   - **Request**: See `Cookie` header sent to server
   - **Response**: See `Set-Cookie` header from server

3. **Console**

   ```javascript
   // This shows all accessible cookies
   console.log(document.cookie);

   // HttpOnly cookies won't appear!
   // But check Network tab to confirm they're being sent
   ```

---

## Common Mistakes & Solutions

| Mistake                    | Issue                           | Solution                                     |
| -------------------------- | ------------------------------- | -------------------------------------------- |
| `req.cookies is undefined` | Forgot to use middleware        | Add `app.use(cookieParser())` BEFORE routes  |
| Cookie not sent to server  | Forgot `credentials: 'include'` | Add to fetch/axios: `credentials: 'include'` |
| Cookie not stored          | No `Set-Cookie` header          | Check `res.cookie()` is called               |
| `document.cookie` empty    | HttpOnly flag set               | This is CORRECT! Use for XSS protection      |
| Cookie lost on refresh     | Short maxAge                    | Increase `maxAge` or use persistent storage  |
| CORS cookie error          | Credentials not configured      | Set CORS: `credentials: true`                |

---

## Summary

| Aspect             | Details                                           |
| ------------------ | ------------------------------------------------- |
| **Purpose**        | Parse HTTP cookies into JavaScript objects        |
| **Installation**   | `npm install cookie-parser`                       |
| **Setup**          | `app.use(cookieParser())`                         |
| **Usage**          | `req.cookies.refreshToken`                        |
| **Sets Cookies**   | `res.cookie('name', value, options)`              |
| **Clears Cookies** | `res.clearCookie('name', options)`                |
| **Security**       | httpOnly, secure, sameSite flags                  |
| **Token Storage**  | Refresh in cookies, access in localStorage/memory |
| **Expiry**         | maxAge/expires for automatic deletion             |

---

## Further Learning

- [Express Cookie Documentation](https://expressjs.com/en/resources/middleware/cookie-parser.html)
- [MDN: HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Cookie Security](https://owasp.org/www-community/attacks/csrf)
- [RFC 6265: HTTP State Management Mechanism](https://tools.ietf.org/html/rfc6265)
