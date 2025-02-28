# Twilio Connection Troubleshooting Guide

This guide will help you resolve common Twilio connection issues, particularly the "Connection Declined" error (code 31002) that you may encounter when making calls.

## Understanding the 31002 Error

Error code 31002 ("Connection Declined") typically indicates that Twilio is rejecting the connection request. This can happen for several reasons:

1. **Insufficient Twilio account balance**: Your Twilio account may not have enough funds to place calls.
2. **Account restrictions**: Your Twilio account may have restrictions on making calls to certain regions.
3. **Incorrect configuration**: The TwiML application or phone number may not be properly configured.
4. **Geographic restrictions**: Calls to certain countries may be restricted by Twilio.
5. **Voice capability**: Your Twilio phone number may not have voice capability enabled.

## Troubleshooting Steps

### 1. Check Your Twilio Account

1. Log in to your [Twilio Console](https://www.twilio.com/console)
2. Verify your account balance is sufficient
3. Check if your account is in trial mode, which has limitations
4. Ensure your account is not suspended or restricted

### 2. Verify Environment Variables

Make sure all required Twilio environment variables are correctly set in your `.env.local` file:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_APP_SID=your_twiml_app_sid
NEXT_PUBLIC_TWILIO_CALLER_ID=your_twilio_phone_number
```

You can use the Twilio Debug Page at `/auth/debug/twilio` to check if these variables are properly set.

### 3. Check TwiML Application Configuration

1. Go to the [Twilio Console](https://www.twilio.com/console)
2. Navigate to "Voice & Video" > "TwiML Apps"
3. Select your TwiML application
4. Ensure the Voice Request URL is correctly set to your application's endpoint:
   - For production: `https://yourdomain.com/api/twilio/twiml`
   - For development: Use a service like ngrok to expose your local server

### 4. Verify Phone Number Configuration

1. Go to the [Twilio Console](https://www.twilio.com/console)
2. Navigate to "Phone Numbers" > "Manage" > "Active Numbers"
3. Select your Twilio phone number
4. Ensure it has Voice capability enabled
5. Check that the Voice Configuration is correctly set to use your TwiML application

### 5. Test with the Debug Page

Use the Twilio Debug Page at `/auth/debug/twilio` to:

1. Verify your authentication status
2. Check if your microphone permissions are granted
3. Test token generation
4. Test the Twilio connection directly

### 6. Check Browser Console for Errors

Open your browser's developer console (F12 or Ctrl+Shift+I) to check for any JavaScript errors or additional information about the Twilio connection issue.

### 7. Common Solutions

- **Upgrade from trial account**: If you're using a Twilio trial account, consider upgrading to remove limitations.
- **Add funds to your account**: Ensure your Twilio account has sufficient balance.
- **Update TwiML application**: Make sure your TwiML application is correctly configured.
- **Check geographic restrictions**: Verify that calls to your target country are allowed.
- **Verify phone number capabilities**: Ensure your Twilio phone number can make outbound calls.

## Still Having Issues?

If you've followed all the steps above and are still experiencing issues, please:

1. Take screenshots of the Twilio Debug Page
2. Copy any error messages from the browser console
3. Note the specific steps you took before encountering the error
4. Contact support with this information for further assistance

## Additional Resources

- [Twilio Voice JavaScript SDK Documentation](https://www.twilio.com/docs/voice/client/javascript)
- [Twilio Voice Troubleshooting Guide](https://www.twilio.com/docs/voice/troubleshooting)
- [Twilio Error Code Reference](https://www.twilio.com/docs/api/errors)
