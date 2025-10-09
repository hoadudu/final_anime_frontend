# 🔄 Migration Guide - Auth System Rebuild

## Changes Summary

The authentication system has been **completely rebuilt** from scratch to resolve the numerous errors and complexity issues in the old system.

### Files Changed

#### ✅ Completely Rewritten

- `src/utils/auth.js` - Now contains complete token storage implementation (was almost empty)
- `src/stores/auth.js` - Simplified auth store with cleaner logic
- `src/boot/axios.js` - Clean interceptors with proper request queuing
- `src/router/guards/auth.js` - Simplified auth guard

#### ❌ Deleted (No Longer Needed)

- `src/utils/session-monitor.js` - Functionality merged into axios interceptors
- `src/utils/auth-initialization.js` - Functionality merged into boot/axios.js

#### 📄 New Documentation

- `AUTH_SYSTEM.md` - Complete documentation of the new auth system

### What Improved

1. **Simpler Architecture**
   - Removed complex session monitor
   - Removed complex auth initialization service
   - Cleaner separation of concerns

2. **Better Error Handling**
   - No more circular dependencies
   - Proper concurrent request handling during token refresh
   - Clear error messages in development mode

3. **More Reliable**
   - No race conditions during token refresh
   - Proper request queuing
   - Consistent state management

4. **Better Developer Experience**
   - Comprehensive debug logging in development
   - Clear documentation
   - Easy to understand code

### Breaking Changes

⚠️ **Users will need to login again** - The new system is incompatible with old stored tokens.

However, all functionality remains the same:

- Same API endpoints
- Same storage strategy
- Same features (login, register, logout, device management, etc.)

### Code Changes Required

#### Before (Old System)

```javascript
// Using session monitor
import { sessionMonitor } from 'src/utils/session-monitor'
sessionMonitor.init(authStore)
sessionMonitor.start()

// Using auth initialization
import { authInitialization } from 'src/utils/auth-initialization'
await authInitialization.initialize()
```

#### After (New System)

```javascript
// Everything is automatic!
// Auth is initialized in boot/axios.js
// No manual setup needed

// Just use the auth store
import { useAuthStore } from 'src/stores/auth'
const authStore = useAuthStore()

// Check auth state
if (authStore.isAuthenticated) {
  // User is logged in
}
```

### Component Changes

Most components should work without changes. However, if you were using:

#### authInitialization

**Before:**

```javascript
import { authInitialization } from 'src/utils/auth-initialization'
const result = await authInitialization.initialize()
```

**After:**

```javascript
// Not needed anymore!
// Auth is auto-initialized in boot/axios.js

// Just check auth store state
import { useAuthStore } from 'src/stores/auth'
const authStore = useAuthStore()

if (authStore.isAuthenticated) {
  // User is logged in
}
```

#### sessionMonitor

**Before:**

```javascript
import { sessionMonitor } from 'src/utils/session-monitor'
sessionMonitor.start()
```

**After:**

```javascript
// Not needed anymore!
// Token refresh is automatic via axios interceptors
```

#### authStateEvents

**Before:**

```javascript
import { authStateEvents } from 'src/stores/auth'
authStateEvents.addEventListener('auth-state-changed', handler)
```

**After:**

```javascript
// Use Pinia reactivity instead
import { useAuthStore } from 'src/stores/auth'
import { watch } from 'vue'

const authStore = useAuthStore()

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    // Handle auth state change
  },
)
```

## Quick Start

### 1. Clear Old Data (Recommended)

To ensure a clean start, clear browser storage:

```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
```

Or just tell users to login again (old tokens will be automatically cleaned up).

### 2. Test the New System

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Test login flow:
   - Go to login page
   - Enter credentials
   - Verify login works

3. Test token refresh:
   - Login
   - Wait for token to expire (or manually clear sessionStorage)
   - Make an API request
   - Verify token is automatically refreshed

4. Test protected routes:
   - Navigate to `/profile` (protected route)
   - Verify redirect if not logged in
   - Verify access if logged in

### 3. Remove Old Code References

Search your codebase for:

- `sessionMonitor` - Remove these imports and calls
- `authInitialization` - Remove these imports and calls
- `authStateEvents` - Replace with Pinia watch

### 4. Update Your Components

If you have custom auth components, update them to use the simplified API:

```javascript
// Login component
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

async function login() {
  await authStore.login({ email, password })
  // That's it! Tokens are stored automatically
}

// Check auth in any component
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user)
}

// Logout
async function logout() {
  await authStore.logout()
  // That's it! Everything is cleaned up
}
```

## Testing Checklist

After migration, test these scenarios:

### Basic Auth

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password flow

### Token Management

- [ ] Token persists after page refresh
- [ ] Token auto-refreshes on expiration
- [ ] Multiple API calls during token refresh don't cause duplicate refreshes
- [ ] Failed token refresh logs user out

### Route Protection

- [ ] Protected routes redirect when not authenticated
- [ ] Protected routes accessible when authenticated
- [ ] Return URL works after login

### Edge Cases

- [ ] Open app in new tab (should require re-auth with access token, but use refresh token)
- [ ] Close tab and reopen (should maintain login via refresh token)
- [ ] Logout in one tab affects other tabs (may need to refresh other tabs)
- [ ] Concurrent API requests during token refresh
- [ ] Network errors during refresh

## Troubleshooting

### Issue: Build Errors

If you get import errors:

```
Cannot find module 'src/utils/session-monitor'
Cannot find module 'src/utils/auth-initialization'
```

**Solution:** Search your codebase for these imports and remove them.

```bash
# Search for old imports
grep -r "session-monitor" src/
grep -r "auth-initialization" src/
```

### Issue: Users Can't Login

**Solution:** Clear browser storage and try again:

```javascript
localStorage.clear()
sessionStorage.clear()
```

### Issue: Token Not Refreshing

**Solution:** Check:

1. Refresh token exists: `localStorage.getItem('refresh_token')`
2. API endpoint is working: Test `/auth/refresh-token` manually
3. Browser console for error messages
4. Debug with: `tokenStorage.getAuthState()`

### Issue: Development Logs Not Showing

**Solution:** Verify `NODE_ENV=development` is set:

```javascript
console.log('NODE_ENV:', process.env.NODE_ENV)
```

## Rollback (If Needed)

If you need to rollback to the old system:

```bash
# Restore old files from git
git checkout HEAD~1 -- src/utils/auth.js
git checkout HEAD~1 -- src/utils/session-monitor.js
git checkout HEAD~1 -- src/utils/auth-initialization.js
git checkout HEAD~1 -- src/stores/auth.js
git checkout HEAD~1 -- src/boot/axios.js
git checkout HEAD~1 -- src/router/guards/auth.js

# Remove new documentation
rm AUTH_SYSTEM.md MIGRATION_GUIDE.md
```

## Benefits of New System

✅ **Simpler** - Less code, easier to understand  
✅ **More Reliable** - No race conditions, proper error handling  
✅ **Better DX** - Clear documentation, debug logging  
✅ **Maintainable** - Clean separation of concerns  
✅ **Secure** - Proper token storage strategy

## Questions?

1. Read `AUTH_SYSTEM.md` for complete documentation
2. Check browser console for debug messages
3. Use `tokenStorage.getAuthState()` to inspect current state
4. Test with development mode logging enabled

---

**Migration completed by:** AI Assistant  
**Date:** October 9, 2025  
**Reason:** Rebuilt auth system to fix numerous errors and reduce complexity
