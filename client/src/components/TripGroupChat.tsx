import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface TripGroupChatProps {
  tripId: number;
  tripTitle: string;
}

export default function TripGroupChat({ tripId, tripTitle }: TripGroupChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = trpc.messages.getTripGroupMessages.useQuery({ tripId });
  
  const sendMessageMutation = trpc.messages.sendTripGroupMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ tripId, content: message.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Group Chat
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Chat with all participants of {tripTitle}
        </p>
      </CardHeader>
      <CardContent>
        {/* Messages Area */}
        <div className="border rounded-lg mb-4 h-96 overflow-y-auto p-4 bg-muted/30">
          {!messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div key={msg.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{msg.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
