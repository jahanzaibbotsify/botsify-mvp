# Firebase Real-Time Messaging Setup

## Overview

This application now includes Firebase real-time messaging capabilities that allow for instant message synchronization across all connected clients. Messages are delivered in real-time without requiring page refreshes.

## Features

- **Real-time messaging**: Messages appear instantly across all connected clients
- **Live conversation updates**: New conversations appear automatically
- **Message synchronization**: All clients see the same message state
- **Connection status**: Visual indicators show Firebase connection status
- **Error handling**: Graceful handling of connection issues

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Realtime Database** in your project
4. Set up database rules for security

### 2. Database Rules

Set up your Firebase Realtime Database rules to allow read/write access:

```json
{
  "rules": {
    "botsify_live_chat": {
      "presence-agents-$apikey": {
        ".read": true,
        ".write": true
      },
      "conversations": {
        "$conversationId": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

### 3. Environment Variables

Create a `.env.local` file in your project root with your Firebase configuration:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

**Note**: The bot API key is automatically obtained from the route parameter or API key store - no need to set it in environment variables.

### 4. Application Configuration

The application will automatically initialize Firebase when:
1. Firebase environment variables are properly configured
2. A bot API key is provided (either via route parameter or API key store)
3. The conversation view is loaded

No manual configuration is required - Firebase will connect automatically when all required environment variables are set.

## How It Works

### Message Flow

1. **User sends message**: Message is sent via API and Firebase
2. **Firebase sync**: Message is stored in Firebase Realtime Database
3. **Real-time delivery**: All connected clients receive the message instantly
4. **UI update**: Message appears in the chat interface immediately

### Database Structure

```
botsify_live_chat/
├── presence-agents-{botApiKey}/
│   ├── {messageId}/
│   │   ├── user: { fbId, name, email, profile_pic }
│   │   ├── message: { text, human_help, stop_bot }
│   │   └── timestamp: 1234567890
│   └── ...
└── conversations/
    ├── {fbId}/
    │   ├── messages/
    │   │   ├── {messageId}/
    │   │   │   ├── text: "Hello"
    │   │   │   ├── direction: "from" | "to"
    │   │   │   └── timestamp: 1234567890
    │   │   └── ...
    │   ├── status: "open" | "closed"
    │   └── unread: 0 | 1
    └── ...
```

### Connection Status

The application shows real-time connection status:

- **🟢 Connected**: Firebase is connected and real-time messaging is active
- **🔴 Disconnected**: Firebase is not connected
- **⚠️ Connection Error**: There's an issue with the Firebase connection

## Troubleshooting

### Common Issues

1. **"Firebase not connected" error**
   - Check your Firebase API key and database URL
   - Ensure Firebase Realtime Database is enabled
   - Verify database rules allow read/write access

2. **Messages not appearing in real-time**
   - Check the connection status indicator
   - Verify your bot API key is correct
   - Check browser console for Firebase errors

3. **Permission denied errors**
   - Update your Firebase database rules
   - Ensure the database path matches your bot API key

### Debug Mode

Enable debug logging by opening browser console and looking for:
- `🔥 Firebase initialized successfully`
- `📨 Firebase message received`
- `💬 Real-time message added`

## Security Considerations

1. **API Key Protection**: Never expose your Firebase API keys in client-side code for production
2. **Database Rules**: Implement proper security rules in Firebase
3. **Authentication**: Consider implementing user authentication for production use
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Production Deployment

For production deployment:

1. **Backend Proxy**: Implement a backend proxy to handle Firebase operations
2. **Environment Variables**: Use server-side environment variables
3. **SSL**: Ensure all connections use HTTPS
4. **Monitoring**: Set up Firebase monitoring and alerts

## API Reference

### Firebase Service Methods

```typescript
// Initialize Firebase connection
firebaseService.initializeLiveChatListener(callback, errorCallback)

// Send a message
firebaseService.sendMessage(fbId, message, type)

// Listen to specific conversation
firebaseService.listenToConversation(fbId, callback, errorCallback)

// Update conversation status
firebaseService.updateConversationStatus(fbId, status)

// Mark conversation as read/unread
firebaseService.markConversationRead(fbId, read)

// Disconnect from Firebase
firebaseService.disconnect()
```

### Store Methods

```typescript
// Initialize Firebase in the store
conversationStore.initializeFirebase(apiKey)

// Check connection status
conversationStore.isFirebaseConnected

// Get error message
conversationStore.firebaseError

// Disconnect Firebase
conversationStore.disconnectFirebase()
```

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Test with a simple Firebase project first
4. Check the Firebase documentation for updates 