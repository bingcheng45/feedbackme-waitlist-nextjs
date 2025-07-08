import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, feedbackItems } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { FeedbackManagement } from '@/components/dashboard/FeedbackManagement';
import { ProjectStats } from '@/components/dashboard/ProjectStats';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  
  if (!session?.user?.id) {
    redirect('/');
  }

  const projectId = parseInt(resolvedParams.id);
  
  if (isNaN(projectId)) {
    redirect('/dashboard');
  }

  // Fetch project details
  const project = await db
    .select()
    .from(projects)
    .where(and(
      eq(projects.id, projectId),
      eq(projects.userId, session.user.id)
    ))
    .limit(1)
    .then(results => results[0]);

  if (!project) {
    redirect('/dashboard');
  }

  // Fetch project statistics
  const stats = await db
    .select({
      totalFeedback: sql<number>`count(*)`.mapWith(Number),
      totalVotes: sql<number>`sum(${feedbackItems.upvotes} + ${feedbackItems.downvotes})`.mapWith(Number),
      featureRequests: sql<number>`count(*) filter (where ${feedbackItems.type} = 'feature')`.mapWith(Number),
      bugReports: sql<number>`count(*) filter (where ${feedbackItems.type} = 'bug')`.mapWith(Number),
      improvements: sql<number>`count(*) filter (where ${feedbackItems.type} = 'improvement')`.mapWith(Number),
      openItems: sql<number>`count(*) filter (where ${feedbackItems.status} = 'open')`.mapWith(Number),
      inProgressItems: sql<number>`count(*) filter (where ${feedbackItems.status} = 'in-progress')`.mapWith(Number),
      closedItems: sql<number>`count(*) filter (where ${feedbackItems.status} = 'closed')`.mapWith(Number),
    })
    .from(feedbackItems)
    .where(eq(feedbackItems.projectId, projectId))
    .then(results => results[0] || {
      totalFeedback: 0,
      totalVotes: 0,
      featureRequests: 0,
      bugReports: 0,
      improvements: 0,
      openItems: 0,
      inProgressItems: 0,
      closedItems: 0,
    });

  // Fetch recent feedback items
  const recentFeedbackData = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      description: feedbackItems.description,
      type: feedbackItems.type,
      status: feedbackItems.status,
      upvotes: feedbackItems.upvotes,
      downvotes: feedbackItems.downvotes,
      createdAt: feedbackItems.createdAt,
    })
    .from(feedbackItems)
    .where(eq(feedbackItems.projectId, projectId))
    .orderBy(desc(feedbackItems.createdAt))
    .limit(50);

  // Transform to match the expected interface
  const recentFeedback = recentFeedbackData.map(item => ({
    ...item,
    type: item.type as 'feature' | 'bug' | 'improvement',
    status: item.status as 'open' | 'in-progress' | 'closed',
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-feedbackme-yellow hover:text-feedbackme-amber transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">{project.name}</h1>
          <p className="text-slate-300">
            Manage feedback for {project.domain}
          </p>
        </div>

        {/* Project Stats */}
        <div className="mb-8">
          <ProjectStats 
            project={project}
            stats={stats}
          />
        </div>

        {/* Feedback Management */}
        <div className="glass-morphism rounded-2xl p-6 sm:p-8">
          <FeedbackManagement 
            projectId={projectId}
            initialFeedback={recentFeedback}
          />
        </div>
      </div>
    </div>
  );
} 