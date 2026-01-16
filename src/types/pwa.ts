/**
 * PWA-related type definitions
 */

/**
 * BeforeInstallPromptEvent is a non-standard interface that represents
 * the event fired when a Progressive Web App is installable
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Augment the Window interface to include the beforeinstallprompt event
 */
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
