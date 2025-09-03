import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const Messages = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with hosts and guests
        </p>
      </div>

      <Card className="p-12 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <CardHeader>
          <CardTitle>No messages yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Messages from hosts and guests will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;