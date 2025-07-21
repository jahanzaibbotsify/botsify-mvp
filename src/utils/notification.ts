// Notification Service for handling push notifications
let _registration: ServiceWorkerRegistration | null = null;

import { VAPID_PUBLIC_KEY } from './config'

export class NotificationService {
  // Register service worker
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (navigator.serviceWorker === undefined) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker successfully registered:', registration);
      _registration = registration;
      return registration;
    } catch (err) {
      console.error('Unable to register service worker:', err);
      return null;
    }
  }

  // Get service worker registration
  static async getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (_registration != null) {
      return _registration;
    }
    
    // Try to get existing registration
    if (navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          _registration = registration;
          return registration;
        }
      } catch (error) {
        console.warn('Error getting existing service worker registration:', error);
      }
    }
    
    return null;
  }

  // Ask for notification permission
  static async askPermission(): Promise<NotificationPermission> {
    return new Promise((resolve, reject) => {
      const permissionResult = Notification.requestPermission((result) => {
        resolve(result);
      });
      
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    });
  }

  // Convert base64 string to Uint8Array for VAPID key
  static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Subscribe user to push notifications
  static async subscribeUserToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await this.getSWRegistration();
      if (!registration) {
        console.warn('No service worker registration available for push subscription');
        return null;
      }
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      };
      
      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('Received PushSubscription:', JSON.stringify(subscription));
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  // Unsubscribe user from push notifications
  static async unsubscribeUserFromPush(): Promise<boolean> {
    try {
      const registration = await this.getSWRegistration();
      if (!registration) {
        console.warn('No service worker registration available for push unsubscription');
        return false;
      }
      
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('User unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }

  // Check if notifications are supported
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Check current permission status
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Check if user is subscribed
  static async isSubscribed(): Promise<boolean> {
    try {
      const registration = await this.getSWRegistration();
      if (!registration) {
        console.warn('No service worker registration available for subscription check');
        return false;
      }
      
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
} 