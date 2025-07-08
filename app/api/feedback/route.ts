import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { feedbackItems, projects } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const feedbackSubmissionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  type: z.enum(['feature', 'bug', 'improvement'], { 
    errorMap: () => ({ message: 'Type must be feature, bug, or improvement' })
  }),
  projectId: z.number().int().positive('Invalid project ID'),
});

const feedbackQuerySchema = z.object({
  projectId: z.string().transform((val) => parseInt(val, 10)),
  type: z.enum(['feature', 'bug', 'improvement']).optional(),
  status: z.enum(['open', 'in-progress', 'closed']).optional(),
  limit: z.string().transform((val) => Math.min(parseInt(val, 10) || 50, 100)).optional(),
});

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = feedbackSubmissionSchema.parse(body);

    // Verify the project exists and user has access to it
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedData.projectId))
      .limit(1);

    if (!project.length) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // For now, allow any authenticated user to submit feedback to any project
    // Later we can add permissions/access control based on project settings

    // Create the feedback item
    const result = await db
      .insert(feedbackItems)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        projectId: validatedData.projectId,
        userId: session.user.id,
        status: 'open',
        upvotes: 0,
        downvotes: 0,
      })
      .returning();

    const newFeedback = result[0];
    
    if (!newFeedback) {
      return NextResponse.json(
        { success: false, error: 'Failed to create feedback item' },
        { status: 500 }
      );
    }

    console.log('Created feedback item:', newFeedback.id);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: newFeedback.id,
        title: newFeedback.title,
        description: newFeedback.description,
        type: newFeedback.type,
        status: newFeedback.status,
        upvotes: newFeedback.upvotes,
        downvotes: newFeedback.downvotes,
        createdAt: newFeedback.createdAt,
        projectId: newFeedback.projectId,
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

    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET - Retrieve feedback for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      projectId: searchParams.get('projectId'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
    };

    // Filter out null values and validate
    const filteredQuery = Object.fromEntries(
      Object.entries(queryData).filter(([_, value]) => value !== null)
    );

    const validatedQuery = feedbackQuerySchema.parse(filteredQuery);

    if (!validatedQuery.projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedQuery.projectId))
      .limit(1);

    if (!project.length) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Build the query conditions
    const conditions: any[] = [eq(feedbackItems.projectId, validatedQuery.projectId)];
    
    if (validatedQuery.type) {
      conditions.push(eq(feedbackItems.type, validatedQuery.type));
    }
    
    if (validatedQuery.status) {
      conditions.push(eq(feedbackItems.status, validatedQuery.status));
    }

    // Fetch feedback items
    const feedback = await db
      .select({
        id: feedbackItems.id,
        title: feedbackItems.title,
        description: feedbackItems.description,
        type: feedbackItems.type,
        status: feedbackItems.status,
        upvotes: feedbackItems.upvotes,
        downvotes: feedbackItems.downvotes,
        createdAt: feedbackItems.createdAt,
        userId: feedbackItems.userId,
      })
      .from(feedbackItems)
      .where(and(...conditions))
      .orderBy(desc(feedbackItems.createdAt))
      .limit(validatedQuery.limit || 50);

    console.log(`Retrieved ${feedback.length} feedback items for project ${validatedQuery.projectId}`);

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        count: feedback.length,
        projectId: validatedQuery.projectId,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve feedback' },
      { status: 500 }
    );
  }
} 