import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Install Lilo</CardTitle>
              <CardDescription className="text-sm">
                Get the full app experience
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>Fast & secure</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Install Now
          </Button>
          <Button
            variant="outline"
            onClick={() => setDismissed(true)}
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};