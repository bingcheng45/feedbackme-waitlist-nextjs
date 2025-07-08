import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { feedbackItems, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in-progress', 'closed'])
});

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

    const feedbackId = parseInt(resolvedParams.id);
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status value', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // First, get the feedback item and verify the user owns the project
    const feedbackWithProject = await db
      .select({
        feedbackId: feedbackItems.id,
        feedbackStatus: feedbackItems.status,
        projectId: feedbackItems.projectId,
        projectOwnerId: projects.userId,
      })
      .from(feedbackItems)
      .innerJoin(projects, eq(feedbackItems.projectId, projects.id))
      .where(eq(feedbackItems.id, feedbackId))
      .limit(1);

    if (feedbackWithProject.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackWithProject[0]!;

    // Check if the user owns the project
    if (feedback.projectOwnerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this feedback' },
        { status: 403 }
      );
    }

    // Update the feedback status
    const updateResult = await db
      .update(feedbackItems)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(feedbackItems.id, feedbackId))
      .returning({
        id: feedbackItems.id,
        status: feedbackItems.status,
        updatedAt: feedbackItems.updatedAt
      });

    if (updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update feedback status' },
        { status: 500 }
      );
    }

    console.log(`Feedback ${feedbackId} status updated to ${status} by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: feedbackId,
        status,
        previousStatus: feedback.feedbackStatus,
        updatedAt: updateResult[0]?.updatedAt || new Date()
      }
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 