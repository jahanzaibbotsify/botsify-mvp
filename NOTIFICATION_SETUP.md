# Push Notification Setup Guide

## Overview

This application supports push notifications for real-time chat updates. The implementation uses the Web Push API with service workers to deliver notifications to users.

## Features

- ✅ Service Worker registration
- ✅ Push notification subscription management
- ✅ Permission handling
- ✅ Real-time notification delivery
- ✅ Notification click handling
- ✅ Subscription persistence to backend

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 2. VAPID Key Generation

You need to generate VAPID keys for push notifications. You can use the `web-push` library:

```bash
npm install web-push -g
web-push generate-vapid-keys
```

This will generate:
- **Public Key**: Use this as `VITE_VAPID_PUBLIC_KEY`
- **Private Key**: Use this on your backend server

### 3. Backend API Endpoints

Your backend needs to implement these endpoints:

#### Save Subscription
```
POST /v1/save-subscription
{
  "apikey": "your_api_key",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

#### Delete Subscription
```
POST /v1/delete-subscription
{
  "apikey": "your_api_key",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### 4. Service Worker

The service worker is located at `public/service-worker.js` and handles:
- Push event reception
- Notification display
- Click handling
- Installation and activation

### 5. Usage

#### Enable Notifications
```typescript
import { useConversationStore } from '@/stores/conversationStore'

const conversationStore = useConversationStore()
const result = await conversationStore.enableNotifications()

if (result.success) {
  console.log('Notifications enabled')
} else {
  console.error('Failed to enable notifications:', result.message)
}
```

#### Disable Notifications
```typescript
const result = await conversationStore.disableNotifications()

if (result.success) {
  console.log('Notifications disabled')
} else {
  console.error('Failed to disable notifications:', result.message)
}
```

#### Check Status
```typescript
const status = await conversationStore.checkNotificationStatus()
console.log('Supported:', status.supported)
console.log('Permission:', status.permission)
console.log('Subscribed:', status.subscribed)
```

## Browser Support

- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 17+

## Security Considerations

1. **HTTPS Required**: Push notifications only work over HTTPS
2. **VAPID Keys**: Keep your private VAPID key secure on the server
3. **Permission Handling**: Always respect user permission choices
4. **Subscription Management**: Properly clean up subscriptions when users disable notifications

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Ensure the service worker file is in the `public` directory
   - Check browser console for registration errors
   - Verify HTTPS is enabled

2. **Permission Denied**
   - Users must manually grant permission
   - Check if notifications are blocked in browser settings
   - Ensure the site is trusted

3. **Subscription Failed**
   - Verify VAPID public key is correct
   - Check if the key is properly formatted
   - Ensure backend endpoints are working

4. **Notifications Not Showing**
   - Check if the service worker is active
   - Verify push event is being received
   - Check browser notification settings

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations)
})

// Check notification permission
console.log('Permission:', Notification.permission)

// Check push manager
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Subscription:', subscription)
  })
})
```

## Implementation Details

### Files Modified

1. **`public/service-worker.js`** - Service worker for handling push events
2. **`src/utils/notificationService.ts`** - Notification utility functions
3. **`src/services/conversationApi.ts`** - API methods for subscription management
4. **`src/stores/conversationStore.ts`** - Store methods for notification handling
5. **`src/components/conversation/UserSidebar.vue`** - UI for notification toggle

### Key Components

- **NotificationService**: Handles service worker registration and push subscription
- **ConversationStore**: Manages notification state and API calls
- **UserSidebar**: Provides UI for enabling/disabling notifications
- **Service Worker**: Handles push events and displays notifications

## Testing

1. **Local Testing**: Use `localhost` with HTTPS (Vite dev server supports this)
2. **Production Testing**: Deploy to HTTPS server
3. **Browser Testing**: Test in multiple browsers
4. **Permission Testing**: Test permission grant/deny flows

## Future Enhancements

- [ ] Notification sound support
- [ ] Custom notification actions
- [ ] Notification grouping
- [ ] Rich notification content
- [ ] Notification analytics
- [ ] Cross-browser compatibility improvements 