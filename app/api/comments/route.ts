import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, feedbackItems, users } from '@/lib/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { commentSchema } from '@/lib/db/schema';

// GET /api/comments - Retrieve comments for a feedback item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackItemId = searchParams.get('feedbackItemId');
    const parentCommentId = searchParams.get('parentCommentId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!feedbackItemId || isNaN(parseInt(feedbackItemId))) {
      return NextResponse.json(
        { success: false, error: 'Feedback item ID is required' },
        { status: 400 }
      );
    }

    const feedbackId = parseInt(feedbackItemId);

    // First, verify the feedback item exists and is accessible
    const feedbackItem = await db
      .select({
        id: feedbackItems.id,
        projectId: feedbackItems.projectId,
      })
      .from(feedbackItems)
      .where(eq(feedbackItems.id, feedbackId))
      .limit(1);

    if (feedbackItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    // Build the query conditions
    let whereConditions;
    if (parentCommentId) {
      // Get replies to a specific comment
      whereConditions = and(
        eq(comments.feedbackItemId, feedbackId),
        eq(comments.parentCommentId, parseInt(parentCommentId)),
        eq(comments.isDeleted, false)
      );
    } else {
      // Get top-level comments (no parent)
      whereConditions = and(
        eq(comments.feedbackItemId, feedbackId),
        isNull(comments.parentCommentId),
        eq(comments.isDeleted, false)
      );
    }

    // Retrieve comments with user information
    const commentsData = await db
      .select({
        id: comments.id,
        content: comments.content,
        feedbackItemId: comments.feedbackItemId,
        userId: comments.userId,
        userEmail: comments.userEmail,
        userName: comments.userName,
        parentCommentId: comments.parentCommentId,
        isModerated: comments.isModerated,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        // User info from auth table
        authUserName: users.name,
        authUserImage: users.image,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(comments.createdAt))
      .limit(Math.min(limit, 100)); // Cap at 100

    // Transform the data to include proper user info
    const transformedComments = commentsData.map(comment => ({
      id: comment.id,
      content: comment.content,
      feedbackItemId: comment.feedbackItemId,
      parentCommentId: comment.parentCommentId,
      isModerated: comment.isModerated,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.userId,
        name: comment.authUserName || comment.userName || 'Anonymous',
        email: comment.userEmail,
        image: comment.authUserImage,
        isAuthenticated: !!comment.userId,
      },
    }));

    // For top-level comments, also get reply counts
    const commentsWithReplyCounts = await Promise.all(
      transformedComments.map(async (comment) => {
        if (!comment.parentCommentId) {
          // This is a top-level comment, get reply count
          const replyCount = await db
            .select({ count: comments.id })
            .from(comments)
            .where(and(
              eq(comments.parentCommentId, comment.id),
              eq(comments.isDeleted, false)
            ));
          
          return {
            ...comment,
            replyCount: replyCount.length,
          };
        }
        return comment;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithReplyCounts,
        total: commentsWithReplyCounts.length,
        feedbackItemId: feedbackId,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
      }
    });

  } catch (error) {
    console.error('Comments retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate the request body
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid comment data', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { content, feedbackItemId, parentCommentId, userEmail, userName } = validation.data;

    // Verify the feedback item exists and is accessible
    const feedbackItem = await db
      .select({
        id: feedbackItems.id,
        projectId: feedbackItems.projectId,
      })
      .from(feedbackItems)
      .where(eq(feedbackItems.id, feedbackItemId))
      .limit(1);

    if (feedbackItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    // If parentCommentId is provided, verify the parent comment exists
    if (parentCommentId) {
      const parentComment = await db
        .select({ id: comments.id })
        .from(comments)
        .where(and(
          eq(comments.id, parentCommentId),
          eq(comments.feedbackItemId, feedbackItemId),
          eq(comments.isDeleted, false)
        ))
        .limit(1);

      if (parentComment.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Prepare comment data
    const commentData = {
      content,
      feedbackItemId,
      parentCommentId: parentCommentId || null,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || userEmail || null,
      userName: session?.user?.name || userName || null,
      isModerated: false,
      isDeleted: false,
    };

    // Create the comment
    const newComment = await db
      .insert(comments)
      .values(commentData)
      .returning({
        id: comments.id,
        content: comments.content,
        feedbackItemId: comments.feedbackItemId,
        parentCommentId: comments.parentCommentId,
        userId: comments.userId,
        userEmail: comments.userEmail,
        userName: comments.userName,
        isModerated: comments.isModerated,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      });

    if (newComment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    const createdComment = newComment[0]!;

    // Get user info for response
    const userInfo = {
      id: createdComment.userId,
      name: createdComment.userName || 'Anonymous',
      email: createdComment.userEmail,
      image: null as string | null,
      isAuthenticated: !!createdComment.userId,
    };

    if (createdComment.userId) {
      const userDetails = await db
        .select({
          name: users.name,
          image: users.image,
        })
        .from(users)
        .where(eq(users.id, createdComment.userId))
        .limit(1);

      if (userDetails.length > 0) {
        const user = userDetails[0]!;
        const updatedUserInfo = {
          ...userInfo,
          name: user.name || userInfo.name,
          image: user.image,
        };
        console.log(`Comment created: ${createdComment.id} for feedback ${feedbackItemId} by ${updatedUserInfo.name}`);

        return NextResponse.json({
          success: true,
          data: {
            comment: {
              ...createdComment,
              user: updatedUserInfo,
              replyCount: 0, // New comment has no replies
            }
          }
        });
      }
    }

    console.log(`Comment created: ${createdComment.id} for feedback ${feedbackItemId} by ${userInfo.name}`);

    return NextResponse.json({
      success: true,
      data: {
        comment: {
          ...createdComment,
          user: userInfo,
          replyCount: 0, // New comment has no replies
        }
      }
    });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 