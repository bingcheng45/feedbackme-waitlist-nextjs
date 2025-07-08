'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  AlertTriangle,
  User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface CommentUser {
  id: string | null;
  name: string;
  email: string | null;
  image: string | null;
  isAuthenticated: boolean;
}

export interface CommentData {
  id: number;
  content: string;
  feedbackItemId: number;
  parentCommentId: number | null;
  isModerated: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replyCount?: number;
}

interface CommentItemProps {
  comment: CommentData;
  isProjectOwner: boolean;
  onUpdate: (commentId: number, updatedData: Partial<CommentData>) => void;
  onDelete: (commentId: number) => void;
  onReply: (parentCommentId: number) => void;
  depth?: number;
}

export function CommentItem({ 
  comment, 
  isProjectOwner, 
  onUpdate, 
  onDelete, 
  onReply, 
  depth = 0 
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  const isCommentOwner = session?.user?.id === comment.user.id;
  const canEdit = isCommentOwner && !comment.isModerated;
  const canDelete = isCommentOwner || isProjectOwner;
  const canModerate = isProjectOwner && !isCommentOwner;

  const maxDepth = 3; // Limit nesting depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : '';

  const handleEdit = async () => {
    if (editContent.trim().length < 5) {
      toast.error('Comment must be at least 5 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(comment.id, { content: editContent.trim() });
        setIsEditing(false);
        toast.success('Comment updated successfully');
      } else {
        toast.error(result.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Edit comment error:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        onDelete(comment.id);
        toast.success('Comment deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isModerated: !comment.isModerated,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(comment.id, { isModerated: !comment.isModerated });
        toast.success(comment.isModerated ? 'Comment unmarked for moderation' : 'Comment marked for moderation');
      } else {
        toast.error(result.error || 'Failed to moderate comment');
      }
    } catch (error) {
      console.error('Moderate comment error:', error);
      toast.error('Failed to moderate comment');
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

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className={`${indentClass} ${depth > 0 ? 'border-l-2 border-yellow-500/20 pl-4' : ''}`}>
      <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/20 hover:border-yellow-500/30 transition-all duration-300">
        <div className="p-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.image || ''} />
                <AvatarFallback className="bg-yellow-500/20 text-yellow-400">
                  {comment.user.isAuthenticated ? (
                    getUserInitials(comment.user.name)
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium text-sm">
                    {comment.user.name}
                  </span>
                  {!comment.user.isAuthenticated && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      Guest
                    </Badge>
                  )}
                  {comment.isModerated && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Moderated
                    </Badge>
                  )}
                </div>
                <span className="text-slate-400 text-xs">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {canEdit && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 p-0 hover:bg-yellow-500/20"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              {canModerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleModerate}
                  disabled={isLoading}
                  className="h-7 w-7 p-0 hover:bg-orange-500/20 text-orange-400"
                >
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="bg-black/20 border-yellow-500/20 text-white placeholder:text-slate-400 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {editContent.length}/500 characters
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="h-7 px-2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isLoading || editContent.trim().length < 5}
                    className="h-7 px-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          )}

          {/* Comment Footer */}
          {!isEditing && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(comment.id)}
                    className="h-7 px-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
                {comment.replyCount && comment.replyCount > 0 && (
                  <span className="text-xs text-slate-400">
                    {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 