import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { feedbackItems, votes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const voteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote'], {
    errorMap: () => ({ message: 'Vote type must be upvote or downvote' })
  }),
});

// POST - Vote on a feedback item
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const feedbackId = parseInt(resolvedParams.id, 10);
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    // Check if feedback item exists
    const [feedback] = await db
      .select()
      .from(feedbackItems)
      .where(eq(feedbackItems.id, feedbackId))
      .limit(1);

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    // Check if user has already voted on this feedback
    const existingVote = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.userId, session.user.id),
        eq(votes.feedbackItemId, feedbackId)
      ))
      .limit(1);

    let voteAction = '';
    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote.length > 0) {
      const currentVote = existingVote[0]!;
      
      if (currentVote.voteType === validatedData.voteType) {
        // Remove vote (toggle off)
        await db
          .delete(votes)
          .where(eq(votes.id, currentVote.id));
        
        if (validatedData.voteType === 'upvote') {
          upvoteChange = -1;
          voteAction = 'removed upvote';
        } else {
          downvoteChange = -1;
          voteAction = 'removed downvote';
        }
      } else {
        // Change vote type
        await db
          .update(votes)
          .set({ 
            voteType: validatedData.voteType,
            createdAt: new Date()
          })
          .where(eq(votes.id, currentVote.id));
        
        if (validatedData.voteType === 'upvote') {
          upvoteChange = 1;
          downvoteChange = -1;
          voteAction = 'changed to upvote';
        } else {
          upvoteChange = -1;
          downvoteChange = 1;
          voteAction = 'changed to downvote';
        }
      }
    } else {
      // Create new vote
      await db
        .insert(votes)
        .values({
          userId: session.user.id,
          feedbackItemId: feedbackId,
          voteType: validatedData.voteType,
        });
      
      if (validatedData.voteType === 'upvote') {
        upvoteChange = 1;
        voteAction = 'added upvote';
      } else {
        downvoteChange = 1;
        voteAction = 'added downvote';
      }
    }

    // Update vote counts on feedback item
    const newUpvotes = Math.max(0, feedback.upvotes + upvoteChange);
    const newDownvotes = Math.max(0, feedback.downvotes + downvoteChange);
    
    const [updatedFeedback] = await db
      .update(feedbackItems)
      .set({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      })
      .where(eq(feedbackItems.id, feedbackId))
      .returning();

    if (!updatedFeedback) {
      return NextResponse.json(
        { success: false, error: 'Failed to update vote counts' },
        { status: 500 }
      );
    }

    console.log(`User ${session.user.id} ${voteAction} on feedback ${feedbackId}`);

    return NextResponse.json({
      success: true,
      message: `Vote ${voteAction} successfully`,
      data: {
        feedbackId: feedbackId,
        upvotes: updatedFeedback.upvotes,
        downvotes: updatedFeedback.downvotes,
        userVote: voteAction.includes('removed') ? null : validatedData.voteType,
        action: voteAction,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error('Vote submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

// GET - Get current user's vote on a feedback item
export async function GET(
  _: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const feedbackId = parseInt(resolvedParams.id, 10);
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      );
    }

    // Check if feedback item exists and get current vote counts
    const [feedback] = await db
      .select({
        id: feedbackItems.id,
        upvotes: feedbackItems.upvotes,
        downvotes: feedbackItems.downvotes,
      })
      .from(feedbackItems)
      .where(eq(feedbackItems.id, feedbackId))
      .limit(1);

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    // Get user's current vote
    const [userVote] = await db
      .select({
        voteType: votes.voteType,
        createdAt: votes.createdAt,
      })
      .from(votes)
      .where(and(
        eq(votes.userId, session.user.id),
        eq(votes.feedbackItemId, feedbackId)
      ))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        feedbackId: feedbackId,
        upvotes: feedback.upvotes,
        downvotes: feedback.downvotes,
        userVote: userVote?.voteType || null,
        votedAt: userVote?.createdAt || null,
      }
    });

  } catch (error) {
    console.error('Vote retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve vote information' },
      { status: 500 }
    );
  }
} 