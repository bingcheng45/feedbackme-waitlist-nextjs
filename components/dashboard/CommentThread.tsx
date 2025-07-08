'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CommentItem, CommentData } from './CommentItem';
import { CommentForm } from './CommentForm';
import { toast } from 'sonner';

interface CommentThreadProps {
  feedbackItemId: number;
  isProjectOwner: boolean;
}

interface CommentWithReplies extends CommentData {
  replies?: CommentData[];
  isLoadingReplies?: boolean;
  showReplies?: boolean;
}

export function CommentThread({ 
  feedbackItemId, 
  isProjectOwner
}: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments?feedbackItemId=${feedbackItemId}&limit=50`);
      const result = await response.json();

      if (result.success) {
        const commentsWithReplies = result.data.comments.map((comment: CommentData) => ({
          ...comment,
          replies: [],
          isLoadingReplies: false,
          showReplies: false,
        }));
        setComments(commentsWithReplies);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Load comments error:', error);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [feedbackItemId]);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const loadReplies = async (parentCommentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === parentCommentId 
        ? { ...comment, isLoadingReplies: true }
        : comment
    ));

    try {
      const response = await fetch(`/api/comments?feedbackItemId=${feedbackItemId}&parentCommentId=${parentCommentId}&limit=20`);
      const result = await response.json();

      if (result.success) {
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { 
                ...comment, 
                replies: result.data.comments,
                isLoadingReplies: false,
                showReplies: true
              }
            : comment
        ));
      } else {
        toast.error(result.error || 'Failed to load replies');
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { ...comment, isLoadingReplies: false }
            : comment
        ));
      }
    } catch (error) {
      console.error('Load replies error:', error);
      toast.error('Failed to load replies');
      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, isLoadingReplies: false }
          : comment
      ));
    }
  };

  const handleCommentCreated = (newComment: CommentData) => {
    if (newComment.parentCommentId) {
      // This is a reply - add it to the parent's replies
      setComments(prev => prev.map(comment => {
        if (comment.id === newComment.parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment],
            replyCount: (comment.replyCount || 0) + 1,
            showReplies: true
          };
        }
        return comment;
      }));
    } else {
      // This is a top-level comment
      const commentWithReplies: CommentWithReplies = {
        ...newComment,
        replies: [],
        isLoadingReplies: false,
        showReplies: false,
      };
      setComments(prev => [commentWithReplies, ...prev]);
    }
    
    // Close reply form
    setReplyingTo(null);
  };

  const handleCommentUpdate = (commentId: number, updatedData: Partial<CommentData>) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, ...updatedData };
      }
      // Check if it's a reply
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => 
          reply.id === commentId ? { ...reply, ...updatedData } : reply
        );
        return { ...comment, replies: updatedReplies };
      }
      return comment;
    }));
  };

  const handleCommentDelete = (commentId: number) => {
    setComments(prev => {
      // First, check if it's a top-level comment
      const topLevelComment = prev.find(c => c.id === commentId);
      if (topLevelComment) {
        return prev.filter(c => c.id !== commentId);
      }
      
      // Otherwise, it's a reply - remove from the parent's replies
      return prev.map(comment => {
        if (comment.replies) {
          const updatedReplies = comment.replies.filter(reply => reply.id !== commentId);
          return { 
            ...comment, 
            replies: updatedReplies,
            replyCount: Math.max((comment.replyCount || 1) - 1, 0)
          };
        }
        return comment;
      });
    });
  };

  const handleReply = (parentCommentId: number) => {
    setReplyingTo(parentCommentId);
    
    // Load replies if not already loaded
    const parentComment = comments.find(c => c.id === parentCommentId);
    if (parentComment && !parentComment.showReplies && (parentComment.replyCount || 0) > 0) {
      loadReplies(parentCommentId);
    }
  };

  const toggleReplies = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (!comment.showReplies && (!comment.replies || comment.replies.length === 0)) {
      // Load replies for the first time
      loadReplies(commentId);
    } else {
      // Just toggle visibility
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, showReplies: !c.showReplies }
          : c
      ));
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/20">
        <div className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-400" />
          <p className="text-slate-400">Loading comments...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/40 backdrop-blur-xl border border-red-500/20">
        <div className="p-8 text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={loadComments} 
            variant="outline" 
            size="sm"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-yellow-400" />
            Comments
          </h3>
          <Badge variant="outline" className="border-yellow-500/20 text-yellow-400">
            {comments.length}
          </Badge>
        </div>
        
        {!showCommentForm && (
          <Button
            onClick={() => setShowCommentForm(true)}
            size="sm"
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <CommentForm
          feedbackItemId={feedbackItemId}
          onCommentCreated={handleCommentCreated}
          onCancel={() => setShowCommentForm(false)}
          autoFocus={true}
        />
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/20">
          <div className="p-8 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-slate-400" />
            <p className="text-slate-400 mb-4">No comments yet</p>
            <p className="text-slate-500 text-sm">
              Be the first to share your thoughts on this feedback
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <CommentItem
                comment={comment}
                isProjectOwner={isProjectOwner}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
                onReply={handleReply}
                depth={0}
              />

              {/* Replies Toggle */}
              {(comment.replyCount || 0) > 0 && (
                <div className="ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                    disabled={comment.isLoadingReplies}
                  >
                    {comment.isLoadingReplies ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : comment.showReplies ? (
                      <ChevronUp className="h-3 w-3 mr-2" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-2" />
                    )}
                    {comment.showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                  </Button>
                </div>
              )}

              {/* Replies */}
              {comment.showReplies && comment.replies && (
                <div className="ml-4 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isProjectOwner={isProjectOwner}
                      onUpdate={handleCommentUpdate}
                      onDelete={handleCommentDelete}
                      onReply={handleReply}
                      depth={1}
                    />
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-4">
                  <CommentForm
                    feedbackItemId={feedbackItemId}
                    parentCommentId={comment.id}
                    onCommentCreated={handleCommentCreated}
                    onCancel={() => setReplyingTo(null)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    autoFocus={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 