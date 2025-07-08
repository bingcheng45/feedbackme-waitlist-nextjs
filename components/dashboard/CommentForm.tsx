'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  X,
  User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CommentFormProps {
  feedbackItemId: number;
  parentCommentId?: number;
  onCommentCreated: (comment: any) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({ 
  feedbackItemId, 
  parentCommentId, 
  onCommentCreated, 
  onCancel,
  placeholder = "Add a comment...",
  autoFocus = false
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestFields, setShowGuestFields] = useState(!session?.user && !parentCommentId);

  const isReply = !!parentCommentId;
  const isAuthenticated = !!session?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length < 5) {
      toast.error('Comment must be at least 5 characters long');
      return;
    }

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: any = {
        content: content.trim(),
        feedbackItemId,
      };

      if (parentCommentId) {
        requestBody.parentCommentId = parentCommentId;
      }

      if (!isAuthenticated) {
        requestBody.userName = guestName.trim();
        requestBody.userEmail = guestEmail.trim();
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        onCommentCreated(result.data.comment);
        setContent('');
        setGuestName('');
        setGuestEmail('');
        toast.success(isReply ? 'Reply posted successfully' : 'Comment posted successfully');
        
        if (onCancel) {
          onCancel(); // Close reply form
        }
      } else {
        toast.error(result.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Comment creation error:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/20">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* User Info Header */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-yellow-500/20 text-yellow-400">
              {isAuthenticated && session?.user?.name ? (
                getUserInitials(session.user.name)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">
                {isAuthenticated ? session?.user?.name : 'Guest User'}
              </span>
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                  Guest
                </Badge>
              )}
            </div>
            <span className="text-slate-400 text-xs">
              {isReply ? 'Replying to comment' : 'Writing a comment'}
            </span>
          </div>
        </div>

        {/* Guest Info Fields */}
        {!isAuthenticated && (showGuestFields || isReply) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestName(e.target.value)}
              className="bg-black/20 border-yellow-500/20 text-white placeholder:text-slate-400"
              required={!isAuthenticated}
              maxLength={50}
            />
            <Input
              type="email"
              placeholder="Your email"
              value={guestEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestEmail(e.target.value)}
              className="bg-black/20 border-yellow-500/20 text-white placeholder:text-slate-400"
              required={!isAuthenticated}
            />
          </div>
        )}

        {/* Comment Content */}
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder={placeholder}
            className="bg-black/20 border-yellow-500/20 text-white placeholder:text-slate-400 resize-none min-h-[100px]"
            rows={isReply ? 3 : 4}
            maxLength={500}
            autoFocus={autoFocus}
            required
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {content.length}/500 characters
            </span>
            <div className="flex space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-8 px-3 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || content.trim().length < 5 || (!isAuthenticated && (!guestName.trim() || !guestEmail.trim()))}
                className="h-8 px-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
              >
                <Send className="h-3 w-3 mr-1" />
                {isLoading ? 'Posting...' : (isReply ? 'Reply' : 'Comment')}
              </Button>
            </div>
          </div>
        </div>

        {/* Guest Info Toggle for Main Comments */}
        {!isAuthenticated && !isReply && !showGuestFields && (
          <div className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGuestFields(true)}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            >
              Add your name and email
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
} 