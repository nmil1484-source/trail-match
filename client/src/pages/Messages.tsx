import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Messages() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = 
    trpc.messages.getConversations.useQuery(undefined, {
      enabled: isAuthenticated,
      refetchInterval: 5000, // Poll every 5 seconds for new messages
    });

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = 
    trpc.messages.getMessages.useQuery(
      { conversationId: selectedConversationId! },
      { 
        enabled: !!selectedConversationId,
        refetchInterval: 3000, // Poll every 3 seconds when conversation is open
      }
    );

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationId) return;

    const selectedConvo = conversations?.find(c => c.conversation.id === selectedConversationId);
    if (!selectedConvo?.otherUser) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      receiverId: selectedConvo.otherUser.id,
      content: messageText.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to sign in to view your messages
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedConvo = conversations?.find(c => c.conversation.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="divide-y">
                  {conversations.map((convo) => {
                    const unreadCount = messages?.filter(
                      m => m.message.receiverId === user?.id && !m.message.isRead
                    ).length || 0;

                    return (
                      <button
                        key={convo.conversation.id}
                        onClick={() => setSelectedConversationId(convo.conversation.id)}
                        className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                          selectedConversationId === convo.conversation.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{convo.otherUser?.name || convo.otherUser?.email}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {new Date(convo.conversation.lastMessageAt).toLocaleDateString()}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation by expressing interest in a trip
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages View */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {selectedConvo ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle>{selectedConvo.otherUser?.name || selectedConvo.otherUser?.email}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <>
                      {messages.map((msg) => {
                        const isOwnMessage = msg.message.senderId === user?.id;
                        return (
                          <div
                            key={msg.message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                {new Date(msg.message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </CardContent>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      size="icon"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
