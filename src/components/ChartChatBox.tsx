import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChartChatBoxProps {
  chartTitle: string;
}

const ChartChatBox: React.FC<ChartChatBoxProps> = ({ chartTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Placeholder: simulate assistant response
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `[GenAI endpoint not connected yet] You asked about "${chartTitle}": "${userMsg.content}"` },
      ]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
          title={`Chat about ${chartTitle}`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ask about: {chartTitle}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ask any question about this chart or metric.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 pt-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartChatBox;
