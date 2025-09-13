import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const { toast } = useToast();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed!",
        description: "Lilo has been added to your home screen",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your internet connection has been restored",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Some features may be limited while offline",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Install app
  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    
    return false;
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive notifications from Lilo",
      });
      return true;
    } else {
      toast({
        title: "Notifications Denied",
        description: "You can enable notifications in your browser settings",
        variant: "destructive"
      });
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null // Add your VAPID key here if you implement push server
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  // Share API
  const shareContent = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "The link has been copied to your clipboard",
        });
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    subscribeToPushNotifications,
    shareContent
  };
};