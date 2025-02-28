# Authentication and Twilio Debugging Guide

This guide will help you troubleshoot authentication and Twilio issues in your MinuteCaller application.

## Authentication Issues

### Common Authentication Problems

1. **Session Persistence Issues**

   - Symptoms: Being logged out when refreshing the page or navigating between pages
   - Possible causes:
     - Cookies not being properly set or stored
     - Session expiration
     - Cross-domain cookie issues
     - Browser privacy settings blocking cookies

2. **403 Forbidden Errors**

   - Symptoms: "Auth session missing" errors in console, automatic logout
   - Possible causes:
     - Invalid or expired session token
     - Supabase service issues
     - Network connectivity problems

3. **Infinite Redirects**
   - Symptoms: Browser shows "too many redirects" error
   - Possible causes:
     - Authentication logic issues in middleware
     - Cookie handling problems

### Debugging Steps

1. **Visit the Debug Page**

   - Go to `/auth/debug` to see detailed information about your authentication state
   - Check if you have a valid session and user
   - Verify that the necessary cookies are present (especially `sb-*` cookies)

2. **Check Browser Console**

   - Look for authentication-related errors
   - Pay attention to 403 Forbidden errors or "Auth session missing" messages

3. **Test Session Refresh**

   - Use the "Refresh Session" button on the debug page
   - Check if the session is successfully refreshed

4. **Clear Cookies and Try Again**

   - Clear all cookies for the site
   - Sign in again and check if the issue persists

5. **Try Different Browsers**
   - Test in Chrome, Firefox, and Safari
   - Check if the issue is browser-specific

## Twilio Issues

### Common Twilio Problems

1. **Connection Declined (Error 31002)**

   - Symptoms: Call fails with "Connection Declined" error
   - Possible causes:
     - Insufficient Twilio account funds
     - Invalid or expired token
     - Incorrect Twilio application configuration
     - Phone number restrictions

2. **Media Permission Issues**

   - Symptoms: Call fails with microphone-related errors
   - Possible causes:
     - Browser not granted microphone access
     - Hardware issues with microphone

3. **Token Generation Failures**
   - Symptoms: "Failed to generate token" errors
   - Possible causes:
     - Missing or incorrect Twilio credentials
     - API errors

### Debugging Steps

1. **Visit the Twilio Debug Page**

   - Go to `/auth/debug/twilio` to test token generation
   - Check if tokens are being generated correctly

2. **Check Twilio Account**

   - Verify that your Twilio account has sufficient funds
   - Check if your Twilio phone number is capable of making outbound calls
   - Ensure your TwiML application is correctly configured

3. **Verify Environment Variables**

   - Make sure all required Twilio environment variables are set:
     - TWILIO_ACCOUNT_SID
     - TWILIO_AUTH_TOKEN
     - TWILIO_API_KEY
     - TWILIO_API_SECRET
     - TWILIO_APP_SID
     - TWILIO_PHONE_NUMBER

4. **Test with Different Phone Numbers**
   - Try calling different phone numbers to see if the issue is specific to certain numbers

## General Troubleshooting

1. **Check Network Connectivity**

   - Ensure you have a stable internet connection
   - Try using a different network if possible

2. **Clear Browser Cache**

   - Clear cache and cookies
   - Try in incognito/private browsing mode

3. **Update Browser**

   - Make sure you're using the latest version of your browser

4. **Disable Extensions**
   - Temporarily disable browser extensions, especially privacy-focused ones

## If Issues Persist

If you've tried all the steps above and still experience issues:

1. **Collect Detailed Information**

   - Screenshots of the error
   - Browser console logs
   - Network request logs (especially for 403 errors)
   - Browser and OS information

2. **Contact Support**

   - Provide all collected information
   - Describe the steps you've taken to troubleshoot

3. **Check Status Pages**
   - [Supabase Status](https://status.supabase.com/)
   - [Twilio Status](https://status.twilio.com/)
