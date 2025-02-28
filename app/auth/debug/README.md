# Authentication Debugging Guide

This guide will help you diagnose and fix authentication issues in your MinuteCaller application.

## How to Use the Debug Page

1. Visit `/auth/debug` in your browser to see detailed information about your authentication state.
2. This page will show:
   - Whether you're currently authenticated
   - Session information (expiry time, etc.)
   - Cookie information

## Common Issues and Solutions

### 1. Session Not Persisting on Refresh

If you're being redirected to the sign-in page when refreshing the dashboard, check:

- **Cookie Presence**: On the debug page, verify that the `sb-*` cookies exist and have values
- **Session Expiry**: Check if your session has expired or is about to expire
- **Browser Settings**: Ensure your browser isn't blocking cookies

### 2. Debugging with Console Logs

We've added extensive logging to help diagnose issues:

1. Open your browser's developer console (F12 or right-click > Inspect > Console)
2. Look for logs with these prefixes:
   - `[Middleware]` - Shows authentication checks in the middleware
   - `[Auth Callback]` - Shows the authentication callback process
   - `[Dashboard]` - Shows dashboard authentication state

### 3. Testing Authentication Flow

To test the complete authentication flow:

1. Sign out completely
2. Clear your browser cookies (or use incognito mode)
3. Sign in again
4. Visit the debug page to verify your session
5. Try refreshing the dashboard page

### 4. Fixing Persistent Issues

If you continue to experience issues:

1. Check for browser console errors
2. Verify that the Supabase URL and anon key are correct in your environment variables
3. Try using a different browser to rule out browser-specific issues
4. Check if your Supabase instance has any service disruptions

## Next Steps

If the issue persists after following these steps, collect the following information:

1. Screenshots of the debug page
2. Console logs showing the authentication process
3. Browser and OS information

This will help us diagnose and fix the issue more effectively.
