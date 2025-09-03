import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react";

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setConnectionStatus('loading');
    setError(null);
    
    try {
      // Test basic connection by checking auth status
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      // Even if auth returns an error (like no session), as long as we can make the call,
      // it means our Supabase client is configured correctly
      const isConnected = !authError || authError.message === 'Invalid JWT: JWTExpired' || authError.message.includes('session');
      
      if (!isConnected) {
        throw new Error(`Connection failed: ${authError?.message}`);
      }

      // Set project info (using hardcoded URL from client config)
      setProjectInfo({
        url: 'https://baigglncdwirfwlxagcl.supabase.co',
        connected: true,
        authUser: authUser?.user || null,
        clientConfigured: true
      });
      
      setConnectionStatus('connected');
    } catch (err: any) {
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Connection Status:</span>
          <div className="flex items-center gap-2">
            {connectionStatus === 'loading' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <Badge variant="secondary">Testing...</Badge>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="bg-green-500">Connected</Badge>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <Badge variant="destructive">Error</Badge>
              </>
            )}
          </div>
        </div>

        {projectInfo && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <strong>Project URL:</strong> {projectInfo.url}
            </div>
            <div className="text-sm">
              <strong>Auth Status:</strong> {projectInfo.authUser ? 'User session found' : 'No active session'}
            </div>
            <div className="text-sm">
              <strong>Client:</strong> {projectInfo.clientConfigured ? 'Properly configured' : 'Configuration issue'}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={connectionStatus === 'loading'}
          className="w-full"
        >
          {connectionStatus === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Connection Again'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;