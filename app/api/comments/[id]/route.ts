import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, feedbackItems, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateCommentSchema = z.object({
  content: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment must be less than 500 characters").trim().optional(),
  isModerated: z.boolean().optional(),
});

// PATCH /api/comments/[id] - Update comment (content or moderation status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const commentId = parseInt(resolvedParams.id);
    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = updateCommentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Get comment with project ownership info
    const commentWithProject = await db
      .select({
        commentId: comments.id,
        commentUserId: comments.userId,
        commentContent: comments.content,
        commentIsDeleted: comments.isDeleted,
        feedbackItemId: comments.feedbackItemId,
        projectOwnerId: projects.userId,
      })
      .from(comments)
      .innerJoin(feedbackItems, eq(comments.feedbackItemId, feedbackItems.id))
      .innerJoin(projects, eq(feedbackItems.projectId, projects.id))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentWithProject.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = commentWithProject[0]!;

    // Check permissions
    const isCommentOwner = comment.commentUserId === session.user.id;
    const isProjectOwner = comment.projectOwnerId === session.user.id;

    // Only comment owner can edit content, only project owner can moderate
    if (updateData.content && !isCommentOwner) {
      return NextResponse.json(
        { success: false, error: 'Only comment owner can edit content' },
        { status: 403 }
      );
    }

    if (updateData.isModerated !== undefined && !isProjectOwner) {
      return NextResponse.json(
        { success: false, error: 'Only project owner can moderate comments' },
        { status: 403 }
      );
    }

    // Check if comment is deleted
    if (comment.commentIsDeleted) {
      return NextResponse.json(
        { success: false, error: 'Cannot update deleted comment' },
        { status: 410 }
      );
    }

    // Prepare update data
    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (updateData.content !== undefined) {
      updateFields.content = updateData.content;
    }

    if (updateData.isModerated !== undefined) {
      updateFields.isModerated = updateData.isModerated;
    }

    // Update the comment
    const updatedComment = await db
      .update(comments)
      .set(updateFields)
      .where(eq(comments.id, commentId))
      .returning({
        id: comments.id,
        content: comments.content,
        isModerated: comments.isModerated,
        updatedAt: comments.updatedAt,
      });

    if (updatedComment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update comment' },
        { status: 500 }
      );
    }

    console.log(`Comment ${commentId} updated by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        comment: updatedComment[0],
        previousContent: updateData.content ? comment.commentContent : undefined,
      }
    });

  } catch (error) {
    console.error('Comment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Soft delete comment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const commentId = parseInt(resolvedParams.id);
    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    // Get comment with project ownership info
    const commentWithProject = await db
      .select({
        commentId: comments.id,
        commentUserId: comments.userId,
        commentIsDeleted: comments.isDeleted,
        feedbackItemId: comments.feedbackItemId,
        projectOwnerId: projects.userId,
      })
      .from(comments)
      .innerJoin(feedbackItems, eq(comments.feedbackItemId, feedbackItems.id))
      .innerJoin(projects, eq(feedbackItems.projectId, projects.id))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentWithProject.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = commentWithProject[0]!;

    // Check permissions - comment owner or project owner can delete
    const isCommentOwner = comment.commentUserId === session.user.id;
    const isProjectOwner = comment.projectOwnerId === session.user.id;

    if (!isCommentOwner && !isProjectOwner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this comment' },
        { status: 403 }
      );
    }

    // Check if already deleted
    if (comment.commentIsDeleted) {
      return NextResponse.json(
        { success: false, error: 'Comment already deleted' },
        { status: 410 }
      );
    }

    // Soft delete the comment
    const deletedComment = await db
      .update(comments)
      .set({ 
        isDeleted: true,
        content: '[deleted]',
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId))
      .returning({
        id: comments.id,
        isDeleted: comments.isDeleted,
        updatedAt: comments.updatedAt,
      });

    if (deletedComment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    console.log(`Comment ${commentId} deleted by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        comment: deletedComment[0],
        deletedBy: isProjectOwner ? 'project_owner' : 'comment_owner',
      }
    });

  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 